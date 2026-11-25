# 03 — Close-guess matching algorithm

**Goal:** decide whether a guess is `correct`, `close` or `wrong`, robust to typos, accents, spaces and plurals.

## Algorithm (`shared/src/guess/matchGuess.ts`)
1. `normalize(text)`: lowercase → NFD and strip diacritics → drop punctuation → collapse whitespace → trim.
2. Compare with spaces removed (`ice cream` = `icecream`).
3. Exact match, or match after removing one trailing `s` on either side → `correct`.
4. Optimal-string-alignment (Damerau–Levenshtein) distance computed in a **band of width k**, with early exit
   when `|len(a) − len(b)| > k` → O(n·k) instead of O(n²).
5. Threshold k by answer length: ≤ 4 → 0 (exact only), 5–7 → 1, ≥ 8 → 2. `distance ≤ k` → `close`.
6. Empty or whitespace-only guesses are rejected before matching.

## Acceptance criteria (TDD)
- [ ] `rocket` vs `rocet` → close; `rokcet` → close (a transposition costs 1); `Rocket!` → correct.
- [ ] `ice cream` vs `icecream` → correct; `apples` vs `apple` → correct; `café` vs `cafe` → correct.
- [ ] **Negative:** `cat` vs `car` → wrong (short words need an exact match); `elephant` vs `pineapple` → wrong.
- [ ] **Negative:** `""` and `"   "` → rejected with a validation error.
- [ ] Timing of 10 000 comparisons recorded for the report (Q8).
