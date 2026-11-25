# 14 — Deploy server (Render)

**Goal:** phones can play from anywhere (mobile data, uni Wi-Fi) during the demo.

## Scope
- `render.yaml`: free web service, build `npm ci`, start `npm run start -w @drawtopia/server`, health check `/health`.
- Default server URL in `app.json` `extra`, overridable in Settings.
- README: how to run the server locally instead, and the cold-start delay (~50 s) after the service has been idle.

## Acceptance criteria
- [ ] Two phones on mobile data play a round through the deployed server.
