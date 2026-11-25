import {
  type ClientToServerEvents,
  ERROR_MESSAGES,
  type ErrorCode,
  type Result,
  type ServerToClientEvents,
  err,
} from '@drawtopia/shared';
import { type Socket, io } from 'socket.io-client';
import { useSessionStore } from '../stores/sessionStore';
import { showToast } from '../stores/toastStore';
import { useConnectionStore } from './connectionStore';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Server error codes plus the two failures that happen on the phone side. */
export type ClientErrorCode = ErrorCode | 'OFFLINE' | 'TIMEOUT';
export type ClientResult<T> = Result<T, ClientErrorCode>;

const REQUEST_TIMEOUT_MS = 8000;

export const CLIENT_ERROR_MESSAGES: Record<ClientErrorCode, string> = {
  ...ERROR_MESSAGES,
  OFFLINE: "You're offline. Check the server address in Settings.",
  TIMEOUT: "The server didn't answer. Try again.",
};

let socket: GameSocket | null = null;
let socketUrl: string | null = null;

/** Opens (or re-opens) the connection to the game server at `url`. Safe to call repeatedly. */
export function connect(url: string): void {
  if (socket && socketUrl === url) return;
  disconnect();

  const { setStatus } = useConnectionStore.getState();
  setStatus('connecting');
  socketUrl = url;
  socket = io(url, {
    transports: ['websocket'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 5000,
  });

  socket.on('connect', () => {
    setStatus('online');
    void rejoinSavedRoom();
  });
  socket.on('disconnect', () => setStatus('offline'));
  socket.on('connect_error', () => setStatus('offline'));

  socket.on('room:updated', applyRoomUpdate);
  socket.on('game:started', applyRoomUpdate);
}

export function disconnect(): void {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  socketUrl = null;
}

function applyRoomUpdate(room: Parameters<ServerToClientEvents['room:updated']>[0]): void {
  const session = useSessionStore.getState();
  if (room.code === session.roomCode) session.setRoom(room);
}

/**
 * After a reconnect (lost Wi-Fi, app restarted), take our seat back in the room we were in.
 * If the room is gone, forget it.
 */
async function rejoinSavedRoom(): Promise<void> {
  const { playerId, roomCode, enterRoom, clear } = useSessionStore.getState();
  if (!playerId || !roomCode) return;
  const result = await request((s) => s.emitWithAck('room:rejoin', { code: roomCode, playerId }));
  if (result.ok) {
    enterRoom(result.value.playerId, result.value.room);
  } else if (result.error !== 'OFFLINE' && result.error !== 'TIMEOUT') {
    clear();
    showToast('Your last room is closed.', 'info');
  }
}

/**
 * Sends one request and waits for the server's answer. Never throws:
 * offline and timeout become error results like any server error.
 */
export async function request<T>(
  send: (socket: GameSocket) => Promise<Result<T>>,
): Promise<ClientResult<T>> {
  if (!socket?.connected) return err('OFFLINE');
  try {
    return await send(socket.timeout(REQUEST_TIMEOUT_MS) as GameSocket);
  } catch {
    return err('TIMEOUT');
  }
}

export function errorMessage(code: ClientErrorCode): string {
  return CLIENT_ERROR_MESSAGES[code];
}
