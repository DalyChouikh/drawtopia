import type { TextStyle } from 'react-native';
import { colors, fonts } from './tokens';

/**
 * Text styles. Hand-lettered fonts for the personality, Space Grotesk for numbers and
 * inputs so they stay easy to read on small screens.
 *
 * The hand fonts (Patrick Hand, Permanent Marker) draw tall capitals and deep descenders,
 * so every line height is about 1.35–1.4× the font size: a tighter line box crops the top of
 * capitals and the tails of g/y/p, especially on iOS.
 */
export const typography = {
  display: { fontFamily: fonts.marker, fontSize: 40, lineHeight: 56, color: colors.ink },
  title: { fontFamily: fonts.hand, fontSize: 32, lineHeight: 44, color: colors.ink },
  heading: { fontFamily: fonts.hand, fontSize: 24, lineHeight: 34, color: colors.ink },
  body: { fontFamily: fonts.hand, fontSize: 20, lineHeight: 28, color: colors.ink },
  label: { fontFamily: fonts.sansBold, fontSize: 14, lineHeight: 20, color: colors.ink },
  caption: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.muted },
  number: { fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 24, color: colors.ink },
  /** No lineHeight on purpose: on TextInput it misplaces or crops the text (iOS in particular). */
  input: { fontFamily: fonts.sans, fontSize: 18, color: colors.ink },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
