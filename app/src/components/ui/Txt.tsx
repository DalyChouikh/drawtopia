import { Text, type TextProps } from 'react-native';
import { type TypographyVariant, typography } from '../../theme/typography';

interface TxtProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/** Text with one of the design-system styles. */
export function Txt({ variant = 'body', color, align, style, ...rest }: TxtProps) {
  return (
    <Text
      style={[
        typography[variant],
        color ? { color } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
      maxFontSizeMultiplier={1.4}
      {...rest}
    />
  );
}
