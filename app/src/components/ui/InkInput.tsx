import { useEffect } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, ink, TOUCH_MIN } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { Txt } from './Txt';

interface InkInputProps extends TextInputProps {
  label: string;
  /** Shown under the field in red; the field shakes when a new error appears. */
  error?: string | null;
  hint?: string;
}

/** Labelled text field with an inline error message. */
export function InkInput({ label, error, hint, style, ...rest }: InkInputProps) {
  const shake = useSharedValue(0);

  useEffect(() => {
    if (!error) return;
    shake.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [error, shake]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  return (
    <View style={styles.container}>
      <Txt variant="label">{label}</Txt>
      <Animated.View style={shakeStyle}>
        <TextInput
          placeholderTextColor={colors.muted}
          accessibilityLabel={label}
          style={[styles.input, error ? styles.inputError : null, style]}
          {...rest}
        />
      </Animated.View>
      {error ? (
        <Txt variant="caption" color="#B3261E" accessibilityLiveRegion="polite">
          {error}
        </Txt>
      ) : hint ? (
        <Txt variant="caption">{hint}</Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  input: {
    ...typography.input,
    minHeight: TOUCH_MIN,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlignVertical: 'center',
    backgroundColor: colors.white,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
  },
  inputError: { borderColor: '#B3261E', backgroundColor: '#FFF1EF' },
});
