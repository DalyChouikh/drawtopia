import type { GameView } from '@drawtopia/shared';
import { useGameStore } from '../stores/gameStore';
import { useHistoryStore } from '../stores/historyStore';

/**
 * Every game view from the server goes through here: it updates the live game, and as soon
 * as a view carries the final result, that result is saved to the local history.
 */
export function applyGameView(view: GameView): void {
  useGameStore.getState().setView(view);
  if (view.result) useHistoryStore.getState().addGame(view.result);
}
