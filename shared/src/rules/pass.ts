/**
 * Draw & Pass rotation rules.
 *
 * With N players there are N chains (one started by each player) and N steps.
 * Steps alternate: write (0), draw (1), write (2), …
 * At step s, player i works on chain (i + s) mod N, so:
 *   - at step 0 everyone writes the first sentence of their own chain,
 *   - over the N steps each chain is handled by every player exactly once,
 *   - nobody sees their own chain again before the reveal.
 */

export type PassStepKind = 'text' | 'drawing';

export function passStepKind(step: number): PassStepKind {
  return step % 2 === 0 ? 'text' : 'drawing';
}

/** Index of the chain player `playerIndex` works on at `step`, for `playerCount` players. */
export function chainForPlayer(playerIndex: number, step: number, playerCount: number): number {
  return (playerIndex + step) % playerCount;
}

/** Index of the player who works on chain `chainIndex` at `step` (inverse of chainForPlayer). */
export function playerForChain(chainIndex: number, step: number, playerCount: number): number {
  return (((chainIndex - step) % playerCount) + playerCount) % playerCount;
}

/** A game has as many steps as players, so every player touches every chain once. */
export function passStepCount(playerCount: number): number {
  return playerCount;
}
