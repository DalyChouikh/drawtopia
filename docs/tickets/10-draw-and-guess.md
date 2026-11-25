# 10 — Draw & Guess game loop

**Goal:** fiche actions 3 and 4 for mode 1 — draw, guess, score.

## Scope
- Server state machine: `choosing` (drawer picks 1 of 3 words, 10 s, auto-pick on timeout) → `drawing` (timer)
  → `reveal` (5 s) → next drawer … → `finished`.
- The secret word is sent only to the drawer; the others receive the mask, then hint letters over time.
- Guess input → server `matchGuess` (ticket 03):
  `correct` → "Nova guessed it!" to everyone + points;
  `close` → "Pixel_Rider is close!" to everyone, the typed word only to its author;
  `wrong` → shown as chat.
- A player who guessed correctly can't guess again; the drawer can't guess.
- Scoreboard with animated score changes; podium at the end → `results/[code]`.
- English word list (~300 drawable words, 3 difficulty tiers).

## Acceptance criteria
- [ ] A full 3-player game reaches the podium on the emulator + 2 phones.
- [ ] A typo guess shows the close notice; the secret word never reaches a non-drawer's device.
