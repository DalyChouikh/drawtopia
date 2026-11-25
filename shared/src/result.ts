import type { ErrorCode } from './errors';

/** Outcome of an operation that can fail with a known error code, without throwing. */
export type Result<T, E = ErrorCode> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
