import { describe, expect, it } from 'vitest';
import { chainForPlayer, passStepCount, passStepKind, playerForChain } from './pass';

describe('Draw & Pass rotation', () => {
  it('alternates write and draw steps, starting with writing', () => {
    expect([0, 1, 2, 3].map(passStepKind)).toEqual(['text', 'drawing', 'text', 'drawing']);
  });

  it('starts every player on their own chain', () => {
    for (let i = 0; i < 5; i++) expect(chainForPlayer(i, 0, 5)).toBe(i);
  });

  it.each([3, 4, 5, 6, 7, 8])(
    'with %i players each chain visits every player exactly once',
    (n) => {
      for (let chain = 0; chain < n; chain++) {
        const visitors = Array.from({ length: passStepCount(n) }, (_, step) =>
          playerForChain(chain, step, n),
        );
        expect(new Set(visitors).size).toBe(n);
      }
    },
  );

  it.each([3, 4, 8])('with %i players every player holds a different chain at each step', (n) => {
    for (let step = 0; step < n; step++) {
      const chains = Array.from({ length: n }, (_, player) => chainForPlayer(player, step, n));
      expect(new Set(chains).size).toBe(n);
    }
  });

  it('playerForChain is the inverse of chainForPlayer', () => {
    for (let step = 0; step < 6; step++) {
      for (let player = 0; player < 6; player++) {
        expect(playerForChain(chainForPlayer(player, step, 6), step, 6)).toBe(player);
      }
    }
  });
});
