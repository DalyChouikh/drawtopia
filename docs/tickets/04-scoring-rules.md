# 04 — Scoring, hints and round timing rules

**Goal:** pure, testable functions for everything the server decides about a Draw & Guess round.

## Scope (`shared/src/rules/`)
- `guesserPoints(secondsLeft, roundDuration)` = `100 + round(400 × secondsLeft / roundDuration)` (100–500, faster = more).
- `drawerPoints(correctGuessers, totalGuessers)` = `round(250 × correct / total)`.
- `maskWord(word, revealed)` → `"r _ _ _ _ t"`; spaces and hyphens always visible.
- `hintSchedule(word, duration)` → letters revealed at 50 % and 75 % of the round, never more than ⌊len / 3⌋.
- `pickWordChoices(wordList, used, n = 3, rng)` → 3 unused words (seeded RNG in tests).
- `isRoundOver(state)` → time up, or every guesser correct, or the drawer left.
- `rankPlayers(scores)` with ties sharing a rank.

## Acceptance criteria
- [ ] Tests for each function, including edge cases (0 guessers, ties, 1-letter word, word with a space).
