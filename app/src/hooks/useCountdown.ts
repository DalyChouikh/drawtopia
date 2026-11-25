import { useEffect, useState } from 'react';

const TICK_MS = 250;

/**
 * Whole seconds left in a phase. The server sends the milliseconds left when it sent the
 * view; counting from the local arrival time avoids depending on the phone's clock being
 * in sync with the server.
 */
export function useCountdown(remainingMs: number, receivedAt: number): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const elapsed = Math.max(0, now - receivedAt);
  return Math.max(0, Math.ceil((remainingMs - elapsed) / 1000));
}
