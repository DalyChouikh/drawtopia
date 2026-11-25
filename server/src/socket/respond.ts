import { type Result, err, ok } from '@drawtopia/shared';
import type { z } from 'zod';

/**
 * Runs a request and answers through the acknowledgement callback.
 * Invalid payloads and unexpected exceptions become error results; the server never crashes.
 */
export function respond<T>(ack: unknown, run: () => Result<T>): void {
  if (typeof ack !== 'function') return; // a client that does not wait for an answer
  let result: Result<T>;
  try {
    result = run();
  } catch (error) {
    console.error('[socket] handler failed', error);
    result = err('INTERNAL_ERROR');
  }
  (ack as (r: Result<T>) => void)(result);
}

/** Validates an incoming payload with its zod schema. */
export function parse<S extends z.ZodType>(schema: S, payload: unknown): Result<z.infer<S>> {
  const parsed = schema.safeParse(payload);
  return parsed.success ? ok(parsed.data) : err('INVALID_PAYLOAD');
}
