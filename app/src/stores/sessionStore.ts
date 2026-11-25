import type { RoomSnapshot } from '@drawtopia/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistentStorage, storageKey } from './storage';

interface SessionState {
  /** Our id in the current room (given by the server). Persisted to rejoin after a restart. */
  playerId: string | null;
  roomCode: string | null;
  /** Live room state from the server. Not persisted: always refreshed from the server. */
  room: RoomSnapshot | null;
  enterRoom: (playerId: string, room: RoomSnapshot) => void;
  setRoom: (room: RoomSnapshot) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      playerId: null,
      roomCode: null,
      room: null,
      enterRoom: (playerId, room) => set({ playerId, roomCode: room.code, room }),
      setRoom: (room) => set({ room }),
      clear: () => set({ playerId: null, roomCode: null, room: null }),
    }),
    {
      name: storageKey('session'),
      storage: persistentStorage,
      version: 1,
      partialize: ({ playerId, roomCode }) => ({ playerId, roomCode }),
    },
  ),
);
