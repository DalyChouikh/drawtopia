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

## Notes (done)
- `README.md`, `docs/tests.md`, `DECLARATION_SOURCES.md`, `docs/report/rapport.html` → `rapport.pdf` (11 pages
  incl. cover), `docs/PHONES.md`, `scripts/make-zip.ps1`.
- Dry run on 25/11/2026: the ZIP was extracted into an empty folder and the README followed from scratch —
  `npm install` (829 packages), `npm test` 84/84, typecheck 0 errors, server `/health` OK, Android bundle built.
- Still to do by the student: put the dated approval in `validation/`, fill the validation date on the report's
  cover page, re-render the PDF, run `scripts/make-zip.ps1`.
