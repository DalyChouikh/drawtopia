import { type PlayerProfile, type RoomSettings, createSeededRng } from '@drawtopia/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoomManager } from './RoomManager';

const settings: RoomSettings = {
  mode: 'draw-guess',
  visibility: 'public',
  roundDuration: 60,
  rounds: 2,
};
const profile = (nickname: string): PlayerProfile => ({ nickname, color: '#3D7BFF' });

/** Deterministic manager: ids p1, p2…, clock ticks 1 ms per player, seeded room codes. */
function makeManager() {
  let id = 0;
  let clock = 0;
  return new RoomManager({ newId: () => `p${++id}`, now: () => ++clock, rng: createSeededRng(1) });
}

function unwrap<T>(result: { ok: true; value: T } | { ok: false; error: string }): T {
  if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
  return result.value;
}

describe('RoomManager', () => {
  let rooms: RoomManager;
  let code: string;

  beforeEach(() => {
    rooms = makeManager();
    code = unwrap(rooms.createRoom(profile('Host'), settings)).room.code;
  });

  it('creates a room in the lobby with the creator as host', () => {
    const room = rooms.getRoomOf('p1')!;
    expect(room).toMatchObject({ code, hostId: 'p1', status: 'lobby' });
    expect(code).toMatch(/^[A-Z2-9]{4}$/);
  });

  it('lets players join by code and lists the room publicly', () => {
    unwrap(rooms.joinRoom(code, profile('Nova')));
    expect(rooms.listPublicRooms()).toEqual([
      { code, mode: 'draw-guess', hostNickname: 'Host', playerCount: 2, maxPlayers: 8 },
    ]);
  });

  it('hides private rooms from the public list', () => {
    unwrap(rooms.createRoom(profile('Secret'), { ...settings, visibility: 'private' }));
    expect(rooms.listPublicRooms()).toHaveLength(1);
  });

  it('rejects an unknown room code (negative)', () => {
    expect(rooms.joinRoom('ZZZZ', profile('Nova'))).toEqual({ ok: false, error: 'ROOM_NOT_FOUND' });
  });

  it('rejects a nickname already used in the room, ignoring case (negative)', () => {
    expect(rooms.joinRoom(code, profile('hOsT'))).toEqual({ ok: false, error: 'NICKNAME_TAKEN' });
  });

  it('rejects a 9th player', () => {
    for (let i = 2; i <= 8; i++) unwrap(rooms.joinRoom(code, profile(`Player${i}`)));
    expect(rooms.joinRoom(code, profile('Late'))).toEqual({ ok: false, error: 'ROOM_FULL' });
  });

  it('refuses to start with fewer than 3 players (negative)', () => {
    unwrap(rooms.joinRoom(code, profile('Nova')));
    expect(rooms.startGame('p1')).toEqual({ ok: false, error: 'NOT_ENOUGH_PLAYERS' });
  });

  it('only lets the host start or change settings', () => {
    unwrap(rooms.joinRoom(code, profile('Nova')));
    unwrap(rooms.joinRoom(code, profile('Mia')));
    expect(rooms.startGame('p2')).toEqual({ ok: false, error: 'NOT_HOST' });
    expect(rooms.updateSettings('p2', { roundDuration: 30 })).toEqual({
      ok: false,
      error: 'NOT_HOST',
    });

    expect(unwrap(rooms.updateSettings('p1', { roundDuration: 30 })).settings.roundDuration).toBe(
      30,
    );
    expect(unwrap(rooms.startGame('p1')).status).toBe('playing');
  });

  it('closes the room to new players once the game started', () => {
    unwrap(rooms.joinRoom(code, profile('Nova')));
    unwrap(rooms.joinRoom(code, profile('Mia')));
    unwrap(rooms.startGame('p1'));
    expect(rooms.joinRoom(code, profile('Late'))).toEqual({
      ok: false,
      error: 'GAME_ALREADY_STARTED',
    });
    expect(rooms.listPublicRooms()).toEqual([]);
  });

  it('gives the host role to the oldest player when the host leaves', () => {
    unwrap(rooms.joinRoom(code, profile('Nova')));
    unwrap(rooms.joinRoom(code, profile('Mia')));
    expect(unwrap(rooms.leaveRoom('p1'))?.hostId).toBe('p2');
  });

  it('deletes the room when the last player leaves', () => {
    expect(unwrap(rooms.leaveRoom('p1'))).toBeNull();
    expect(rooms.roomCount).toBe(0);
    expect(rooms.leaveRoom('p1')).toEqual({ ok: false, error: 'NOT_IN_ROOM' });
  });

  it('keeps a disconnected player seat and score for a rejoin', () => {
    unwrap(rooms.joinRoom(code, profile('Nova')));
    const offline = rooms.setConnected('p2', false)!;
    expect(offline.players.find((p) => p.id === 'p2')?.connected).toBe(false);

    const back = unwrap(rooms.rejoinRoom(code, 'p2'));
    expect(back.room.players.find((p) => p.id === 'p2')?.connected).toBe(true);
    expect(rooms.rejoinRoom(code, 'nobody')).toEqual({ ok: false, error: 'NOT_IN_ROOM' });
  });

  it('counts only connected players when starting', () => {
    unwrap(rooms.joinRoom(code, profile('Nova')));
    unwrap(rooms.joinRoom(code, profile('Mia')));
    rooms.setConnected('p3', false);
    expect(rooms.startGame('p1')).toEqual({ ok: false, error: 'NOT_ENOUGH_PLAYERS' });
  });
});
