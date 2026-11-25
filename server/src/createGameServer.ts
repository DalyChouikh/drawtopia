import { createServer, type Server as HttpServer } from 'node:http';
import { RECONNECT_GRACE_MS } from '@drawtopia/shared';
import { Server } from 'socket.io';
import { GameManager } from './game/GameManager';
import { RoomManager } from './rooms/RoomManager';
import { registerGameHandlers } from './socket/gameHandlers';
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
  games: GameManager;
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

  const games = new GameManager(io, rooms);

  io.on('connection', (socket) => {
    registerGameHandlers(socket, games);
    registerRoomHandlers(socket, {
      io,
      rooms,
      games,
      reconnectGraceMs: options.reconnectGraceMs ?? RECONNECT_GRACE_MS,
      pendingRemovals,
    });
  });

  const close = async () => {
    pendingRemovals.forEach(clearTimeout);
    pendingRemovals.clear();
    games.disposeAll();
    await io.close(); // also closes the HTTP server
  };

  return { httpServer, io, rooms, games, close };
}
