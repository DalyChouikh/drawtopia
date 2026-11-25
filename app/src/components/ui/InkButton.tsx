import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { haptics } from '../../services/haptics';
import { colors, ink, onSurface, type SurfaceColor, TOUCH_MIN } from '../../theme/tokens';
import { Txt } from './Txt';

interface InkButtonProps {
  label: string;
  onPress: () => void;
  color?: SurfaceColor;
  size?: 'md' | 'lg';
  tilt?: number;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const PRESS_MS = 70;

/**
 * The main button: ink outline, hard shadow, and the face "slams" into its shadow when pressed.
 */
export function InkButton({
  label,
  onPress,
  color = 'white',
  size = 'md',
  tilt = 0,
  icon,
  disabled = false,
  loading = false,
  accessibilityHint,
  style,
}: InkButtonProps) {
  const pressed = useSharedValue(0);
  const inactive = disabled || loading;

  const faceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * ink.shadow },
      { translateY: pressed.value * ink.shadow },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: PRESS_MS });
        haptics.tap();
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: PRESS_MS });
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[styles.wrapper, tilt ? { transform: [{ rotate: `${tilt}deg` }] } : null, style]}
    >
      <View style={[styles.shadow, inactive && styles.shadowMuted]} />
      <Animated.View
        style={[
          styles.face,
          size === 'lg' && styles.faceLarge,
          { backgroundColor: inactive ? colors.paperLine : colors[color] },
          faceStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <>
            {icon}
            {/* One line, shrinking a little if needed, so a long label never wraps into the border. */}
            <Txt
              variant={size === 'lg' ? 'title' : 'heading'}
              color={inactive ? colors.muted : onSurface[color]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              style={styles.label}
            >
              {label}
            </Txt>
          </>
        )}
      </Animated.View>
    </Pressable>
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
  shadowMuted: { backgroundColor: colors.muted },
  face: {
    minHeight: TOUCH_MIN + 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  faceLarge: { minHeight: 64 },
  label: { flexShrink: 1, textAlign: 'center' },
});
