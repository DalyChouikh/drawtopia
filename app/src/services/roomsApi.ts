import type {
  CreateRoomPayload,
  JoinedRoom,
  PublicRoomSummary,
  RoomSettings,
  RoomSnapshot,
  UpdateSettingsPayload,
} from '@drawtopia/shared';
import { currentProfile } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';
import { type ClientResult, request } from './gameClient';

/** Saves the room we entered so the lobby can show it and we can rejoin after a restart. */
function remember(result: ClientResult<JoinedRoom>): ClientResult<JoinedRoom> {
  if (result.ok) useSessionStore.getState().enterRoom(result.value.playerId, result.value.room);
  return result;
}

export async function createRoom(settings: RoomSettings): Promise<ClientResult<JoinedRoom>> {
  const profile = currentProfile();
  if (!profile) return { ok: false, error: 'INVALID_PAYLOAD' };
  const payload: CreateRoomPayload = { profile, settings };
  return remember(await request((s) => s.emitWithAck('room:create', payload)));
}

export async function joinRoom(code: string): Promise<ClientResult<JoinedRoom>> {
  const profile = currentProfile();
  if (!profile) return { ok: false, error: 'INVALID_PAYLOAD' };
  return remember(await request((s) => s.emitWithAck('room:join', { code, profile })));
}

export async function leaveRoom(): Promise<void> {
  useSessionStore.getState().clear();
  await request((s) => s.emitWithAck('room:leave'));
}

export const listPublicRooms = (): Promise<ClientResult<PublicRoomSummary[]>> =>
  request((s) => s.emitWithAck('room:list'));

export const updateRoomSettings = (
  patch: UpdateSettingsPayload,
): Promise<ClientResult<RoomSnapshot>> =>
  request((s) => s.emitWithAck('room:update-settings', patch));

export const startGame = (): Promise<ClientResult<null>> =>
  request((s) => s.emitWithAck('room:start'));
