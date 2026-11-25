import {
  type BrushSize,
  simplifyPoints,
  STROKE_MAX_POINTS,
  type Stroke,
  type StrokeProgress,
} from '@drawtopia/shared';
import { Canvas, Path } from '@shopify/react-native-skia';
import { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { colors, ink } from '../../theme/tokens';
import { buildStrokePath, strokeWidthFor } from './strokePath';
import { roundPoint, useStrokeStream } from './useStrokeStream';

export interface Brush {
  color: string;
  size: BrushSize;
}

interface DrawingCanvasProps {
  strokes: readonly Stroke[];
  /** Viewers see the drawing but cannot touch it. */
  editable: boolean;
  brush: Brush;
  onStrokeEnd?: (stroke: Stroke) => void;
  /** Strokes other players are drawing right now (live drawing), drawn on top. */
  liveStrokes?: readonly Stroke[];
  /** When set, the stroke being drawn is streamed while the finger moves. */
  onStrokeProgress?: (progress: StrokeProgress) => void;
}

/** Points closer than this (normalized) to the previous one are skipped. */
const MIN_STEP = 0.003;
/** Simplification tolerance (normalized units, ≈ 1 px on a 360 px canvas). */
const SIMPLIFY_EPSILON = 0.002;

const clamp01 = (v: number) => {
  'worklet';
  return Math.min(1, Math.max(0, v));
};

/**
 * Square drawing surface. The stroke being drawn lives on the UI thread (shared value →
 * Skia path) so drawing stays smooth; finished strokes are handed to JS, simplified,
 * and reported through `onStrokeEnd`. Coordinates are normalized to 0..1.
 */
export function DrawingCanvas({
  strokes,
  editable,
  brush,
  onStrokeEnd,
  liveStrokes,
  onStrokeProgress,
}: DrawingCanvasProps) {
  const [width, setWidth] = useState(0);
  const widthValue = useSharedValue(0);
  const livePoints = useSharedValue<number[]>([]);
  const stream = useStrokeStream(brush, onStrokeProgress);
  const streaming = onStrokeProgress !== undefined;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    widthValue.value = w;
  };

  const commit = useCallback(
    (points: number[]) => {
      const id = stream.finish(); // same id as the live messages, so receivers swap them
      if (points.length < 2 || !onStrokeEnd) return;
      onStrokeEnd({
        id,
        color: brush.color,
        size: brush.size,
        points: simplifyPoints(points, SIMPLIFY_EPSILON).map(roundPoint),
      });
    },
    [brush.color, brush.size, onStrokeEnd, stream],
  );

  const pan = usePanGesture({
    enabled: editable,
    minDistance: 0,
    maxPointers: 1,
    onBegin: (e) => {
      const w = widthValue.value;
      if (w === 0) return;
      const x = clamp01(e.x / w);
      const y = clamp01(e.y / w);
      livePoints.value = [x, y];
      if (streaming) scheduleOnRN(stream.start, x, y);
    },
    onUpdate: (e) => {
      const w = widthValue.value;
      const pts = livePoints.value;
      if (w === 0 || pts.length === 0) return;
      const x = clamp01(e.x / w);
      const y = clamp01(e.y / w);
      const lastX = pts[pts.length - 2]!;
      const lastY = pts[pts.length - 1]!;
      if (Math.abs(x - lastX) < MIN_STEP && Math.abs(y - lastY) < MIN_STEP) return;

      if (pts.length >= STROKE_MAX_POINTS * 2) {
        // Long stroke: send what we have and continue seamlessly from the last point.
        scheduleOnRN(commit, pts);
        livePoints.value = [lastX, lastY, x, y];
        if (streaming) {
          scheduleOnRN(stream.start, lastX, lastY);
          scheduleOnRN(stream.push, x, y);
        }
        return;
      }
      livePoints.value = [...pts, x, y];
      if (streaming) scheduleOnRN(stream.push, x, y);
    },
    onFinalize: () => {
      const pts = livePoints.value;
      if (pts.length > 0) scheduleOnRN(commit, pts);
      livePoints.value = [];
    },
  });

  const livePath = useDerivedValue(() => buildStrokePath(livePoints.value, widthValue.value));

  // Finished strokes only rebuild their paths when the list or the canvas size changes.
  const finished = useMemo(
    () =>
      strokes.map((s) => ({
        id: s.id,
        path: buildStrokePath(s.points, width),
        color: s.color,
        width: strokeWidthFor(s.size, width),
      })),
    [strokes, width],
  );

  // Other players' strokes in progress change ~20×/s: kept apart so finished paths are not rebuilt.
  const live = useMemo(
    () =>
      (liveStrokes ?? []).map((s) => ({
        id: s.id,
        path: buildStrokePath(s.points, width),
        color: s.color,
        width: strokeWidthFor(s.size, width),
      })),
    [liveStrokes, width],
  );

  return (
    <View style={styles.frame} onLayout={onLayout} accessibilityLabel="Drawing canvas">
      <GestureDetector gesture={pan}>
        <Canvas style={styles.canvas}>
          {[...finished, ...live].map((s) => (
            <Path
              key={s.id}
              path={s.path}
              color={s.color}
              style="stroke"
              strokeWidth={s.width}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}
          <Path
            path={livePath}
            color={brush.color}
            style="stroke"
            strokeWidth={strokeWidthFor(brush.size, width)}
            strokeCap="round"
            strokeJoin="round"
          />
        </Canvas>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderWidth: ink.border,
    borderColor: colors.ink,
    borderRadius: ink.radius,
    overflow: 'hidden',
  },
  canvas: { flex: 1 },
});
