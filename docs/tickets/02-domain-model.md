# 02 — Domain model and socket protocol

**Goal:** one source of truth for game data and the messages the app and server exchange.

## Scope (`shared/src/`)
- Types: `Player`, `Room`, `RoomSettings` (mode, round duration, rounds, visibility), `GameMode`
  (`draw-guess` | `draw-pass`), `Stroke`, `DrawGuessRound`, `PassChain`, `ChainEntry` (text | drawing), `GameResult`.
- Constants: `MIN_PLAYERS = 3`, `MAX_PLAYERS = 8`, nickname rule (2–16 chars, letters/digits/`_`),
  round durations (30/60/90 s), room-code alphabet (no `0/O/1/I`).
- `zod` schemas for every client → server event payload, with inferred TS types for both sides.
- Typed Socket.IO event maps (`ClientToServerEvents`, `ServerToClientEvents`).
- `GLOSSARY.md` (domain-modeling skill): room, host, round, turn, chain, step, mask, hint.

## Acceptance criteria
- [ ] App and server import the same types; changing a field breaks the typecheck on both sides.
- [ ] Unit tests: a valid payload parses; an invalid nickname and an oversized stroke batch are rejected.
