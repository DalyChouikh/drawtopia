# DrawTopia — tickets

Deadline: **ZIP due 27/11/2026**. Tickets are vertical slices, in build order. Each lists what it proves for the
exam (M1–M8 requirements, Q1–Q8 report questions).

| # | Ticket | Depends on | Covers | Status |
|---|---|---|---|---|
| 01 | [Tooling: lint, format, tests, CI](01-tooling.md) | — | M8, quality | done |
| 02 | [Domain model and socket protocol](02-domain-model.md) | 01 | M4, Q3 | done |
| 03 | [Close-guess matching algorithm](03-guess-matching.md) | 02 | M4, M5, M8, Q8 | done |
| 04 | [Scoring, hints and round timing rules](04-scoring-rules.md) | 02 | M4, M8 | done |
| 05 | [Server: rooms lifecycle](05-server-rooms.md) | 02 | M3, M5, M8 | done |
| 06 | [App design system and screen skeleton](06-design-system.md) | 01 | M1, M2, M6, Q2 | done |
| 07 | [Profile, settings and connection state](07-profile-settings.md) | 06 | M5, M7, Q5, Q7 | done |
| 08 | [Create / join / browse rooms + lobby](08-lobby-flow.md) | 05, 07 | M2, M3, Q4, Q6 | done |
| 09 | [Drawing canvas (Skia)](09-canvas.md) | 06 | M3, M6, Q1 | done |
| 10 | [Draw & Guess game loop](10-draw-and-guess.md) | 03, 04, 08, 09 | M3, M4 | done |
| 11 | [Draw & Pass game loop](11-draw-and-pass.md) | 08, 09 | M3, M4 | done |
| 12 | [Results and local game history](12-history.md) | 10, 11 | M3, M7 | done |
| 13 | [Motion and polish](13-polish.md) | 10, 11 | M6 | done |
| 14 | [Deploy server (Render)](14-deploy.md) | 05 | demo, C | done |
| 15 | [Exam deliverables: README, tests doc, report, ZIP](15-deliverables.md) | all | C, D, E | done — add validation/ then run scripts/make-zip.ps1 |

## Decisions locked during grilling

- English UI. Neobrutalism + sketchbook style, "marker brights" palette (see `brand/BRAND.md`).
- Own Node + Socket.IO server; the server is authoritative (it owns the secret word, scores and timers).
- Expo Go only (no custom dev build), so the app runs on the iPhone without a Mac.
- Game rules live in `shared/` and are unit-tested with Jest.
- "Close" and "guessed it!" notices are broadcast to every player; the typed close word is shown only to its author.
- Persistence: AsyncStorage for profile, settings and finished-game history; live game state stays on the server.
