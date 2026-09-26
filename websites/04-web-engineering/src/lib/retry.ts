/**
 * Resilience for network calls: classify what went wrong, retry only what can succeed on retry
 * (idempotent requests, transient failures), wait with exponential backoff and full jitter
 * (AWS Architecture Blog, "Exponential Backoff and Jitter"), honour Retry-After, and time out.
 */
export type Failure = 'offline' | 'timeout' | 'rate-limited' | 'server' | 'client' | 'unknown';

export interface Policy {
  attempts: number;
  baseMs: number;
  capMs: number;
  jitter: boolean;
  timeoutMs: number;
}

export const DEFAULT_POLICY: Policy = {
  attempts: 4,
  baseMs: 250,
  capMs: 4000,
  jitter: true,
  timeoutMs: 2000,
};

/** Delay before retry number `attempt` (0-based): min(cap, base·2^attempt), jittered in [0, that). */
export function backoff(
  attempt: number,
  policy: Policy,
  random: () => number = Math.random,
): number {
  const ceiling = Math.min(policy.capMs, policy.baseMs * 2 ** attempt);
  return Math.round(policy.jitter ? random() * ceiling : ceiling);
}

export function classify(input: { status?: number; error?: unknown; online?: boolean }): Failure {
  if (input.online === false) return 'offline';
  if (
    input.error instanceof DOMException &&
    (input.error.name === 'TimeoutError' || input.error.name === 'AbortError')
  )
    return 'timeout';
  // fetch() rejects with a TypeError when no response came back at all: DNS, TCP, TLS, CORS.
  if (input.error) return 'offline';
  const status = input.status ?? 0;
  if (status === 429) return 'rate-limited';
  if (status === 408 || status >= 500) return 'server';
  if (status >= 400) return 'client';
  return 'unknown';
}

const IDEMPOTENT = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']);

/** Validation errors and non-idempotent requests are never retried automatically. */
export function shouldRetry(failure: Failure, method = 'GET', hasIdempotencyKey = false): boolean {
  if (failure === 'client') return false;
  return IDEMPOTENT.has(method.toUpperCase()) || hasIdempotencyKey;
}

/** Retry-After as seconds or an HTTP date, in milliseconds (undefined if absent or invalid). */
export function retryAfterMs(header: string | null, now = Date.now()): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - now);
}

export interface Attempt {
  attempt: number;
  startedAt: number;
  ms: number;
  status?: number;
  failure?: Failure;
  waitMs?: number;
}

/** What the user should see for the final failure: never just "Error". */
export const USER_MESSAGE: Record<Failure, string> = {
  offline: "You're offline. We'll keep your changes and try again when you're back.",
  timeout: 'The server is taking too long. Try again in a moment.',
  'rate-limited': "You're going a bit fast. We'll try again shortly.",
  server: 'Something went wrong on our side. It is not your fault; try again.',
  client: 'Please check the highlighted fields.',
  unknown: 'Something unexpected happened. Try again.',
};
