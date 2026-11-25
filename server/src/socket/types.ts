import type { ClientToServerEvents, ServerToClientEvents, SocketData } from '@drawtopia/shared';
import type { Server, Socket } from 'socket.io';

/** No server-to-server events are used. */
type InterServerEvents = Record<string, never>;

export type GameServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type GameSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
