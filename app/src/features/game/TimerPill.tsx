import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Txt } from '../../components/ui/Txt';
import { colors, ink } from '../../theme/tokens';

const URGENT_SECONDS = 10;

/** Countdown badge. Turns red and pulses during the last 10 seconds. */
export function TimerPill({ seconds }: { seconds: number }) {
  const urgent = seconds > 0 && seconds <= URGENT_SECONDS;
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = urgent
      ? withRepeat(
          withSequence(withTiming(1.12, { duration: 250 }), withTiming(1, { duration: 250 })),
          -1,
        )
      : withTiming(1);
  }, [urgent, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[styles.pill, { backgroundColor: urgent ? colors.red : colors.lime }, style]}
      accessibilityLabel={`${seconds} seconds left`}
      accessibilityRole="timer"
    >
      <Txt variant="number">{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
    boxShadow: `3px 3px 0px ${colors.ink}`,
  },
});
