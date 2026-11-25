/**
 * Design tokens: the "neobrutalism + sketchbook" look, marker-brights palette.
 * Source of truth for colours is brand/BRAND.md.
 */
export const colors = {
  ink: '#1A1A1A',
  paper: '#FBF7EE',
  paperLine: '#E8E1D1',
  white: '#FFFFFF',
  muted: '#5F5A4F',
  yellow: '#FFD23F',
  blue: '#3D7BFF',
  red: '#FF5A4E',
  lime: '#B6F03C',
  /** Translucent yellow for tape strips. */
  tape: 'rgba(255, 226, 120, 0.75)',
} as const;

export type SurfaceColor = 'paper' | 'white' | 'yellow' | 'blue' | 'red' | 'lime';

/** Text colour that stays readable (≥ 4.5:1) on each surface. */
export const onSurface: Record<SurfaceColor, string> = {
  paper: colors.ink,
  white: colors.ink,
  yellow: colors.ink,
  blue: colors.ink, // white on this blue is only ~3.8:1
  red: colors.ink,
  lime: colors.ink,
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const ink = {
  /** Outline width of every card, button and input. */
  border: 3,
  /** Hard shadow offset (down-right). */
  shadow: 4,
  radius: 12,
  radiusSmall: 8,
} as const;

/** Font family names, as registered by useFonts in the root layout. */
export const fonts = {
  marker: 'PermanentMarker_400Regular',
  hand: 'PatrickHand_400Regular',
  sans: 'SpaceGrotesk_500Medium',
  sansBold: 'SpaceGrotesk_700Bold',
} as const;

/** Minimum touch target (Android guideline: 48 dp). */
export const TOUCH_MIN = 48;
