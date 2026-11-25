import type { TextStyle } from 'react-native';
import { colors, fonts } from './tokens';

/**
 * Text styles. Hand-lettered fonts for the personality, Space Grotesk for numbers and
 * inputs so they stay easy to read on small screens.
 */
export const typography = {
  display: { fontFamily: fonts.marker, fontSize: 40, lineHeight: 48, color: colors.ink },
  title: { fontFamily: fonts.hand, fontSize: 32, lineHeight: 38, color: colors.ink },
  heading: { fontFamily: fonts.hand, fontSize: 24, lineHeight: 30, color: colors.ink },
  body: { fontFamily: fonts.hand, fontSize: 20, lineHeight: 26, color: colors.ink },
  label: { fontFamily: fonts.sansBold, fontSize: 14, lineHeight: 18, color: colors.ink },
  caption: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.muted },
  number: { fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 22, color: colors.ink },
  input: { fontFamily: fonts.sans, fontSize: 18, lineHeight: 24, color: colors.ink },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
