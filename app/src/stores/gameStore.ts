import type { FeedEvent, GameView, Stroke, StrokeProgress } from '@drawtopia/shared';
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
  /** Strokes the drawer is drawing right now (live drawing), by stroke id. */
  liveStrokes: Record<string, Stroke>;
  setView: (view: GameView) => void;
  pushFeed: (event: FeedEvent) => void;
  addStroke: (stroke: Stroke) => void;
  appendLiveStroke: (progress: StrokeProgress) => void;
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
  liveStrokes: {},
  setView: (view) =>
    set((s) => ({
      view,
      // Live strokes only make sense while the same turn is being drawn.
      liveStrokes:
        view.mode === 'draw-guess' &&
        view.phase === 'drawing' &&
        s.view?.mode === 'draw-guess' &&
        s.view.turn === view.turn
          ? s.liveStrokes
          : {},
      receivedAt: Date.now(),
      // The server's copy of the drawing is the reference; a new turn starts a blank canvas.
      strokes: view.mode === 'draw-guess' ? view.strokes : s.strokes,
      feed: s.view?.mode === view.mode ? s.feed : [],
    })),
  pushFeed: (event) =>
    set((s) => ({ feed: [...s.feed, { id: feedId++, event }].slice(-MAX_FEED) })),
  // A finished stroke replaces its live version (same id).
  addStroke: (stroke) =>
    set((s) => {
      const { [stroke.id]: _replaced, ...stillLive } = s.liveStrokes;
      return { strokes: [...s.strokes, stroke], liveStrokes: stillLive };
    }),
  appendLiveStroke: (progress) =>
    set((s) => {
      if (s.strokes.some((st) => st.id === progress.id)) return s; // already finished
      const previous = s.liveStrokes[progress.id];
      const stroke = previous
        ? { ...previous, points: [...previous.points, ...progress.points] }
        : progress;
      return { liveStrokes: { ...s.liveStrokes, [progress.id]: stroke } };
    }),
  undoStroke: () => set((s) => ({ strokes: s.strokes.slice(0, -1) })),
  clearStrokes: () => set({ strokes: [], liveStrokes: {} }),
  reset: () => set({ view: null, receivedAt: 0, feed: [], strokes: [], liveStrokes: {} }),
}));
