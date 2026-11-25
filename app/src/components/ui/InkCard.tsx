import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, ink, type SurfaceColor } from '../../theme/tokens';

interface InkCardProps {
  children: ReactNode;
  color?: SurfaceColor;
  /** Small rotation in degrees for the "stuck in a sketchbook" look. */
  tilt?: number;
  shadow?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * A flat card with a thick ink outline and a hard shadow down-right.
 * Native shadows are soft, so the shadow is a plain ink block drawn behind the card.
 */
export function InkCard({
  children,
  color = 'white',
  tilt = 0,
  shadow = true,
  padded = true,
  style,
}: InkCardProps) {
  return (
    <View style={[styles.wrapper, tilt ? { transform: [{ rotate: `${tilt}deg` }] } : null, style]}>
      {shadow && <View style={styles.shadow} />}
      <View style={[styles.face, { backgroundColor: colors[color] }, padded && styles.padded]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginRight: ink.shadow, marginBottom: ink.shadow },
  shadow: {
    position: 'absolute',
    top: ink.shadow,
    left: ink.shadow,
    right: -ink.shadow,
    bottom: -ink.shadow,
    borderRadius: ink.radius,
    backgroundColor: colors.ink,
  },
  face: {
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radius,
    overflow: 'hidden',
  },
  padded: { padding: 16 },
});
