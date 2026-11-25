import { createSeededRng } from '@drawtopia/shared';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';

const PIECE_COLORS = [colors.red, colors.blue, colors.lime, colors.yellow, '#FF8AD8', '#9B5DE5'];
const PIECES = 26;
const DURATION_MS = 1400;
const GRAVITY = 520;

interface Piece {
  angle: number;
  distance: number;
  spin: number;
  color: string;
  size: number;
}

/**
 * A burst of paper confetti. Bursts again every time `trigger` changes to a new non-zero value.
 * Disabled when the phone asks for reduced motion.
 */
export function Confetti({ trigger }: { trigger: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(1);

  // Seeded by the trigger: every burst looks different, but rendering stays pure.
  const pieces = useMemo<Piece[]>(() => {
    const random = createSeededRng(trigger);
    return Array.from({ length: PIECES }, (_, i) => ({
      angle: -Math.PI / 2 + (random() - 0.5) * Math.PI * 1.4,
      distance: 120 + random() * 160,
      spin: (random() - 0.5) * 900,
      color: PIECE_COLORS[i % PIECE_COLORS.length]!,
      size: 8 + random() * 8,
    }));
  }, [trigger]);

  useEffect(() => {
    if (trigger === 0 || reduceMotion) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: DURATION_MS, easing: Easing.out(Easing.quad) });
  }, [trigger, reduceMotion, progress]);

  if (trigger === 0 || reduceMotion) return null;

  return (
    <View pointerEvents="none" style={styles.layer} accessibilityElementsHidden>
      {pieces.map((piece, i) => (
        <ConfettiPiece key={`${trigger}-${i}`} piece={piece} progress={progress} />
      ))}
    </View>
  );
}

function ConfettiPiece({ piece, progress }: { piece: Piece; progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p >= 1 ? 0 : 1 - p * p,
      transform: [
        { translateX: Math.cos(piece.angle) * piece.distance * p },
        { translateY: Math.sin(piece.angle) * piece.distance * p + GRAVITY * p * p },
        { rotate: `${piece.spin * p}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.piece,
        { width: piece.size, height: piece.size * 0.6, backgroundColor: piece.color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  piece: { position: 'absolute', borderWidth: 1.5, borderColor: colors.ink },
});
