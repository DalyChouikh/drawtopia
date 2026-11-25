import { describe, expect, it } from 'vitest';
import { HIDDEN, maskWord, planHints } from './hints';
import { createSeededRng, sample } from './random';
import { isRoundOver, pickWordChoices } from './round';
import { drawerPoints, guesserPoints, rankPlayers } from './scoring';

describe('guesserPoints', () => {
  it('gives 500 for an instant guess and 100 at the last second', () => {
    expect(guesserPoints(60, 60)).toBe(500);
    expect(guesserPoints(30, 60)).toBe(300);
    expect(guesserPoints(0, 60)).toBe(100);
  });

  it('clamps out-of-range times', () => {
    expect(guesserPoints(-5, 60)).toBe(100);
    expect(guesserPoints(90, 60)).toBe(500);
  });
});

describe('drawerPoints', () => {
  it('is proportional to the share of players who guessed', () => {
    expect(drawerPoints(2, 2)).toBe(250);
    expect(drawerPoints(1, 2)).toBe(125);
    expect(drawerPoints(0, 2)).toBe(0);
  });

  it('gives nothing when there is nobody to guess', () => {
    expect(drawerPoints(0, 0)).toBe(0);
  });
});

describe('rankPlayers', () => {
  it('sorts by score and shares ranks on ties (1, 1, 3)', () => {
    const ranked = rankPlayers([
      { id: 'a', score: 300 },
      { id: 'b', score: 500 },
      { id: 'c', score: 500 },
    ]);
    expect(ranked.map((p) => [p.id, p.rank])).toEqual([
      ['b', 1],
      ['c', 1],
      ['a', 3],
    ]);
  });
});

describe('maskWord', () => {
  it('hides letters but keeps spaces and hyphens visible', () => {
    expect(maskWord('rocket', new Set())).toBe('______');
    expect(maskWord('ice cream', new Set([0]))).toBe(`i${HIDDEN}${HIDDEN} _____`);
    expect(maskWord('t-shirt', new Set())).toBe('_-_____');
  });
});

describe('planHints', () => {
  it('reveals two letters at 50 % and 75 % of a 60 s round for a long word', () => {
    const hints = planHints('elephant', 60, createSeededRng(1));
    expect(hints.map((h) => h.revealAtSecond)).toEqual([30, 45]);
    expect(new Set(hints.map((h) => h.index)).size).toBe(2);
  });

  it('never reveals spaces and gives no hint for very short words', () => {
    expect(planHints('ox', 60, createSeededRng(1))).toEqual([]);
    const hints = planHints('ice cream', 60, createSeededRng(7));
    expect(hints.every((h) => 'ice cream'[h.index] !== ' ')).toBe(true);
  });
});

describe('pickWordChoices', () => {
  const words = ['cat', 'dog', 'sun', 'tree', 'house'];

  it('returns distinct words that were not used yet', () => {
    const picks = pickWordChoices(words, new Set(['cat', 'dog']), 3, createSeededRng(3));
    expect(picks).toHaveLength(3);
    expect(new Set(picks).size).toBe(3);
    expect(picks).not.toContain('cat');
    expect(picks).not.toContain('dog');
  });

  it('falls back to the whole list when almost every word was used', () => {
    const picks = pickWordChoices(
      words,
      new Set(['cat', 'dog', 'sun', 'tree']),
      3,
      createSeededRng(3),
    );
    expect(picks).toHaveLength(3);
  });

  it('is reproducible with the same seed', () => {
    const a = pickWordChoices(words, new Set(), 3, createSeededRng(9));
    const b = pickWordChoices(words, new Set(), 3, createSeededRng(9));
    expect(a).toEqual(b);
  });
});

describe('sample', () => {
  it('never returns more items than exist', () => {
    expect(sample([1, 2], 5, createSeededRng(1))).toHaveLength(2);
  });
});

describe('isRoundOver', () => {
  const running = { secondsLeft: 20, guesserCount: 2, correctCount: 1, drawerConnected: true };

  it('keeps going while time is left and someone still guesses', () => {
    expect(isRoundOver(running)).toBe(false);
  });

  it('ends on time up, when everyone guessed, or when the drawer leaves', () => {
    expect(isRoundOver({ ...running, secondsLeft: 0 })).toBe(true);
    expect(isRoundOver({ ...running, correctCount: 2 })).toBe(true);
    expect(isRoundOver({ ...running, drawerConnected: false })).toBe(true);
  });
});
