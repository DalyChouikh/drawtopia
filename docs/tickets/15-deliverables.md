# 15 — Exam deliverables

**Goal:** a ZIP that passes the "LISTE FINALE DE CONTRÔLE" on a fresh machine.

## Scope
- `README.md`: presentation, environment (Node, Expo SDK 58, Expo Go version), install from the ZIP, run
  commands, demo data, walkthrough of the 4 actions + 2 negative cases, limitations (server down, permissions).
- `docs/tests.md`: 6 scenarios T1–T6 (2 negative, 1 navigation/state) with data, expected, observed, device/OS.
- `captures/`: ≥ 3 real screenshots (main screen, an interaction, a result or error).
- `DECLARATION_SOURCES.md`: libraries, fonts and Claude Code assistance — what, where, how it was verified.
- `rapport.pdf` (French, 8–12 pages) following the canevas, with Q1–Q8 answered from real files and functions.
- `validation/`: the teacher's dated approval.
- `scripts/make-zip`: builds `EXAM_MOBILE_Chouikh_MohamedAli_DrawTopia.zip` without `node_modules/`, `.expo/`
  or caches; then extract it into a fresh folder and follow the README.

## Acceptance criteria
- [ ] Fresh extract → `npm install` → server and app run by following only the README.
