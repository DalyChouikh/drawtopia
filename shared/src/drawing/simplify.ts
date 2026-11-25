/**
 * Ramer–Douglas–Peucker simplification for strokes stored as flat [x0, y0, x1, y1, …] arrays.
 * Removes points that deviate less than `epsilon` from the line between their neighbours,
 * so a stroke keeps its shape with far fewer points to send over the network.
 */
export function simplifyPoints(points: readonly number[], epsilon: number): number[] {
  const count = points.length / 2;
  if (count <= 2) return [...points];

  const keep = new Uint8Array(count);
  keep[0] = 1;
  keep[count - 1] = 1;

  // Iterative (explicit stack) to avoid deep recursion on long strokes.
  const stack: [number, number][] = [[0, count - 1]];
  const epsilonSq = epsilon * epsilon;

  while (stack.length > 0) {
    const [first, last] = stack.pop()!;
    let farthest = -1;
    let farthestDistSq = epsilonSq;

    for (let i = first + 1; i < last; i++) {
      const d = segmentDistanceSq(points, i, first, last);
      if (d > farthestDistSq) {
        farthestDistSq = d;
        farthest = i;
      }
    }

    if (farthest !== -1) {
      keep[farthest] = 1;
      stack.push([first, farthest], [farthest, last]);
    }
  }

  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    if (keep[i]) result.push(points[i * 2]!, points[i * 2 + 1]!);
  }
  return result;
}

/** Squared distance from point p to the segment a–b (indexes are point indexes, not array indexes). */
function segmentDistanceSq(points: readonly number[], p: number, a: number, b: number): number {
  const px = points[p * 2]!;
  const py = points[p * 2 + 1]!;
  const ax = points[a * 2]!;
  const ay = points[a * 2 + 1]!;
  const bx = points[b * 2]!;
  const by = points[b * 2 + 1]!;

  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  const cx = ax + t * dx - px;
  const cy = ay + t * dy - py;
  return cx * cx + cy * cy;
}
