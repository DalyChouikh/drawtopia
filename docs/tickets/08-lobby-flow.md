# 08 — Create / join / browse rooms + lobby

**Goal:** fiche actions 1 and 2 — create a public or private room or join one; choose the mode and round duration.

## Scope
- Home: Quick play (join the first open public room, or create one), Create room, Join with code.
- Create: visibility, mode, round duration, rounds → navigates to `room/[code]` with the code as a route param.
- Browse: live list of public rooms (player count, mode), pull to refresh.
- Lobby: player list with avatars (animated join/leave), share code, host-only settings, Start enabled at
  ≥ 3 players (otherwise a hint like "Need 1 more player").
- Error toasts for every server error code from ticket 05.

## Acceptance criteria
- [ ] Emulator + 2 phones join the same private room by code and see each other live.
- [ ] **Negative:** wrong code → "No room with code XKCD"; duplicate nickname → "That nickname is taken in this room".
- [ ] Back from the lobby leaves the room (the others see the player leave).
