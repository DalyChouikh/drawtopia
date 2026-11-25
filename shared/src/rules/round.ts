import { type Rng, sample } from './random';

/**
 * Picks `count` different words the drawer can choose from, avoiding words already
 * played in this game. When fewer unused words remain, the whole list is used again.
 */
export function pickWordChoices(
  words: readonly string[],
  used: ReadonlySet<string>,
  count: number,
  rng: Rng,
): string[] {
  const unused = words.filter((w) => !used.has(w));
  const pool = unused.length >= count ? unused : words;
  return sample(pool, count, rng);
}

export interface RoundProgress {
  secondsLeft: number;
  guesserCount: number;
  correctCount: number;
  drawerConnected: boolean;
}

/** A Draw & Guess round ends when time is up, everyone has guessed, or the drawer left. */
export function isRoundOver(round: RoundProgress): boolean {
  if (round.secondsLeft <= 0) return true;
  if (!round.drawerConnected) return true;
  return round.guesserCount > 0 && round.correctCount >= round.guesserCount;
}
