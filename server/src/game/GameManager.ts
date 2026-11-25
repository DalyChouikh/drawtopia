import { randomUUID } from 'node:crypto';
import type { RoomSnapshot } from '@drawtopia/shared';
import type { RoomManager } from '../rooms/RoomManager';
import type { GameServer } from '../socket/types';
import { DrawGuessGame } from './DrawGuessGame';
import { DrawPassGame } from './DrawPassGame';
import type { FeedTarget, GameDeps, GameEvents, GamePlayer } from './types';

export type AnyGame = DrawGuessGame | DrawPassGame;

/** Socket.IO channel that only one player's socket joins. */
export const playerChannel = (playerId: string) => `player:${playerId}`;

/** Keeps the running game of each room and connects game events to Socket.IO. */
export class GameManager {
  private readonly games = new Map<string, { game: AnyGame; playerIds: string[] }>();

  constructor(
    private readonly io: GameServer,
    private readonly rooms: RoomManager,
    private readonly deps: GameDeps = { now: Date.now, rng: Math.random, newId: randomUUID },
  ) {}

  /** Starts the game of a room that just switched to "playing". */
  start(room: RoomSnapshot): void {
    this.dispose(room.code);
    const players: GamePlayer[] = room.players
      .filter((p) => p.connected)
      .map(({ id, nickname, color }) => ({ id, nickname, color }));
    const playerIds = players.map((p) => p.id);
    const events = this.eventsFor(room.code, playerIds);

    const game =
      room.settings.mode === 'draw-guess'
        ? new DrawGuessGame(players, room.settings, events, this.deps)
        : new DrawPassGame(players, room.settings, events, this.deps);
    this.games.set(room.code, { game, playerIds });
    game.start();
  }

  get(roomCode: string | undefined): AnyGame | undefined {
    return roomCode === undefined ? undefined : this.games.get(roomCode)?.game;
  }

  setConnected(roomCode: string, playerId: string, connected: boolean): void {
    this.get(roomCode)?.setConnected(playerId, connected);
  }

  /** Re-sends a player their current view (after a reconnect). */
  sendViewTo(roomCode: string, playerId: string): void {
    const game = this.get(roomCode);
    if (game) this.io.to(playerChannel(playerId)).emit('game:state', game.viewFor(playerId));
  }

  dispose(roomCode: string): void {
    this.games.get(roomCode)?.game.dispose();
    this.games.delete(roomCode);
  }

  disposeAll(): void {
    [...this.games.keys()].forEach((code) => this.dispose(code));
  }

  private eventsFor(roomCode: string, playerIds: string[]): GameEvents {
    return {
      stateChanged: () => {
        const game = this.get(roomCode);
        if (!game) return;
        // Personalized views: each player only receives what they are allowed to see.
        for (const id of playerIds) {
          this.io.to(playerChannel(id)).emit('game:state', game.viewFor(id));
        }
      },
      feed: (event, target?: FeedTarget) => {
        if (target && 'only' in target)
          this.io.to(playerChannel(target.only)).emit('game:feed', event);
        else if (target && 'except' in target)
          this.io.to(roomCode).except(playerChannel(target.except)).emit('game:feed', event);
        else this.io.to(roomCode).emit('game:feed', event);
      },
      finished: () => {
        // The room goes back to the lobby so the host can start another game.
        const room = this.rooms.endGame(roomCode);
        if (room) this.io.to(roomCode).emit('room:updated', room);
      },
    };
  }
}
