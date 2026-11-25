import type { FeedEvent, GameView, Stroke } from '@drawtopia/shared';
import { create } from 'zustand';

const MAX_FEED = 60;

export interface FeedEntry {
  id: number;
  event: FeedEvent;
}

interface GameState {
  /** This player's view of the running game, as last sent by the server. */
  view: GameView | null;
  /** Local time the view arrived, to turn `remainingMs` into a countdown. */
  receivedAt: number;
  feed: FeedEntry[];
  /** Live Draw & Guess drawing (server copy + strokes relayed since). */
  strokes: Stroke[];
  setView: (view: GameView) => void;
  pushFeed: (event: FeedEvent) => void;
  addStroke: (stroke: Stroke) => void;
  undoStroke: () => void;
  clearStrokes: () => void;
  reset: () => void;
}

let feedId = 0;

/** Live game state. Not persisted: after a restart it is re-sent by the server. */
export const useGameStore = create<GameState>()((set) => ({
  view: null,
  receivedAt: 0,
  feed: [],
  strokes: [],
  setView: (view) =>
    set((s) => ({
      view,
      receivedAt: Date.now(),
      // The server's copy of the drawing is the reference; a new turn starts a blank canvas.
      strokes: view.mode === 'draw-guess' ? view.strokes : s.strokes,
      feed: s.view?.mode === view.mode ? s.feed : [],
    })),
  pushFeed: (event) =>
    set((s) => ({ feed: [...s.feed, { id: feedId++, event }].slice(-MAX_FEED) })),
  addStroke: (stroke) => set((s) => ({ strokes: [...s.strokes, stroke] })),
  undoStroke: () => set((s) => ({ strokes: s.strokes.slice(0, -1) })),
  clearStrokes: () => set({ strokes: [] }),
  reset: () => set({ view: null, receivedAt: 0, feed: [], strokes: [] }),
}));
