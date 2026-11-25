/**
 * Socket.IO protocol: the events the app sends and the server pushes, fully typed.
 * Requests use acknowledgements so each call gets a typed `Result` back.
 */
import { z } from 'zod';
import type { PublicRoomSummary, RoomSnapshot } from './domain';
import type { Result } from './result';
import { PlayerProfileSchema, RoomCodeSchema, RoomSettingsSchema } from './validation';

export const CreateRoomPayloadSchema = z.object({
  profile: PlayerProfileSchema,
  settings: RoomSettingsSchema,
});
export type CreateRoomPayload = z.infer<typeof CreateRoomPayloadSchema>;

export const JoinRoomPayloadSchema = z.object({
  code: RoomCodeSchema,
  profile: PlayerProfileSchema,
});
export type JoinRoomPayload = z.infer<typeof JoinRoomPayloadSchema>;

export const RejoinRoomPayloadSchema = z.object({
  code: RoomCodeSchema,
  playerId: z.uuid(),
});
export type RejoinRoomPayload = z.infer<typeof RejoinRoomPayloadSchema>;

export const UpdateSettingsPayloadSchema = RoomSettingsSchema.partial();
export type UpdateSettingsPayload = z.infer<typeof UpdateSettingsPayloadSchema>;

/** What a player receives after creating, joining or rejoining a room. */
export interface JoinedRoom {
  playerId: string;
  room: RoomSnapshot;
}

export type Ack<T> = (result: Result<T>) => void;

export interface ClientToServerEvents {
  'room:create': (payload: CreateRoomPayload, ack: Ack<JoinedRoom>) => void;
  'room:join': (payload: JoinRoomPayload, ack: Ack<JoinedRoom>) => void;
  'room:rejoin': (payload: RejoinRoomPayload, ack: Ack<JoinedRoom>) => void;
  'room:leave': (ack: Ack<null>) => void;
  'room:list': (ack: Ack<PublicRoomSummary[]>) => void;
  'room:update-settings': (payload: UpdateSettingsPayload, ack: Ack<RoomSnapshot>) => void;
  'room:start': (ack: Ack<null>) => void;
}

/** Per-connection data the server keeps on each socket. */
export interface SocketData {
  playerId?: string;
  roomCode?: string;
}

export interface ServerToClientEvents {
  'room:updated': (room: RoomSnapshot) => void;
  'game:started': (room: RoomSnapshot) => void;
}
