/** Points for a correct guess: 100 for a last-second guess up to 500 for an instant one. */
export function guesserPoints(secondsLeft: number, roundDuration: number): number {
  if (roundDuration <= 0) return 100;
  const ratio = Math.min(Math.max(secondsLeft / roundDuration, 0), 1);
  return 100 + Math.round(400 * ratio);
}

/** Points for the drawer: up to 250, proportional to how many guessers found the word. */
export function drawerPoints(correctGuessers: number, totalGuessers: number): number {
  if (totalGuessers <= 0) return 0;
  const ratio = Math.min(Math.max(correctGuessers / totalGuessers, 0), 1);
  return Math.round(250 * ratio);
}

/**
 * Sorts players by score (highest first) and gives tied players the same rank,
 * skipping the next ranks ("competition ranking": 1, 1, 3).
 */
export function rankPlayers<T extends { score: number }>(
  players: readonly T[],
): (T & { rank: number })[] {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  let rank = 0;
  return sorted.map((player, index) => {
    if (index === 0 || player.score !== sorted[index - 1]!.score) rank = index + 1;
    return { ...player, rank };
  });
}
