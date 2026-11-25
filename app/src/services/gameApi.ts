import type { GameView, PassSubmitPayload, Stroke } from '@drawtopia/shared';
import { useGameStore } from '../stores/gameStore';
import { type ClientResult, emit, request } from './gameClient';

/** Asks the server for this player's current view (on screen open or after a reconnect). */
export async function syncGame(): Promise<ClientResult<GameView>> {
  const result = await request((s) => s.emitWithAck('game:sync'));
  if (result.ok) useGameStore.getState().setView(result.value);
  return result;
}

export const chooseWord = (word: string) =>
  request((s) => s.emitWithAck('game:choose-word', { word }));

export const sendGuess = (text: string) => request((s) => s.emitWithAck('game:guess', { text }));

export const submitPassEntry = (payload: PassSubmitPayload) =>
  request((s) => s.emitWithAck('pass:submit', payload));

/** Drawer actions: applied locally at once, then relayed by the server to the others. */
export function sendStroke(stroke: Stroke): void {
  useGameStore.getState().addStroke(stroke);
  emit((s) => s.emit('draw:stroke', stroke));
}

export function sendUndo(): void {
  useGameStore.getState().undoStroke();
  emit((s) => s.emit('draw:undo'));
}

export function sendClear(): void {
  useGameStore.getState().clearStrokes();
  emit((s) => s.emit('draw:clear'));
}
