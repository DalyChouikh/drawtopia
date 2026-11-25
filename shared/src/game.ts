/**
 * What each player sees of a running game. The server builds one view per player,
 * so secrets (the word, other players' chains) only reach the players allowed to see them.
 */
import { z } from 'zod';
import { GUESS_MAX_LENGTH } from './constants';
import type { ChainEntry, GameResult, PassChain, Stroke } from './domain';
import type { PassStepKind } from './rules/pass';
import { GuessSchema, StrokeSchema } from './validation';

/** Seconds the drawer has to pick a word, and how long the answer stays on screen. */
export const CHOOSE_WORD_SECONDS = 10;
export const REVEAL_SECONDS = 5;
/** Extra time the server waits for late Draw & Pass submissions before filling them in. */
export const PASS_SUBMIT_GRACE_MS = 2000;
export const MAX_STROKES_PER_DRAWING = 300;
/** While a finger moves, new points are sent this often (live drawing). */
export const STROKE_STREAM_INTERVAL_MS = 50;
/** Upper bound on points in one live-drawing message (x,y pairs). */
export const STROKE_PROGRESS_MAX_POINTS = 64;

export type DrawGuessPhase = 'choosing' | 'drawing' | 'reveal' | 'finished';

export interface DrawGuessView {
  mode: 'draw-guess';
  phase: DrawGuessPhase;
  /** 1-based turn number and total turns (rounds × players). */
  turn: number;
  totalTurns: number;
  drawerId: string;
  /** Only sent to the drawer while choosing. */
  wordChoices?: string[];
  /** The secret word: drawer while drawing, everyone during reveal. */
  word?: string;
  /** Hidden letters as "_" (everyone). */
  mask: string;
  /** Milliseconds left in the current phase when the view was sent. */
  remainingMs: number;
  guessedIds: string[];
  /** The drawing so far, so a player who reconnects sees it. */
  strokes: Stroke[];
  scores: Record<string, number>;
  /** Points won during the last turn (reveal phase). */
  turnPoints?: Record<string, number>;
  result?: GameResult;
}

export type DrawPassPhase = 'step' | 'finished';

export interface DrawPassView {
  mode: 'draw-pass';
  phase: DrawPassPhase;
  /** 1-based step number and total steps. */
  step: number;
  totalSteps: number;
  stepKind: PassStepKind;
  /** What this player must work from: undefined at step 1 (write your own sentence). */
  prompt?: ChainEntry;
  remainingMs: number;
  submittedIds: string[];
  /** All chains, revealed at the end. */
  chains?: PassChain[];
  result?: GameResult;
}

export type GameView = DrawGuessView | DrawPassView;

/** Lines of the Draw & Guess feed. */
export type FeedEvent =
  | { kind: 'chat'; playerId: string; text: string }
  | { kind: 'close'; playerId: string; /** Only in the author's own copy. */ text?: string }
  | { kind: 'guessed'; playerId: string; points: number }
  | { kind: 'system'; text: string };

export const ChooseWordPayloadSchema = z.object({ word: z.string().min(1).max(40) });
export const GuessPayloadSchema = z.object({ text: GuessSchema });

/**
 * Live drawing: the points added to stroke `id` since the previous message. Receivers append
 * them; the final `draw:stroke` with the same id later replaces the live version.
 */
export const StrokeProgressSchema = StrokeSchema.extend({
  points: z
    .array(z.number().min(0).max(1))
    .min(2)
    .max(STROKE_PROGRESS_MAX_POINTS * 2)
    .refine((p) => p.length % 2 === 0, 'Points come in x,y pairs'),
});
export type StrokeProgress = z.infer<typeof StrokeProgressSchema>;
export const PassSubmitPayloadSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('text'),
    text: z
      .string()
      .trim()
      .max(GUESS_MAX_LENGTH * 2),
  }),
  z.object({
    kind: z.literal('drawing'),
    strokes: z.array(StrokeSchema).max(MAX_STROKES_PER_DRAWING),
  }),
]);

export type ChooseWordPayload = z.infer<typeof ChooseWordPayloadSchema>;
export type GuessPayload = z.infer<typeof GuessPayloadSchema>;
export type PassSubmitPayload = z.infer<typeof PassSubmitPayloadSchema>;
export type GuessVerdictResult = { verdict: 'correct' | 'close' | 'wrong' };
