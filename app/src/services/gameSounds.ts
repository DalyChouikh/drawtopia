import type { FeedEvent, GameView } from '@drawtopia/shared';
import { useGameStore } from '../stores/gameStore';
import { useSessionStore } from '../stores/sessionStore';
import { playSound, type SoundName } from './sounds';

/** Identifies one moment of the game; a sound plays only when it changes (not on re-syncs). */
function momentOf(view: GameView): string {
  return view.mode === 'draw-guess'
    ? `guess:${view.turn}:${view.phase}`
    : `pass:${view.step}:${view.phase}`;
}

function soundForView(view: GameView): SoundName | null {
  if (view.phase === 'finished') return 'gameover';
  if (view.mode === 'draw-pass') return 'start';
  if (view.phase === 'drawing') return 'start';
  if (view.phase === 'reveal') return 'reveal';
  return null;
}

function soundForFeed(event: FeedEvent, myId: string | null): SoundName | null {
  if (event.kind === 'guessed') return event.playerId === myId ? 'correct' : 'ding';
  if (event.kind === 'close' && event.playerId === myId) return 'close';
  return null;
}

/** Plays game sounds from the live game state: turn start, reveal, guesses, game over. */
export function initGameSounds(): void {
  useGameStore.subscribe((state, prev) => {
    if (state.view && (!prev.view || momentOf(state.view) !== momentOf(prev.view))) {
      const sound = soundForView(state.view);
      if (sound) playSound(sound);
    }
    const last = state.feed.at(-1);
    if (last && last !== prev.feed.at(-1)) {
      const sound = soundForFeed(last.event, useSessionStore.getState().playerId);
      if (sound) playSound(sound);
    }
  });
}
