/** A random source returning numbers in [0, 1). Injected so game rules stay testable. */
export type Rng = () => number;

/** Deterministic generator (mulberry32) for tests and reproducible demo data. */
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns a shuffled copy of the first `count` picks (partial Fisher–Yates). */
export function sample<T>(items: readonly T[], count: number, rng: Rng): T[] {
  const pool = [...items];
  const picks = Math.min(count, pool.length);
  for (let i = 0; i < picks; i++) {
    const j = i + Math.floor(rng() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, picks);
}
