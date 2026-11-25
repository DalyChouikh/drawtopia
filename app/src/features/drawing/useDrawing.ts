import type { Stroke } from '@drawtopia/shared';
import { useCallback, useState } from 'react';
import { colors } from '../../theme/tokens';
import type { Brush } from './DrawingCanvas';

/** Local drawing state: the list of strokes, the brush, undo and clear. */
export function useDrawing(initial: Stroke[] = []) {
  const [strokes, setStrokes] = useState<Stroke[]>(initial);
  const [brush, setBrush] = useState<Brush>({ color: colors.ink, size: 10 });

  const addStroke = useCallback((stroke: Stroke) => setStrokes((s) => [...s, stroke]), []);
  const undo = useCallback(() => setStrokes((s) => s.slice(0, -1)), []);
  const clear = useCallback(() => setStrokes([]), []);

  return { strokes, brush, setBrush, addStroke, undo, clear };
}
