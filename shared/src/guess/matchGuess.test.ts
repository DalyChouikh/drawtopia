import { describe, expect, it } from 'vitest';
import { boundedOsaDistance, closeThreshold, matchGuess, normalizeGuess } from './matchGuess';

describe('normalizeGuess', () => {
  it('lowercases, strips accents and punctuation, and collapses spaces', () => {
    expect(normalizeGuess('  Café   Crème! ')).toBe('cafe creme');
    expect(normalizeGuess("Rock'n'Roll")).toBe('rocknroll');
  });
});

describe('boundedOsaDistance', () => {
  it('counts insertions, deletions and substitutions', () => {
    expect(boundedOsaDistance('rocket', 'rocket', 2)).toBe(0);
    expect(boundedOsaDistance('rocet', 'rocket', 2)).toBe(1);
    expect(boundedOsaDistance('rockett', 'rocket', 2)).toBe(1);
    expect(boundedOsaDistance('pocket', 'rocket', 2)).toBe(1);
  });

  it('counts a swap of two neighbouring letters as one edit', () => {
    expect(boundedOsaDistance('rokcet', 'rocket', 2)).toBe(1);
  });

  it('stops early and returns k + 1 when the distance is over the limit', () => {
    expect(boundedOsaDistance('elephant', 'pineapple', 2)).toBe(3);
    expect(boundedOsaDistance('a', 'abcdef', 2)).toBe(3);
    expect(boundedOsaDistance('', 'ab', 2)).toBe(2);
  });
});

describe('boundedOsaDistance vs. a plain full-table implementation', () => {
  /** Reference O(n·m) OSA distance, written as simply as possible. */
  function referenceOsa(a: string, b: string): number {
    const d = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i]![j] = Math.min(d[i]![j]!, d[i - 2]![j - 2]! + 1);
        }
      }
    }
    return d[a.length]![b.length]!;
  }

  it('agrees on 2 000 random word pairs (k = 2)', () => {
    let seed = 42;
    const random = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
    const word = () =>
      Array.from(
        { length: 1 + Math.floor(random() * 9) },
        () => 'abcde'[Math.floor(random() * 5)],
      ).join('');

    for (let n = 0; n < 2000; n++) {
      const a = word();
      const b = word();
      expect(boundedOsaDistance(a, b, 2)).toBe(Math.min(referenceOsa(a, b), 3));
    }
  });
});

describe('closeThreshold', () => {
  it('allows no typo for short words, 1 for medium and 2 for long words', () => {
    expect(closeThreshold(4)).toBe(0);
    expect(closeThreshold(5)).toBe(1);
    expect(closeThreshold(7)).toBe(1);
    expect(closeThreshold(8)).toBe(2);
  });
});

describe('matchGuess', () => {
  it('accepts the answer regardless of case, accents, punctuation and spaces', () => {
    expect(matchGuess('Rocket!', 'rocket')).toBe('correct');
    expect(matchGuess('cafe', 'café')).toBe('correct');
    expect(matchGuess('icecream', 'ice cream')).toBe('correct');
  });

  it('accepts a singular or plural form', () => {
    expect(matchGuess('apples', 'apple')).toBe('correct');
    expect(matchGuess('apple', 'apples')).toBe('correct');
  });

  it('says "close" for a small typo in a medium or long word', () => {
    expect(matchGuess('rocet', 'rocket')).toBe('close');
    expect(matchGuess('rokcet', 'rocket')).toBe('close');
    expect(matchGuess('elefant', 'elephant')).toBe('close');
  });

  it('requires an exact match for short words (negative case)', () => {
    expect(matchGuess('car', 'cat')).toBe('wrong');
  });

  it('says "wrong" for unrelated words and empty guesses (negative case)', () => {
    expect(matchGuess('pineapple', 'elephant')).toBe('wrong');
    expect(matchGuess('   ', 'rocket')).toBe('wrong');
    expect(matchGuess('?!', 'rocket')).toBe('wrong');
  });
});
