import { PASS_SUBMIT_GRACE_MS, type RoomSettings, createSeededRng } from '@drawtopia/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DrawPassGame, EMPTY_TEXT } from './DrawPassGame';
import type { GamePlayer } from './types';

const players: GamePlayer[] = [
  { id: 'a', nickname: 'Ana', color: '#FF5A4E' },
  { id: 'b', nickname: 'Ben', color: '#3D7BFF' },
  { id: 'c', nickname: 'Cat', color: '#B6F03C' },
];
const settings: RoomSettings = {
  mode: 'draw-pass',
  visibility: 'private',
  roundDuration: 30,
  rounds: 1,
};
const stroke = { id: 's', color: '#1A1A1A', size: 10 as const, points: [0.1, 0.1, 0.5, 0.5] };

function setup() {
  const finished = vi.fn();
  const game = new DrawPassGame(
    players,
    settings,
    { stateChanged: () => {}, feed: () => {}, finished },
    { now: () => Date.now(), rng: createSeededRng(1), newId: () => 'game-2' },
  );
  game.start();
  return { game, finished };
}

describe('DrawPassGame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts with everyone writing, with no prompt', () => {
    const { game } = setup();
    expect(game.viewFor('a')).toMatchObject({
      step: 1,
      totalSteps: 3,
      stepKind: 'text',
      prompt: undefined,
    });
  });

  it('passes each sentence to the next player to draw', () => {
    const { game } = setup();
    game.submit('a', { kind: 'text', text: 'a cat on the moon' });
    game.submit('b', { kind: 'text', text: 'a pirate eating pizza' });
    game.submit('c', { kind: 'text', text: 'a dancing robot' });

    // Step 2: player a holds chain (0 + 1) % 3 = 1, started by b.
    expect(game.viewFor('a')).toMatchObject({
      step: 2,
      stepKind: 'drawing',
      prompt: { kind: 'text', authorId: 'b', text: 'a pirate eating pizza' },
    });
  });

  it('rejects a drawing during a writing step and double submissions (negative)', () => {
    const { game } = setup();
    expect(game.submit('a', { kind: 'drawing', strokes: [stroke] })).toEqual({
      ok: false,
      error: 'INVALID_PAYLOAD',
    });
    expect(game.submit('a', { kind: 'text', text: 'hello' }).ok).toBe(true);
    expect(game.submit('a', { kind: 'text', text: 'again' })).toEqual({
      ok: false,
      error: 'NOT_ALLOWED',
    });
  });

  it('fills in missing entries when time runs out', () => {
    const { game } = setup();
    game.submit('a', { kind: 'text', text: 'only me' });
    vi.advanceTimersByTime(settings.roundDuration * 1000 + PASS_SUBMIT_GRACE_MS);
    expect(game.viewFor('a').step).toBe(2);
    // a now holds b's chain, whose first entry was filled in.
    expect(game.viewFor('a').prompt).toEqual({ kind: 'text', authorId: 'b', text: EMPTY_TEXT });
  });

  it('builds one complete chain per player and reveals them at the end', () => {
    const { game, finished } = setup();
    for (const id of ['a', 'b', 'c']) game.submit(id, { kind: 'text', text: `${id} wrote` });
    for (const id of ['a', 'b', 'c']) game.submit(id, { kind: 'drawing', strokes: [stroke] });
    for (const id of ['a', 'b', 'c']) game.submit(id, { kind: 'text', text: `${id} described` });

    const view = game.viewFor('a');
    expect(view.phase).toBe('finished');
    expect(view.chains).toHaveLength(3);
    for (const chain of view.chains!) {
      expect(chain.entries.map((e) => e.kind)).toEqual(['text', 'drawing', 'text']);
      // Every entry of a chain comes from a different player, starting with its owner.
      expect(chain.entries[0]!.authorId).toBe(chain.ownerId);
      expect(new Set(chain.entries.map((e) => e.authorId)).size).toBe(3);
    }
    expect(finished).toHaveBeenCalledWith(expect.objectContaining({ mode: 'draw-pass' }));
  });

  it('does not wait for a disconnected player', () => {
    const { game } = setup();
    game.submit('a', { kind: 'text', text: 'one' });
    game.submit('b', { kind: 'text', text: 'two' });
    game.setConnected('c', false);
    expect(game.viewFor('a').step).toBe(2);
  });
});
