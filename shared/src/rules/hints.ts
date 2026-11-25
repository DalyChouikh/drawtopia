import { type Rng, sample } from './random';

/** The placeholder shown for a hidden letter. */
export const HIDDEN = '_';

const MASKABLE = /[\p{L}\p{N}]/u;

/** Letters and digits are hidden; spaces, hyphens and apostrophes always stay visible. */
export function isMaskable(char: string): boolean {
  return MASKABLE.test(char);
}

/**
 * "ice cream" with index 0 revealed → "i__ _____".
 * The result has the same length as the word, so the UI can lay it out letter by letter.
 */
export function maskWord(word: string, revealed: ReadonlySet<number>): string {
  return [...word]
    .map((char, i) => (isMaskable(char) && !revealed.has(i) ? HIDDEN : char))
    .join('');
}

export interface HintStep {
  /** Seconds after the round started. */
  revealAtSecond: number;
  /** Index in the word of the letter to reveal. */
  index: number;
}

/** Moments of the round when a letter is revealed. */
const HINT_MOMENTS = [0.5, 0.75] as const;

/**
 * Plans when and which letters get revealed: at 50 % and 75 % of the round,
 * never more than a third of the letters (so short words get fewer or no hints).
 */
export function planHints(word: string, roundDuration: number, rng: Rng): HintStep[] {
  const letterIndexes = [...word].flatMap((char, i) => (isMaskable(char) ? [i] : []));
  const maxHints = Math.min(HINT_MOMENTS.length, Math.floor(letterIndexes.length / 3));
  const picked = sample(letterIndexes, maxHints, rng);
  return picked.map((index, n) => ({
    revealAtSecond: Math.round(roundDuration * HINT_MOMENTS[n]!),
    index,
  }));
}
