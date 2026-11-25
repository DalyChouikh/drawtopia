import type { AddressInfo } from 'node:net';
import type { ClientToServerEvents, RoomSettings, ServerToClientEvents } from '@drawtopia/shared';
import { type Socket, io as connect } from 'socket.io-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type GameServerInstance, createGameServer } from './createGameServer';

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

const settings: RoomSettings = {
  mode: 'draw-guess',
  visibility: 'private',
  roundDuration: 60,
  rounds: 1,
};
const profile = (nickname: string) => ({ nickname, color: '#FF5A4E' as const });

describe('game server (real sockets)', () => {
  let server: GameServerInstance;
  let url: string;
  const clients: Client[] = [];

  const newClient = async (): Promise<Client> => {
    const client: Client = connect(url, { transports: ['websocket'], forceNew: true });
    clients.push(client);
    await new Promise<void>((resolve) => client.once('connect', () => resolve()));
    return client;
  };

  beforeEach(async () => {
    server = createGameServer({ reconnectGraceMs: 50 });
    await new Promise<void>((resolve) => server.httpServer.listen(0, resolve));
    url = `http://localhost:${(server.httpServer.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    clients.splice(0).forEach((c) => c.disconnect());
    await server.close();
  });

  it('answers the health check', async () => {
    const res = await fetch(`${url}/health`);
    expect(await res.json()).toEqual({ ok: true, rooms: 0 });
  });

  it('runs create → join → start for three players', async () => {
    const [host, nova, mia] = await Promise.all([newClient(), newClient(), newClient()]);

    const created = await host.emitWithAck('room:create', { profile: profile('Host'), settings });
    if (!created.ok) throw new Error(created.error);
    const { code } = created.value.room;

    expect((await nova.emitWithAck('room:join', { code, profile: profile('Nova') })).ok).toBe(true);

    // The host is told live that a third player arrived.
    const hostSeesMia = new Promise((resolve) =>
      host.on('room:updated', (room) => room.players.length === 3 && resolve(room)),
    );
    expect(
      (await mia.emitWithAck('room:join', { code: code.toLowerCase(), profile: profile('Mia') }))
        .ok,
    ).toBe(true);
    await hostSeesMia;

    const everyoneStarts = Promise.all(
      [host, nova, mia].map((c) => new Promise((resolve) => c.once('game:started', resolve))),
    );
    expect(await host.emitWithAck('room:start')).toEqual({ ok: true, value: null });
    await everyoneStarts;
  });

  it('plays a Draw & Guess turn end to end: word stays secret, guesses are scored', async () => {
    const [host, nova, mia] = await Promise.all([newClient(), newClient(), newClient()]);
    const created = await host.emitWithAck('room:create', { profile: profile('Host'), settings });
    if (!created.ok) throw new Error(created.error);
    const { code } = created.value.room;
    await nova.emitWithAck('room:join', { code, profile: profile('Nova') });
    await mia.emitWithAck('room:join', { code, profile: profile('Mia') });
    await host.emitWithAck('room:start');

    // The host draws first and is the only one offered words.
    const hostView = await host.emitWithAck('game:sync');
    const novaView = await nova.emitWithAck('game:sync');
    if (!hostView.ok || !novaView.ok || hostView.value.mode !== 'draw-guess') throw new Error();
    expect(novaView.value).toMatchObject({ phase: 'choosing' });
    expect('wordChoices' in novaView.value && novaView.value.wordChoices).toBeFalsy();
    const word = hostView.value.wordChoices![0]!;
    expect(await host.emitWithAck('game:choose-word', { word })).toEqual({ ok: true, value: null });

    // Strokes from the drawer reach the other players.
    const miaGetsStroke = new Promise((resolve) => mia.once('draw:stroke', resolve));
    host.emit('draw:stroke', {
      id: 's1',
      color: '#1A1A1A',
      size: 10,
      points: [0.1, 0.1, 0.2, 0.2],
    });
    await miaGetsStroke;

    // Live drawing: the drawer's in-progress points reach the others; a guesser's are dropped.
    const progress = {
      id: 'live-1',
      color: '#1A1A1A',
      size: 10 as const,
      points: [0.2, 0.2, 0.3, 0.3],
    };
    const miaGetsProgress = new Promise((resolve) => mia.once('draw:progress', resolve));
    host.emit('draw:progress', progress);
    expect(await miaGetsProgress).toEqual(progress);
    let hostGotGuesserProgress = false;
    host.once('draw:progress', () => (hostGotGuesserProgress = true));
    nova.emit('draw:progress', { ...progress, id: 'cheat' });
    await new Promise((r) => setTimeout(r, 100));
    expect(hostGotGuesserProgress).toBe(false);

    // Nobody but the drawer has the word; a correct guess is announced to the room.
    const miaSees = await mia.emitWithAck('game:sync');
    expect(miaSees.ok && 'word' in miaSees.value && miaSees.value.word).toBeFalsy();
    const announced = new Promise((resolve) =>
      mia.on('game:feed', (e) => e.kind === 'guessed' && resolve(e)),
    );
    expect(await nova.emitWithAck('game:guess', { text: word })).toEqual({
      ok: true,
      value: { verdict: 'correct' },
    });
    expect(await announced).toMatchObject({ kind: 'guessed' });
  });

  it('rejects a malformed payload without crashing (negative)', async () => {
    const client = await newClient();
    const result = await client.emitWithAck('room:join', {
      code: '??',
      profile: { nickname: '', color: 'red' },
    } as never);
    expect(result).toEqual({ ok: false, error: 'INVALID_PAYLOAD' });
    expect((await client.emitWithAck('room:list')).ok).toBe(true); // still alive
  });

  it('frees the seat after the reconnect grace period', async () => {
    const [host, nova] = await Promise.all([newClient(), newClient()]);
    const created = await host.emitWithAck('room:create', { profile: profile('Host'), settings });
    if (!created.ok) throw new Error(created.error);
    await nova.emitWithAck('room:join', {
      code: created.value.room.code,
      profile: profile('Nova'),
    });

    const novaRemoved = new Promise((resolve) =>
      host.on('room:updated', (room) => room.players.length === 1 && resolve(room)),
    );
    nova.disconnect();
    await novaRemoved;
  });
});
