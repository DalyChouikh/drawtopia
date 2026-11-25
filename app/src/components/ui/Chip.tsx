import { Pressable, StyleSheet } from 'react-native';
import { haptics } from '../../services/haptics';
import { colors, ink, TOUCH_MIN } from '../../theme/tokens';
import { Txt } from './Txt';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

/** A selectable option (segmented choices like 30 / 60 / 90 s). */
export function Chip({ label, selected, onPress, disabled = false }: ChipProps) {
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Txt variant="number" style={styles.text}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: TOUCH_MIN,
    minWidth: TOUCH_MIN,
    paddingHorizontal: 14,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.yellow, borderWidth: 4 },
  pressed: { transform: [{ translateY: 2 }] },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16 },
});
