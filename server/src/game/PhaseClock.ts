/**
 * Owns every timer of one game so they can all be cancelled at once (phase change, game end,
 * room closed). Also tracks when the current phase ends, to tell clients the time left.
 */
export class PhaseClock {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private endsAt = 0;

  constructor(private readonly now: () => number) {}

  /** Starts a new phase of `durationMs`: cancels previous timers, schedules `onEnd`. */
  startPhase(durationMs: number, onEnd: () => void): void {
    this.cancelAll();
    this.endsAt = this.now() + durationMs;
    this.schedule(durationMs, onEnd);
  }

  /** Extra timer inside the current phase (e.g. revealing a hint). */
  schedule(delayMs: number, run: () => void): void {
    const timer = setTimeout(run, delayMs);
    timer.unref?.();
    this.timers.push(timer);
  }

  remainingMs(): number {
    return Math.max(0, this.endsAt - this.now());
  }

  cancelAll(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}
