import type { GameMode, RoomSettings } from '@drawtopia/shared';
import { DEFAULT_ROUNDS, DEFAULT_ROUND_DURATION } from '@drawtopia/shared';
import type { SurfaceColor } from '../../theme/tokens';

export const GAME_MODES: Record<GameMode, { label: string; tagline: string; color: SurfaceColor }> =
  {
    'draw-guess': {
      label: 'Draw & Guess',
      tagline: 'One player draws a secret word, everyone races to guess it.',
      color: 'yellow',
    },
    'draw-pass': {
      label: 'Draw & Pass',
      tagline: 'Write a sentence, draw the one you get, pass it on. Laugh at the chains.',
      color: 'lime',
    },
  };

export const DEFAULT_SETTINGS: RoomSettings = {
  mode: 'draw-guess',
  visibility: 'private',
  roundDuration: DEFAULT_ROUND_DURATION,
  rounds: DEFAULT_ROUNDS,
};
