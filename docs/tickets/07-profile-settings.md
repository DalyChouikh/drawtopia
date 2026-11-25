# 07 — Profile, settings and connection state

**Goal:** the player's identity and app settings survive a restart; network problems are visible.

## Scope
- Profile: nickname + avatar colour, validated with the shared nickname rule, inline error message.
- Settings: server URL (validated `http(s)://host[:port]`), haptics on/off.
- `zustand` store with `persist` on AsyncStorage; hydration gate before the first render.
- Socket client service: connect/disconnect, status (`connecting` | `online` | `offline`), auto-reconnect;
  offline banner on every screen.

## Acceptance criteria
- [ ] Set a nickname, kill the app, reopen it → the nickname is still there (M7 test).
- [ ] **Negative:** empty nickname → "Pick a nickname (2–16 letters or numbers)", Save is refused.
- [ ] **Negative:** server down → offline banner; actions that need the server say why they can't run.
