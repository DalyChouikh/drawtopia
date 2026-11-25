import type {
  FeedEvent,
  GameMode,
  GameResult,
  GameView,
  PlayerProfile,
  Result,
  Rng,
} from '@drawtopia/shared';

export interface GamePlayer extends PlayerProfile {
  id: string;
}

/** Who receives a feed line: everyone, only one player, or everyone but one player. */
export type FeedTarget = { only: string } | { except: string } | undefined;

/** How a game talks to the outside world (the socket layer). */
export interface GameEvents {
  /** Views changed: the socket layer re-sends each player their own view. */
  stateChanged: () => void;
  feed: (event: FeedEvent, target?: FeedTarget) => void;
  finished: (result: GameResult) => void;
}

export interface GameDeps {
  now: () => number;
  rng: Rng;
  newId: () => string;
}

/** Common surface of both game modes, used by the socket layer. */
export interface Game {
  readonly mode: GameMode;
  start(): void;
  viewFor(playerId: string): GameView;
  setConnected(playerId: string, connected: boolean): void;
  dispose(): void;
}

export type { Result };
