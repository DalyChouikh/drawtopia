import type { GameMode, GameResult } from '@drawtopia/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistentStorage, storageKey } from './storage';

/**
 * Kept small on purpose: Draw & Pass results contain drawings, and Android's AsyncStorage
 * stores each key in a single database row (about 2 MB max).
 */
export const MAX_HISTORY = 20;

interface HistoryState {
  /** Finished games, newest first. Persisted: survives closing the app. */
  games: GameResult[];
  /** Saves a finished game once (the server may send the final view more than once). */
  addGame: (result: GameResult) => void;
  removeGame: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      games: [],
      addGame: (result) => {
        if (get().games.some((g) => g.id === result.id)) return;
        set({ games: [result, ...get().games].slice(0, MAX_HISTORY) });
      },
      removeGame: (id) => set({ games: get().games.filter((g) => g.id !== id) }),
    }),
    { name: storageKey('history'), storage: persistentStorage, version: 1 },
  ),
);

/** Games of one mode (or all), newest first. */
export function filterGames(games: GameResult[], mode: GameMode | 'all'): GameResult[] {
  return mode === 'all' ? games : games.filter((g) => g.mode === mode);
}
