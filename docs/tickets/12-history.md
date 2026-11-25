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

## Notes (done)
- Capped at 20 games (Android AsyncStorage stores each key in one database row, ~2 MB max).
- Verified on the emulator: game saved on finish, still listed after a cold start with the game server stopped,
  filter by mode, detail (chain replay), delete with confirmation.
- A cold start in airplane mode cannot be shown in Expo Go: in development the app code itself is loaded from
  Metro over the network. A standalone build would not have this limit.
