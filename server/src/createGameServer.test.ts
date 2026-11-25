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
