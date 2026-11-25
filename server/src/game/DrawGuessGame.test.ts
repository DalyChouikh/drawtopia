import {
  CHOOSE_WORD_SECONDS,
  type FeedEvent,
  REVEAL_SECONDS,
  type RoomSettings,
  createSeededRng,
} from '@drawtopia/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DrawGuessGame } from './DrawGuessGame';
import type { FeedTarget, GamePlayer } from './types';

const players: GamePlayer[] = [
  { id: 'a', nickname: 'Ana', color: '#FF5A4E' },
  { id: 'b', nickname: 'Ben', color: '#3D7BFF' },
  { id: 'c', nickname: 'Cat', color: '#B6F03C' },
];
const settings: RoomSettings = {
  mode: 'draw-guess',
  visibility: 'private',
  roundDuration: 60,
  rounds: 1,
};
const WORDS = ['rocket', 'elephant', 'banana', 'castle'];

function setup() {
  const feed: { event: FeedEvent; target: FeedTarget }[] = [];
  const finished = vi.fn();
  const game = new DrawGuessGame(
    players,
    settings,
    {
      stateChanged: () => {},
      feed: (event, target) => feed.push({ event, target }),
      finished,
    },
    { now: () => Date.now(), rng: createSeededRng(1), newId: () => 'game-1' },
    WORDS,
  );
  game.start();
  return { game, feed, finished };
}

/** The drawer picks the first offered word and returns it. */
function pickWord(game: DrawGuessGame, drawerId: string): string {
  const word = game.viewFor(drawerId).wordChoices![0]!;
  expect(game.chooseWord(drawerId, word)).toEqual({ ok: true, value: null });
  return word;
}

describe('DrawGuessGame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts with the first player choosing among 3 words, hidden from the others', () => {
    const { game } = setup();
    expect(game.viewFor('a')).toMatchObject({
      phase: 'choosing',
      drawerId: 'a',
      turn: 1,
      totalTurns: 3,
    });
    expect(game.viewFor('a').wordChoices).toHaveLength(3);
    expect(game.viewFor('b').wordChoices).toBeUndefined();
  });

  it('never sends the word to guessers while drawing, only a mask', () => {
    const { game } = setup();
    const word = pickWord(game, 'a');
    expect(game.viewFor('a').word).toBe(word);
    expect(game.viewFor('b').word).toBeUndefined();
    expect(game.viewFor('b').mask).toBe('_'.repeat(word.length));
  });

  it('scores a correct guess by speed and announces it to everyone', () => {
    const { game, feed } = setup();
    const word = pickWord(game, 'a');
    vi.advanceTimersByTime(15_000); // 45 s left of 60
    expect(game.guess('b', word.toUpperCase())).toEqual({
      ok: true,
      value: { verdict: 'correct' },
    });
    expect(game.viewFor('b').scores.b).toBe(100 + Math.round((400 * 45) / 60));
    expect(feed.at(-1)).toEqual({
      event: { kind: 'guessed', playerId: 'b', points: 400 },
      target: undefined,
    });
  });

  it('tells everyone a player is close, but shows the typed word only to that player', () => {
    const { game, feed } = setup();
    const word = pickWord(game, 'a');
    const typo = word.slice(0, -1); // one letter missing
    expect(game.guess('c', typo)).toEqual({ ok: true, value: { verdict: 'close' } });
    expect(feed.slice(-2)).toEqual([
      { event: { kind: 'close', playerId: 'c' }, target: { except: 'c' } },
      { event: { kind: 'close', playerId: 'c', text: typo }, target: { only: 'c' } },
    ]);
  });

  it('refuses guesses from the drawer and repeated correct guesses (negative)', () => {
    const { game } = setup();
    const word = pickWord(game, 'a');
    expect(game.guess('a', word)).toEqual({ ok: false, error: 'NOT_ALLOWED' });
    game.guess('b', word);
    expect(game.guess('b', word)).toEqual({ ok: false, error: 'NOT_ALLOWED' });
  });

  it('ends the turn early when every guesser found the word, then rewards the drawer', () => {
    const { game } = setup();
    const word = pickWord(game, 'a');
    game.guess('b', word);
    game.guess('c', word);
    const view = game.viewFor('b');
    expect(view.phase).toBe('reveal');
    expect(view.word).toBe(word);
    expect(view.turnPoints?.a).toBe(250);
  });

  it('picks a word automatically when the drawer does not choose in time', () => {
    const { game } = setup();
    const offered = game.viewFor('a').wordChoices![0];
    vi.advanceTimersByTime(CHOOSE_WORD_SECONDS * 1000);
    expect(game.viewFor('a')).toMatchObject({ phase: 'drawing', word: offered });
  });

  it('relays strokes only from the drawer during the drawing phase', () => {
    const { game } = setup();
    const stroke = { id: 's', color: '#1A1A1A', size: 10 as const, points: [0.1, 0.1, 0.2, 0.2] };
    expect(game.addStroke('a', stroke)).toBe(false); // still choosing
    pickWord(game, 'a');
    expect(game.addStroke('b', stroke)).toBe(false); // not the drawer
    expect(game.addStroke('a', stroke)).toBe(true);
    expect(game.viewFor('c').strokes).toHaveLength(1);
    expect(game.undo('a')).toBe(true);
    expect(game.viewFor('c').strokes).toHaveLength(0);
  });

  it('plays every turn and finishes with a result', () => {
    const { game, finished } = setup();
    for (let turn = 0; turn < 3; turn++) {
      vi.advanceTimersByTime(CHOOSE_WORD_SECONDS * 1000); // auto-pick
      vi.advanceTimersByTime(settings.roundDuration * 1000); // time up
      vi.advanceTimersByTime(REVEAL_SECONDS * 1000); // reveal
    }
    expect(game.viewFor('a').phase).toBe('finished');
    expect(finished).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'game-1', mode: 'draw-guess' }),
    );
  });

  it('ends the turn when the drawer disconnects, and finishes when fewer than 2 remain', () => {
    const { game } = setup();
    pickWord(game, 'a');
    game.setConnected('a', false);
    expect(game.viewFor('b').phase).toBe('reveal');
    game.setConnected('b', false);
    expect(game.viewFor('c').phase).toBe('finished');
  });
});
