# 01 — Tooling: lint, format, tests, CI

**Goal:** every workspace can be linted, formatted, type-checked and tested with one command each.

## Scope
- ESLint (flat config) for `app/` (`eslint-config-expo`), `server/`, `shared/`; one shared Prettier config.
- Vitest for `shared/` and `server/` (Jest-compatible API; runs TypeScript + ESM natively, unlike Jest).
- Root scripts: `lint`, `format`, `typecheck`, `test`.
- GitHub Actions workflow running `npm ci`, `typecheck`, `lint`, `test` on push.

## Acceptance criteria
- [ ] `npm run lint`, `npm run typecheck` and `npm test` pass at the root.
- [ ] A deliberately failing test makes `npm test` exit non-zero.
- [ ] CI is green on `main`.
