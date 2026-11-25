import {
  type ChainEntry,
  type DrawPassPhase,
  type DrawPassView,
  type GameResult,
  PASS_SUBMIT_GRACE_MS,
  type PassChain,
  type PassSubmitPayload,
  type RoomSettings,
  chainForPlayer,
  err,
  ok,
  passStepCount,
  passStepKind,
} from '@drawtopia/shared';
import { PhaseClock } from './PhaseClock';
import type { Game, GameDeps, GameEvents, GamePlayer, Result } from './types';

export const EMPTY_TEXT = '(nothing written)';

/**
 * Draw & Pass rules: N players, N chains, N steps alternating write → draw → write …
 * At step s, player i adds to chain (i + s) mod N (see shared/rules/pass.ts).
 * A step ends when every connected player submitted, or when time is up; missing
 * entries are filled in so every chain always has exactly N entries.
 */
export class DrawPassGame implements Game {
  readonly mode = 'draw-pass' as const;

  private phase: DrawPassPhase = 'step';
  private step = 0;
  private readonly chains: PassChain[];
  private readonly submissions = new Map<string, ChainEntry>();
  private readonly connected = new Set<string>();
  private result: GameResult | undefined;
  private readonly clock: PhaseClock;

  constructor(
    private readonly players: GamePlayer[],
    private readonly settings: RoomSettings,
    private readonly events: GameEvents,
    private readonly deps: GameDeps,
  ) {
    this.clock = new PhaseClock(deps.now);
    this.chains = players.map((p) => ({ ownerId: p.id, entries: [] }));
    players.forEach((p) => this.connected.add(p.id));
  }

  start(): void {
    this.beginStep(0);
  }

  dispose(): void {
    this.clock.cancelAll();
  }

  submit(playerId: string, payload: PassSubmitPayload): Result<null> {
    if (this.phase !== 'step') return err('NOT_ALLOWED');
    if (!this.players.some((p) => p.id === playerId)) return err('NOT_IN_ROOM');
    if (this.submissions.has(playerId)) return err('NOT_ALLOWED');
    if (payload.kind !== passStepKind(this.step)) return err('INVALID_PAYLOAD');

    const entry: ChainEntry =
      payload.kind === 'text'
        ? { kind: 'text', authorId: playerId, text: payload.text.trim() || EMPTY_TEXT }
        : { kind: 'drawing', authorId: playerId, strokes: payload.strokes };
    this.submissions.set(playerId, entry);

    if (this.everyoneSubmitted()) this.closeStep();
    else this.events.stateChanged();
    return ok(null);
  }

  setConnected(playerId: string, connected: boolean): void {
    if (connected) this.connected.add(playerId);
    else this.connected.delete(playerId);
    if (this.phase === 'finished') return;
    if (this.connected.size < 2) return this.finish();
    if (this.everyoneSubmitted()) return this.closeStep();
    this.events.stateChanged();
  }

  viewFor(playerId: string): DrawPassView {
    const index = this.players.findIndex((p) => p.id === playerId);
    const n = this.players.length;
    const chain = index >= 0 ? this.chains[chainForPlayer(index, this.step, n)] : undefined;
    const finished = this.phase === 'finished';
    return {
      mode: 'draw-pass',
      phase: this.phase,
      step: this.step + 1,
      totalSteps: passStepCount(n),
      stepKind: passStepKind(this.step),
      // Each player only ever sees the last entry of the chain they hold.
      prompt: !finished && this.step > 0 ? chain?.entries.at(-1) : undefined,
      // The time shown excludes the server's grace period for late submissions.
      remainingMs: Math.max(0, this.clock.remainingMs() - PASS_SUBMIT_GRACE_MS),
      submittedIds: [...this.submissions.keys()],
      chains: finished ? this.chains : undefined,
      result: this.result,
    };
  }

  private beginStep(step: number): void {
    this.step = step;
    this.submissions.clear();
    this.clock.startPhase(this.settings.roundDuration * 1000 + PASS_SUBMIT_GRACE_MS, () =>
      this.closeStep(),
    );
    this.events.stateChanged();
  }

  /** Adds this step's entries to the chains (filling in for missing players) and moves on. */
  private closeStep(): void {
    const n = this.players.length;
    const kind = passStepKind(this.step);
    this.players.forEach((player, index) => {
      const entry: ChainEntry =
        this.submissions.get(player.id) ??
        (kind === 'text'
          ? { kind: 'text', authorId: player.id, text: EMPTY_TEXT }
          : { kind: 'drawing', authorId: player.id, strokes: [] });
      this.chains[chainForPlayer(index, this.step, n)]!.entries.push(entry);
    });

    if (this.step + 1 < passStepCount(n)) this.beginStep(this.step + 1);
    else this.finish();
  }

  private finish(): void {
    this.clock.cancelAll();
    this.phase = 'finished';
    this.result = {
      id: this.deps.newId(),
      finishedAt: this.deps.now(),
      mode: 'draw-pass',
      players: this.players.map((p) => ({ ...p, score: 0 })),
      chains: this.chains,
    };
    this.events.stateChanged();
    this.events.finished(this.result);
  }

  private everyoneSubmitted(): boolean {
    return [...this.connected].every((id) => this.submissions.has(id));
  }
}
