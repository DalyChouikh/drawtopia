import {
  CHOOSE_WORD_SECONDS,
  type DrawGuessPhase,
  type DrawGuessView,
  type GameResult,
  type HintStep,
  MAX_STROKES_PER_DRAWING,
  REVEAL_SECONDS,
  type RoomSettings,
  type Stroke,
  WORDS,
  drawerPoints,
  err,
  guesserPoints,
  isRoundOver,
  maskWord,
  matchGuess,
  ok,
  pickWordChoices,
  planHints,
} from '@drawtopia/shared';
import { PhaseClock } from './PhaseClock';
import type { Game, GameDeps, GameEvents, GamePlayer, Result } from './types';

const WORD_CHOICES = 3;

/**
 * Draw & Guess rules, as a state machine:
 *   choosing (drawer picks 1 of 3 words) → drawing (others guess) → reveal → next turn … → finished
 * Each player draws once per round. The server is the only one who knows the word,
 * scores the guesses and decides when phases end.
 */
export class DrawGuessGame implements Game {
  readonly mode = 'draw-guess' as const;

  private phase: DrawGuessPhase = 'choosing';
  private readonly turnOrder: string[];
  private turnIndex = -1;
  private drawerId = '';
  private choices: string[] = [];
  private word = '';
  private readonly usedWords = new Set<string>();
  private readonly revealed = new Set<number>();
  private strokes: Stroke[] = [];
  /** Points won this turn by each guesser who found the word, in order of finding. */
  private readonly guessed = new Map<string, number>();
  private turnPoints: Record<string, number> = {};
  private readonly scores = new Map<string, number>();
  private readonly connected = new Set<string>();
  private result: GameResult | undefined;
  private readonly clock: PhaseClock;

  constructor(
    private readonly players: GamePlayer[],
    private readonly settings: RoomSettings,
    private readonly events: GameEvents,
    private readonly deps: GameDeps,
    private readonly words: readonly string[] = WORDS,
  ) {
    this.clock = new PhaseClock(deps.now);
    this.turnOrder = Array.from({ length: settings.rounds }, () => players.map((p) => p.id)).flat();
    for (const p of players) {
      this.scores.set(p.id, 0);
      this.connected.add(p.id);
    }
  }

  start(): void {
    this.nextTurn();
  }

  dispose(): void {
    this.clock.cancelAll();
  }

  // ── Player actions ────────────────────────────────────────────────────────

  chooseWord(playerId: string, word: string): Result<null> {
    if (this.phase !== 'choosing' || playerId !== this.drawerId) return err('NOT_ALLOWED');
    if (!this.choices.includes(word)) return err('INVALID_PAYLOAD');
    this.startDrawing(word);
    return ok(null);
  }

  /** Scores a guess. Correct and close guesses are announced to the whole room. */
  guess(playerId: string, text: string): Result<{ verdict: 'correct' | 'close' | 'wrong' }> {
    if (this.phase !== 'drawing') return err('NOT_ALLOWED');
    if (playerId === this.drawerId || this.guessed.has(playerId)) return err('NOT_ALLOWED');

    const verdict = matchGuess(text, this.word);
    if (verdict === 'correct') {
      const points = guesserPoints(this.clock.remainingMs() / 1000, this.settings.roundDuration);
      this.guessed.set(playerId, points);
      this.addScore(playerId, points);
      this.events.feed({ kind: 'guessed', playerId, points });
      this.events.stateChanged();
      if (this.roundOver()) this.endTurn();
    } else if (verdict === 'close') {
      // Everyone learns that the player is close; only the author sees what they typed.
      this.events.feed({ kind: 'close', playerId }, { except: playerId });
      this.events.feed({ kind: 'close', playerId, text }, { only: playerId });
    } else {
      this.events.feed({ kind: 'chat', playerId, text });
    }
    return ok({ verdict });
  }

  /** Stores a stroke from the drawer. Returns false when it must not be relayed. */
  addStroke(playerId: string, stroke: Stroke): boolean {
    if (!this.canDraw(playerId) || this.strokes.length >= MAX_STROKES_PER_DRAWING) return false;
    this.strokes.push(stroke);
    return true;
  }

  undo(playerId: string): boolean {
    if (!this.canDraw(playerId) || this.strokes.length === 0) return false;
    this.strokes.pop();
    return true;
  }

  clear(playerId: string): boolean {
    if (!this.canDraw(playerId)) return false;
    this.strokes = [];
    return true;
  }

  setConnected(playerId: string, connected: boolean): void {
    if (connected) this.connected.add(playerId);
    else this.connected.delete(playerId);

    if (this.phase === 'finished') return;
    if (this.connected.size < 2) return this.finish(); // nobody left to play with
    if (this.phase === 'choosing' && playerId === this.drawerId && !connected) {
      return this.nextTurn(); // the drawer left before picking a word
    }
    // Drawer gone, or the remaining guessers all found the word.
    if (this.phase === 'drawing' && this.roundOver()) return this.endTurn();
    this.events.stateChanged();
  }

  // ── Views ─────────────────────────────────────────────────────────────────

  viewFor(playerId: string): DrawGuessView {
    const isDrawer = playerId === this.drawerId;
    const wordVisible =
      this.phase === 'reveal' ||
      this.phase === 'finished' ||
      (isDrawer && this.phase === 'drawing');
    return {
      mode: 'draw-guess',
      phase: this.phase,
      turn: this.turnIndex + 1,
      totalTurns: this.turnOrder.length,
      drawerId: this.drawerId,
      wordChoices: isDrawer && this.phase === 'choosing' ? this.choices : undefined,
      word: wordVisible ? this.word : undefined,
      mask: this.phase === 'drawing' ? maskWord(this.word, this.revealed) : '',
      remainingMs: this.clock.remainingMs(),
      guessedIds: [...this.guessed.keys()],
      strokes: this.strokes,
      scores: Object.fromEntries(this.scores),
      turnPoints: this.phase === 'reveal' ? this.turnPoints : undefined,
      result: this.result,
    };
  }

  // ── Phases ────────────────────────────────────────────────────────────────

  private nextTurn(): void {
    // Skip drawers who are no longer connected.
    do this.turnIndex++;
    while (
      this.turnIndex < this.turnOrder.length &&
      !this.connected.has(this.turnOrder[this.turnIndex]!)
    );

    if (this.turnIndex >= this.turnOrder.length) {
      this.finish();
      return;
    }

    this.phase = 'choosing';
    this.drawerId = this.turnOrder[this.turnIndex]!;
    this.word = '';
    this.strokes = [];
    this.guessed.clear();
    this.revealed.clear();
    this.choices = pickWordChoices(this.words, this.usedWords, WORD_CHOICES, this.deps.rng);
    this.clock.startPhase(CHOOSE_WORD_SECONDS * 1000, () => this.startDrawing(this.choices[0]!));
    this.events.stateChanged();
  }

  private startDrawing(word: string): void {
    this.phase = 'drawing';
    this.word = word;
    this.usedWords.add(word);
    this.clock.startPhase(this.settings.roundDuration * 1000, () => this.endTurn());

    const hints: HintStep[] = planHints(word, this.settings.roundDuration, this.deps.rng);
    for (const hint of hints) {
      this.clock.schedule(hint.revealAtSecond * 1000, () => {
        this.revealed.add(hint.index);
        this.events.stateChanged();
      });
    }

    const drawer = this.players.find((p) => p.id === this.drawerId);
    this.events.feed({ kind: 'system', text: `${drawer?.nickname ?? 'Someone'} is drawing` });
    this.events.stateChanged();
  }

  private endTurn(): void {
    const guessers = this.guessersCount();
    const drawerGain = drawerPoints(this.guessed.size, guessers);
    this.addScore(this.drawerId, drawerGain);
    this.turnPoints = { ...Object.fromEntries(this.guessed), [this.drawerId]: drawerGain };

    this.phase = 'reveal';
    this.clock.startPhase(REVEAL_SECONDS * 1000, () => this.nextTurn());
    this.events.feed({ kind: 'system', text: `The word was "${this.word}"` });
    this.events.stateChanged();
  }

  private finish(): void {
    this.clock.cancelAll();
    this.phase = 'finished';
    this.result = {
      id: this.deps.newId(),
      finishedAt: this.deps.now(),
      mode: 'draw-guess',
      players: this.players.map((p) => ({ ...p, score: this.scores.get(p.id) ?? 0 })),
    };
    this.events.stateChanged();
    this.events.finished(this.result);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** True while this player is the drawer of a running drawing phase. */
  canDraw(playerId: string): boolean {
    return this.phase === 'drawing' && playerId === this.drawerId;
  }

  private guessersCount(): number {
    return [...this.connected].filter((id) => id !== this.drawerId).length;
  }

  private roundOver(): boolean {
    return isRoundOver({
      secondsLeft: this.clock.remainingMs() / 1000,
      guesserCount: this.guessersCount(),
      correctCount: [...this.guessed.keys()].filter((id) => this.connected.has(id)).length,
      drawerConnected: this.connected.has(this.drawerId),
    });
  }

  private addScore(playerId: string, points: number): void {
    this.scores.set(playerId, (this.scores.get(playerId) ?? 0) + points);
  }
}
