# 12 — Results and local game history

**Goal:** fiche action 4 — see scores and chains after the game, even offline.

## Scope
- On `game:finished`, save a `GameResult` (date, mode, players, final scores, chains with drawings) to
  AsyncStorage (max 30 entries, oldest dropped first).
- History list (newest first, filter by mode) and detail screen (podium or chain replay); delete one entry
  after a confirmation.

## Acceptance criteria
- [ ] Finish a game, restart the app in airplane mode → the game is in History with its chains.
- [ ] A deleted entry stays deleted after a restart.
