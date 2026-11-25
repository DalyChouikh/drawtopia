import { createServer, type Server as HttpServer } from 'node:http';
import { RECONNECT_GRACE_MS } from '@drawtopia/shared';
import { Server } from 'socket.io';
import { RoomManager } from './rooms/RoomManager';
import { registerRoomHandlers } from './socket/roomHandlers';
import type { GameServer } from './socket/types';

export interface GameServerOptions {
  corsOrigin?: string;
  reconnectGraceMs?: number;
  rooms?: RoomManager;
}

export interface GameServerInstance {
  httpServer: HttpServer;
  io: GameServer;
  rooms: RoomManager;
  close: () => Promise<void>;
}

/** Builds the HTTP + Socket.IO server without starting to listen (so tests can pick a port). */
export function createGameServer(options: GameServerOptions = {}): GameServerInstance {
  const rooms = options.rooms ?? new RoomManager();
  const pendingRemovals = new Map<string, NodeJS.Timeout>();

  const httpServer = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, rooms: rooms.roomCount }));
      return;
    }
    res.writeHead(404).end();
  });

  const io: GameServer = new Server(httpServer, {
    cors: { origin: options.corsOrigin ?? '*' },
  });

  io.on('connection', (socket) => {
    registerRoomHandlers(socket, {
      io,
      rooms,
      reconnectGraceMs: options.reconnectGraceMs ?? RECONNECT_GRACE_MS,
      pendingRemovals,
    });
  });

  const close = async () => {
    pendingRemovals.forEach(clearTimeout);
    pendingRemovals.clear();
    await io.close(); // also closes the HTTP server
  };

  return { httpServer, io, rooms, close };
}
