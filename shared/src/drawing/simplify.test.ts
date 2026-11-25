import { describe, expect, it } from 'vitest';
import { simplifyPoints } from './simplify';

describe('simplifyPoints', () => {
  it('keeps strokes of one or two points as they are', () => {
    expect(simplifyPoints([0.1, 0.1], 0.01)).toEqual([0.1, 0.1]);
    expect(simplifyPoints([0, 0, 1, 1], 0.01)).toEqual([0, 0, 1, 1]);
  });

  it('removes points lying on a straight line', () => {
    const line = [0, 0, 0.25, 0.25, 0.5, 0.5, 0.75, 0.75, 1, 1];
    expect(simplifyPoints(line, 0.001)).toEqual([0, 0, 1, 1]);
  });

  it('keeps the corner of an L shape', () => {
    const corner = [0, 0, 0.5, 0, 1, 0, 1, 0.5, 1, 1];
    expect(simplifyPoints(corner, 0.001)).toEqual([0, 0, 1, 0, 1, 1]);
  });

  it('drops tiny jitter below epsilon but keeps the overall shape', () => {
    const jittery = [0, 0, 0.1, 0.0005, 0.2, -0.0004, 0.3, 0.0003, 0.4, 0];
    expect(simplifyPoints(jittery, 0.002)).toEqual([0, 0, 0.4, 0]);
  });

  it('never returns more points than it received', () => {
    const wave = Array.from({ length: 400 }, (_, i) =>
      i % 2 === 0 ? i / 400 : Math.sin(i / 20) / 2 + 0.5,
    );
    const simplified = simplifyPoints(wave, 0.002);
    expect(simplified.length).toBeLessThanOrEqual(wave.length);
    expect(simplified.length % 2).toBe(0);
  });
});
