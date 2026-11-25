/**
 * Domain model of DrawTopia. These are the shapes the server stores and the app displays.
 * Vocabulary is defined in shared/GLOSSARY.md.
 */
import type { AVATAR_COLORS, ROUND_DURATIONS } from './constants';

export type GameMode = 'draw-guess' | 'draw-pass';
export type RoomVisibility = 'public' | 'private';
export type RoomStatus = 'lobby' | 'playing' | 'finished';
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export type RoundDuration = (typeof ROUND_DURATIONS)[number];

/** What a player chooses about themselves (saved on the phone). */
export interface PlayerProfile {
  nickname: string;
  color: AvatarColor;
}

export interface Player extends PlayerProfile {
  id: string;
  score: number;
  connected: boolean;
  /** Join timestamp (ms); the oldest player becomes host when the host leaves. */
  joinedAt: number;
}

export interface RoomSettings {
  mode: GameMode;
  visibility: RoomVisibility;
  /** Seconds per Draw & Guess round or per Draw & Pass step. */
  roundDuration: RoundDuration;
  /** Draw & Guess: how many times each player draws. Ignored by Draw & Pass. */
  rounds: number;
}

/** Room state as every member of the room sees it. Never contains a secret word. */
export interface RoomSnapshot {
  code: string;
  hostId: string;
  status: RoomStatus;
  settings: RoomSettings;
  players: Player[];
}

/** One line in the public room browser. */
export interface PublicRoomSummary {
  code: string;
  mode: GameMode;
  hostNickname: string;
  playerCount: number;
  maxPlayers: number;
}

/**
 * A stroke drawn on the canvas. Coordinates are normalized to 0..1 so a drawing
 * looks the same on every screen size. Points are stored flat: [x0, y0, x1, y1, …].
 */
export interface Stroke {
  id: string;
  color: string;
  size: number;
  points: number[];
}

/** Draw & Pass: one entry of a chain is either a written sentence or a drawing. */
export type ChainEntry =
  | { kind: 'text'; authorId: string; text: string }
  | { kind: 'drawing'; authorId: string; strokes: Stroke[] };

/** Draw & Pass: the chain started by one player, passed around the room. */
export interface PassChain {
  ownerId: string;
  entries: ChainEntry[];
}

/** Summary of a finished game, stored in the local history on the phone. */
export interface GameResult {
  id: string;
  finishedAt: number;
  mode: GameMode;
  players: Pick<Player, 'id' | 'nickname' | 'color' | 'score'>[];
  /** Only for Draw & Pass. */
  chains?: PassChain[];
}
