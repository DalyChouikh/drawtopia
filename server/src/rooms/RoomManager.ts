import { randomUUID } from 'node:crypto';
import {
  type JoinedRoom,
  MAX_PLAYERS,
  MIN_PLAYERS,
  type Player,
  type PlayerProfile,
  type PublicRoomSummary,
  type Result,
  type Rng,
  type RoomSettings,
  type RoomSnapshot,
  type RoomStatus,
  type UpdateSettingsPayload,
  err,
  ok,
} from '@drawtopia/shared';
import { generateRoomCode } from './roomCode';

interface Room {
  code: string;
  hostId: string;
  status: RoomStatus;
  settings: RoomSettings;
  /** Insertion order = join order. */
  players: Map<string, Player>;
}

export interface RoomManagerDeps {
  now: () => number;
  newId: () => string;
  rng: Rng;
}

const defaultDeps: RoomManagerDeps = { now: Date.now, newId: randomUUID, rng: Math.random };

/**
 * All room rules, with no networking: create, join, leave, host transfer, settings, start.
 * Every operation returns a `Result`, so the socket layer only translates it into an ack.
 */
export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  /** Which room each player is in (a player is in at most one room). */
  private readonly roomOfPlayer = new Map<string, string>();
  private readonly deps: RoomManagerDeps;

  constructor(deps: Partial<RoomManagerDeps> = {}) {
    this.deps = { ...defaultDeps, ...deps };
  }

  get roomCount(): number {
    return this.rooms.size;
  }

  createRoom(profile: PlayerProfile, settings: RoomSettings): Result<JoinedRoom> {
    const code = generateRoomCode(this.deps.rng, (c) => this.rooms.has(c));
    const host = this.newPlayer(profile);
    const room: Room = {
      code,
      hostId: host.id,
      status: 'lobby',
      settings,
      players: new Map([[host.id, host]]),
    };
    this.rooms.set(code, room);
    this.roomOfPlayer.set(host.id, code);
    return ok({ playerId: host.id, room: this.snapshot(room) });
  }

  joinRoom(code: string, profile: PlayerProfile): Result<JoinedRoom> {
    const room = this.rooms.get(code);
    if (!room) return err('ROOM_NOT_FOUND');
    if (room.status !== 'lobby') return err('GAME_ALREADY_STARTED');
    if (room.players.size >= MAX_PLAYERS) return err('ROOM_FULL');

    const wanted = profile.nickname.toLocaleLowerCase();
    const taken = [...room.players.values()].some((p) => p.nickname.toLocaleLowerCase() === wanted);
    if (taken) return err('NICKNAME_TAKEN');

    const player = this.newPlayer(profile);
    room.players.set(player.id, player);
    this.roomOfPlayer.set(player.id, code);
    return ok({ playerId: player.id, room: this.snapshot(room) });
  }

  /** A player who lost their connection takes their seat back (same id, same score). */
  rejoinRoom(code: string, playerId: string): Result<JoinedRoom> {
    const room = this.rooms.get(code);
    if (!room) return err('ROOM_NOT_FOUND');
    const player = room.players.get(playerId);
    if (!player) return err('NOT_IN_ROOM');
    player.connected = true;
    return ok({ playerId, room: this.snapshot(room) });
  }

  /** Removes the player. Returns the updated room, or `null` when the room became empty and was deleted. */
  leaveRoom(playerId: string): Result<RoomSnapshot | null> {
    const room = this.roomOf(playerId);
    if (!room) return err('NOT_IN_ROOM');

    room.players.delete(playerId);
    this.roomOfPlayer.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(room.code);
      return ok(null);
    }
    if (room.hostId === playerId) room.hostId = this.pickNewHost(room).id;
    return ok(this.snapshot(room));
  }

  /** Marks a player online/offline without removing them (they may come back). */
  setConnected(playerId: string, connected: boolean): RoomSnapshot | null {
    const room = this.roomOf(playerId);
    const player = room?.players.get(playerId);
    if (!room || !player) return null;
    player.connected = connected;
    if (!connected && room.hostId === playerId) {
      const onlinePlayer = [...room.players.values()].find((p) => p.connected);
      if (onlinePlayer) room.hostId = onlinePlayer.id;
    }
    return this.snapshot(room);
  }

  listPublicRooms(): PublicRoomSummary[] {
    return [...this.rooms.values()]
      .filter(
        (r) =>
          r.settings.visibility === 'public' &&
          r.status === 'lobby' &&
          r.players.size < MAX_PLAYERS,
      )
      .map((r) => ({
        code: r.code,
        mode: r.settings.mode,
        hostNickname: r.players.get(r.hostId)?.nickname ?? '',
        playerCount: r.players.size,
        maxPlayers: MAX_PLAYERS,
      }));
  }

  updateSettings(playerId: string, patch: UpdateSettingsPayload): Result<RoomSnapshot> {
    const room = this.roomOf(playerId);
    if (!room) return err('NOT_IN_ROOM');
    if (room.hostId !== playerId) return err('NOT_HOST');
    if (room.status !== 'lobby') return err('GAME_ALREADY_STARTED');
    room.settings = { ...room.settings, ...patch };
    return ok(this.snapshot(room));
  }

  startGame(playerId: string): Result<RoomSnapshot> {
    const room = this.roomOf(playerId);
    if (!room) return err('NOT_IN_ROOM');
    if (room.hostId !== playerId) return err('NOT_HOST');
    if (room.status !== 'lobby') return err('GAME_ALREADY_STARTED');
    const online = [...room.players.values()].filter((p) => p.connected).length;
    if (online < MIN_PLAYERS) return err('NOT_ENOUGH_PLAYERS');
    room.status = 'playing';
    return ok(this.snapshot(room));
  }

  getRoomOf(playerId: string): RoomSnapshot | undefined {
    const room = this.roomOf(playerId);
    return room && this.snapshot(room);
  }

  private roomOf(playerId: string): Room | undefined {
    const code = this.roomOfPlayer.get(playerId);
    return code === undefined ? undefined : this.rooms.get(code);
  }

  private newPlayer(profile: PlayerProfile): Player {
    return {
      ...profile,
      id: this.deps.newId(),
      score: 0,
      connected: true,
      joinedAt: this.deps.now(),
    };
  }

  /** The oldest connected player becomes host; if nobody is online, the oldest player. */
  private pickNewHost(room: Room): Player {
    const players = [...room.players.values()];
    return players.find((p) => p.connected) ?? players[0]!;
  }

  /** A copy that callers can send over the network without exposing internal state. */
  private snapshot(room: Room): RoomSnapshot {
    return {
      code: room.code,
      hostId: room.hostId,
      status: room.status,
      settings: { ...room.settings },
      players: [...room.players.values()].map((p) => ({ ...p })),
    };
  }
}
