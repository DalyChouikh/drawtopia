import { BRUSH_SIZES } from '@drawtopia/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { Txt } from '../../components/ui/Txt';
import { haptics } from '../../services/haptics';
import { colors, ink, TOUCH_MIN } from '../../theme/tokens';
import type { Brush } from './DrawingCanvas';

/** Marker colours available while drawing. White is the eraser (the canvas is white). */
export const PALETTE = [
  colors.ink,
  '#FF5A4E',
  '#FF9F1C',
  '#FFD23F',
  '#B6F03C',
  '#2EC4B6',
  '#3D7BFF',
  '#9B5DE5',
  '#FF8AD8',
  '#8B5E3C',
] as const;
export const ERASER = colors.white;

interface DrawingToolbarProps {
  brush: Brush;
  onBrushChange: (brush: Brush) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
}

export function DrawingToolbar({
  brush,
  onBrushChange,
  onUndo,
  onClear,
  canUndo,
}: DrawingToolbarProps) {
  const pick = (patch: Partial<Brush>) => {
    haptics.tap();
    onBrushChange({ ...brush, ...patch });
  };

  return (
    <View style={styles.container}>
      <View style={styles.palette} accessibilityRole="radiogroup" accessibilityLabel="Colours">
        {PALETTE.map((c) => (
          <Pressable
            key={c}
            onPress={() => pick({ color: c })}
            accessibilityRole="radio"
            accessibilityState={{ selected: brush.color === c }}
            accessibilityLabel={`Colour ${c}`}
            hitSlop={4}
            style={[styles.swatch, { backgroundColor: c }, brush.color === c && styles.selected]}
          />
        ))}
      </View>

      <View style={styles.row}>
        {BRUSH_SIZES.map((size) => (
          <ToolButton
            key={size}
            label={`Brush size ${size}`}
            selected={brush.size === size && brush.color !== ERASER}
            onPress={() => pick({ size, color: brush.color === ERASER ? colors.ink : brush.color })}
          >
            <View
              style={[
                styles.dot,
                { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 },
              ]}
            />
          </ToolButton>
        ))}
        <ToolButton
          label="Eraser"
          selected={brush.color === ERASER}
          onPress={() => pick({ color: ERASER, size: BRUSH_SIZES[2] })}
        >
          <Txt variant="label">ERASE</Txt>
        </ToolButton>
        <ToolButton label="Undo" onPress={onUndo} disabled={!canUndo}>
          <Txt variant="heading">↶</Txt>
        </ToolButton>
        <ToolButton label="Clear drawing" onPress={onClear} disabled={!canUndo}>
          <Txt variant="heading">✕</Txt>
        </ToolButton>
      </View>
    </View>
  );
}

function ToolButton({
  label,
  selected = false,
  disabled = false,
  onPress,
  children,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.tool,
        selected && styles.toolSelected,
        pressed && styles.toolPressed,
        disabled && styles.toolDisabled,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  /** 10 colours as two rows of 5. */
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    width: 5 * 34 + 4 * 14,
  },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2.5, borderColor: colors.ink },
  selected: { transform: [{ scale: 1.2 }], borderWidth: 4 },
  tool: {
    minWidth: TOUCH_MIN,
    height: TOUCH_MIN,
    paddingHorizontal: 6,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radiusSmall,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolSelected: { backgroundColor: colors.yellow },
  toolPressed: { transform: [{ translateY: 2 }] },
  toolDisabled: { opacity: 0.4 },
  dot: { backgroundColor: colors.ink },
});
