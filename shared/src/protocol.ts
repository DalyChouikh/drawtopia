/**
 * Socket.IO protocol: the events the app sends and the server pushes, fully typed.
 * Requests use acknowledgements so each call gets a typed `Result` back.
 */
import { z } from 'zod';
import type { PublicRoomSummary, RoomSnapshot, Stroke } from './domain';
import type {
  ChooseWordPayload,
  FeedEvent,
  GameView,
  GuessPayload,
  GuessVerdictResult,
  PassSubmitPayload,
  StrokeProgress,
} from './game';
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
  /** Current game view, e.g. when the game screen opens or after a reconnect. */
  'game:sync': (ack: Ack<GameView>) => void;
  'game:choose-word': (payload: ChooseWordPayload, ack: Ack<null>) => void;
  'game:guess': (payload: GuessPayload, ack: Ack<GuessVerdictResult>) => void;
  /** Drawer only. Fire-and-forget: strokes are relayed to the other players. */
  'draw:stroke': (stroke: Stroke) => void;
  /** Drawer only, fire-and-forget: points of the stroke being drawn (live drawing). */
  'draw:progress': (progress: StrokeProgress) => void;
  'draw:undo': () => void;
  'draw:clear': () => void;
  'pass:submit': (payload: PassSubmitPayload, ack: Ack<null>) => void;
}

/** Per-connection data the server keeps on each socket. */
export interface SocketData {
  playerId?: string;
  roomCode?: string;
}

export interface ServerToClientEvents {
  'room:updated': (room: RoomSnapshot) => void;
  'game:started': (room: RoomSnapshot) => void;
  'game:state': (view: GameView) => void;
  'game:feed': (event: FeedEvent) => void;
  'draw:stroke': (stroke: Stroke) => void;
  'draw:progress': (progress: StrokeProgress) => void;
  'draw:undo': () => void;
  'draw:clear': () => void;
}
