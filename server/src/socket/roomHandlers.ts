import {
  CreateRoomPayloadSchema,
  JoinRoomPayloadSchema,
  type JoinedRoom,
  RejoinRoomPayloadSchema,
  type RoomSnapshot,
  UpdateSettingsPayloadSchema,
  err,
  ok,
} from '@drawtopia/shared';
import { type GameManager, playerChannel } from '../game/GameManager';
import type { RoomManager } from '../rooms/RoomManager';
import { parse, respond } from './respond';
import type { GameServer, GameSocket } from './types';

export interface RoomHandlerContext {
  io: GameServer;
  rooms: RoomManager;
  games: GameManager;
  /** How long a disconnected player keeps their seat. */
  reconnectGraceMs: number;
  /** Removal timers of disconnected players, by player id. */
  pendingRemovals: Map<string, NodeJS.Timeout>;
}

export function registerRoomHandlers(socket: GameSocket, ctx: RoomHandlerContext): void {
  const { io, rooms, games } = ctx;

  const broadcast = (room: RoomSnapshot | null) => {
    if (room) io.to(room.code).emit('room:updated', room);
  };

  /** Links this socket to the player's room so it receives room broadcasts. */
  const enterRoom = (joined: JoinedRoom) => {
    socket.data.playerId = joined.playerId;
    socket.data.roomCode = joined.room.code;
    void socket.join([joined.room.code, playerChannel(joined.playerId)]);
    broadcast(joined.room);
  };

  /** Leaves the current room, if any, before creating or joining another one. */
  const leaveCurrentRoom = () => {
    const { playerId, roomCode } = socket.data;
    if (!playerId || !roomCode) return;
    games.setConnected(roomCode, playerId, false);
    const left = rooms.leaveRoom(playerId);
    if (left.ok && left.value === null) games.dispose(roomCode); // room closed
    void socket.leave(roomCode);
    void socket.leave(playerChannel(playerId));
    socket.data.playerId = undefined;
    socket.data.roomCode = undefined;
    if (left.ok) broadcast(left.value);
  };

  socket.on('room:create', (payload, ack) =>
    respond(ack, () => {
      const input = parse(CreateRoomPayloadSchema, payload);
      if (!input.ok) return input;
      leaveCurrentRoom();
      const created = rooms.createRoom(input.value.profile, input.value.settings);
      if (created.ok) enterRoom(created.value);
      return created;
    }),
  );

  socket.on('room:join', (payload, ack) =>
    respond(ack, () => {
      const input = parse(JoinRoomPayloadSchema, payload);
      if (!input.ok) return input;
      leaveCurrentRoom();
      const joined = rooms.joinRoom(input.value.code, input.value.profile);
      if (joined.ok) enterRoom(joined.value);
      return joined;
    }),
  );

  socket.on('room:rejoin', (payload, ack) =>
    respond(ack, () => {
      const input = parse(RejoinRoomPayloadSchema, payload);
      if (!input.ok) return input;
      const rejoined = rooms.rejoinRoom(input.value.code, input.value.playerId);
      if (rejoined.ok) {
        clearTimeout(ctx.pendingRemovals.get(input.value.playerId));
        ctx.pendingRemovals.delete(input.value.playerId);
        enterRoom(rejoined.value);
        games.setConnected(input.value.code, input.value.playerId, true);
        games.sendViewTo(input.value.code, input.value.playerId);
      }
      return rejoined;
    }),
  );

  socket.on('room:leave', (ack) =>
    respond(ack, () => {
      if (!socket.data.playerId) return err('NOT_IN_ROOM');
      leaveCurrentRoom();
      return ok(null);
    }),
  );

  socket.on('room:list', (ack) => respond(ack, () => ok(rooms.listPublicRooms())));

  socket.on('room:update-settings', (payload, ack) =>
    respond(ack, () => {
      const input = parse(UpdateSettingsPayloadSchema, payload);
      if (!input.ok) return input;
      const { playerId } = socket.data;
      if (!playerId) return err('NOT_IN_ROOM');
      const updated = rooms.updateSettings(playerId, input.value);
      if (updated.ok) broadcast(updated.value);
      return updated;
    }),
  );

  socket.on('room:start', (ack) =>
    respond(ack, () => {
      const { playerId } = socket.data;
      if (!playerId) return err('NOT_IN_ROOM');
      const started = rooms.startGame(playerId);
      if (started.ok) {
        broadcast(started.value);
        io.to(started.value.code).emit('game:started', started.value);
        games.start(started.value);
      }
      return started.ok ? ok(null) : started;
    }),
  );

  socket.on('disconnect', () => {
    const { playerId, roomCode } = socket.data;
    if (!playerId || !roomCode) return;
    broadcast(rooms.setConnected(playerId, false));
    games.setConnected(roomCode, playerId, false);

    // Keep the seat for a while so a phone that lost Wi-Fi can come back.
    const timer = setTimeout(() => {
      ctx.pendingRemovals.delete(playerId);
      const left = rooms.leaveRoom(playerId);
      if (left.ok && left.value === null) games.dispose(roomCode);
      if (left.ok) broadcast(left.value);
    }, ctx.reconnectGraceMs);
    timer.unref();
    ctx.pendingRemovals.set(playerId, timer);
  });
}
