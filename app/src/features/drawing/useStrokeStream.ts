import {
  STROKE_PROGRESS_MAX_POINTS,
  STROKE_STREAM_INTERVAL_MS,
  type StrokeProgress,
} from '@drawtopia/shared';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Brush } from './DrawingCanvas';

let strokeCounter = 0;
export const newStrokeId = () => `${Date.now().toString(36)}-${(strokeCounter++).toString(36)}`;

/** 4 decimals ≈ 0.04 px on a 400 px canvas: invisible, but much smaller messages. */
export const roundPoint = (v: number) => Math.round(v * 1e4) / 1e4;

/**
 * Live drawing: collects the points of the stroke being drawn and sends the new ones every
 * STROKE_STREAM_INTERVAL_MS, so other players watch the line grow instead of waiting for the
 * finger to lift. Without `onProgress` it only hands out stroke ids.
 */
export function useStrokeStream(brush: Brush, onProgress?: (progress: StrokeProgress) => void) {
  const current = useRef<{ id: string; pending: number[] } | null>(null);
  const brushRef = useRef(brush);

  useEffect(() => {
    brushRef.current = brush;
  }, [brush]);

  const flush = useCallback(() => {
    const stroke = current.current;
    if (!onProgress || !stroke || stroke.pending.length < 2) return;
    const points = stroke.pending.splice(0, STROKE_PROGRESS_MAX_POINTS * 2).map(roundPoint);
    onProgress({
      id: stroke.id,
      color: brushRef.current.color,
      size: brushRef.current.size,
      points,
    });
  }, [onProgress]);

  useEffect(() => {
    if (!onProgress) return;
    const timer = setInterval(flush, STROKE_STREAM_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [onProgress, flush]);

  /** A new stroke starts at (x, y). */
  const start = useCallback((x: number, y: number) => {
    current.current = { id: newStrokeId(), pending: [x, y] };
  }, []);

  const push = useCallback((x: number, y: number) => {
    current.current?.pending.push(x, y);
  }, []);

  /** The stroke is complete: returns its id (shared with the live messages) and stops streaming it. */
  const finish = useCallback((): string => {
    const id = current.current?.id ?? newStrokeId();
    current.current = null;
    return id;
  }, []);

  return useMemo(() => ({ start, push, finish }), [start, push, finish]);
}
