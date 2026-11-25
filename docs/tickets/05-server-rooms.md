# 05 — Server: rooms lifecycle

**Goal:** the server manages rooms safely, with every input validated.

## Scope (`server/src/`)
- Socket.IO server; every handler parses its payload with the zod schema. Invalid input → `error` ack with a
  code, never a crash.
- `RoomManager` (pure class, unit-tested without sockets): create (public/private, 4-char code), join by code,
  list public rooms (not started, not full), leave, host transfer to the oldest remaining player, delete empty rooms.
- Error codes: nickname already used in the room (case-insensitive) → `NICKNAME_TAKEN`; full → `ROOM_FULL`;
  unknown code → `ROOM_NOT_FOUND`; start with < 3 players → `NOT_ENOUGH_PLAYERS`; non-host start/settings → `NOT_HOST`.
- Reconnection: the client keeps `playerId` + `roomCode`; rejoining within 60 s restores the seat.
- `/health` endpoint, CORS config, `PORT` env variable.

## Acceptance criteria
- [ ] Unit tests for each error code (≥ 2 negative cases for the report).
- [ ] Integration test with `socket.io-client`: 3 clients join, the host starts, all receive `game:started`.
