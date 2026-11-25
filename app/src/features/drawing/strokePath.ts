import { Skia, type SkPath } from '@shopify/react-native-skia';

/**
 * Builds a smooth Skia path from normalized points [x0, y0, x1, y1, …] for a canvas of
 * `width` pixels (the canvas is square). Consecutive points are joined with quadratic
 * curves through their midpoints, which hides the jaggedness of raw touch samples.
 * Marked as a worklet so it can run on the UI thread while the finger moves.
 */
export function buildStrokePath(points: readonly number[], width: number): SkPath {
  'worklet';
  const builder = Skia.PathBuilder.Make();
  const count = points.length / 2;
  if (count === 0) return builder.detach();

  const x0 = points[0]! * width;
  const y0 = points[1]! * width;
  builder.moveTo(x0, y0);
  if (count === 1) {
    builder.lineTo(x0 + 0.1, y0); // a tap draws a dot (round cap)
    return builder.detach();
  }

  let prevX = x0;
  let prevY = y0;
  for (let i = 1; i < count; i++) {
    const x = points[i * 2]! * width;
    const y = points[i * 2 + 1]! * width;
    builder.quadTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2);
    prevX = x;
    prevY = y;
  }
  builder.lineTo(prevX, prevY);
  return builder.detach();
}

/** Brush sizes are defined for a 360 px wide canvas and scaled to the real width. */
export const REFERENCE_WIDTH = 360;
export function strokeWidthFor(size: number, width: number): number {
  return (size * width) / REFERENCE_WIDTH;
}
