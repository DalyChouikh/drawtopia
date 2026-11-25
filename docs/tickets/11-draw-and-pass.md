# 11 — Draw & Pass game loop

**Goal:** fiche actions 3 and 4 for mode 2 — write, draw, pass, reveal the chains.

## Scope
- N players → N chains, N steps alternating write → draw → write …
- Rotation rule (shared, tested): at step s, player i works on chain `(i + s) mod N`, so nobody sees their own
  chain again before the reveal.
- Each step has a timer; on timeout the current text or drawing is submitted automatically
  (empty text → "(nothing written)").
- Reveal screen: chain by chain, entries animate in one after another; drawings replay stroke by stroke.

## Acceptance criteria
- [ ] Rotation tests for N = 3..8: each chain visits every player exactly once.
- [ ] A full 3-player game ends on the reveal, on the emulator + 2 phones.

## Notes (done)
- Rotation rule in `shared/src/rules/pass.ts`, tested for 3–8 players; engine in `server/src/game/DrawPassGame.ts`.
- Verified on the emulator with 2 scripted players: write → draw → describe, then the animated chain reveal.
