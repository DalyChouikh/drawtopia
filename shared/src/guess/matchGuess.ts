/**
 * Guess matching for Draw & Guess: is a guess correct, close (a near-miss) or wrong?
 *
 * Steps:
 *   1. normalize both strings (case, accents, punctuation, spaces),
 *   2. exact match, also accepting a singular/plural difference → "correct",
 *   3. otherwise compute a bounded edit distance; within the length-based threshold → "close".
 */

export type GuessVerdict = 'correct' | 'close' | 'wrong';

const DIACRITICS = /\p{M}/gu;
const PUNCTUATION = /[^\p{L}\p{N}\s]/gu;
const WHITESPACE = /\s+/g;

/** "  Café   Crème! " → "cafe creme" */
export function normalizeGuess(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(PUNCTUATION, '')
    .replace(WHITESPACE, ' ')
    .trim();
}

/** Allowed typos for an answer of this length: short words must be exact. */
export function closeThreshold(answerLength: number): number {
  if (answerLength <= 4) return 0;
  if (answerLength <= 7) return 1;
  return 2;
}

/**
 * Optimal-string-alignment distance (Levenshtein + swap of two neighbouring letters),
 * computed only inside a diagonal band of width `k`.
 *
 * Returns the exact distance when it is ≤ k, otherwise `k + 1`. Because cells further
 * than k from the diagonal can never lead to a distance ≤ k, the band makes the cost
 * O(n·k) instead of O(n·m), and the loop stops as soon as a whole row exceeds k.
 */
export function boundedOsaDistance(a: string, b: string, k: number): number {
  const over = k + 1;
  if (a === b) return 0;
  const n = a.length;
  const m = b.length;
  if (Math.abs(n - m) > k) return over;
  if (n === 0 || m === 0) return Math.max(n, m);

  // Three rolling rows: i-2 (for swaps), i-1 and i. Cells outside the band stay at `over`.
  let beforePrev = new Uint16Array(m + 1).fill(over);
  let prev = new Uint16Array(m + 1).fill(over);
  let curr = new Uint16Array(m + 1).fill(over);
  for (let j = 0; j <= Math.min(m, k); j++) prev[j] = j;

  for (let i = 1; i <= n; i++) {
    curr.fill(over);
    if (i <= k) curr[0] = i;
    let rowMin = curr[0]!;

    const from = Math.max(1, i - k);
    const to = Math.min(m, i + k);
    for (let j = from; j <= to; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
      const swapped = i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1];
      if (swapped) best = Math.min(best, beforePrev[j - 2]! + 1);
      curr[j] = Math.min(best, over);
      rowMin = Math.min(rowMin, curr[j]!);
    }

    if (rowMin > k) return over; // every path already costs more than k
    [beforePrev, prev, curr] = [prev, curr, beforePrev];
  }
  return Math.min(prev[m]!, over);
}

/** "apples" → "apple" (one trailing s, only for words long enough to be plurals). */
function singular(word: string): string {
  return word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word;
}

export function matchGuess(guess: string, answer: string): GuessVerdict {
  // Spaces are ignored so "icecream" matches "ice cream".
  const g = normalizeGuess(guess).replace(WHITESPACE, '');
  const a = normalizeGuess(answer).replace(WHITESPACE, '');
  if (g.length === 0) return 'wrong';

  if (g === a || singular(g) === singular(a)) return 'correct';

  const k = closeThreshold(a.length);
  if (k > 0 && boundedOsaDistance(g, a, k) <= k) return 'close';
  return 'wrong';
}
