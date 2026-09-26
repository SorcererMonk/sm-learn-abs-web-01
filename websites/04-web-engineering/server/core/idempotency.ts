/**
 * Idempotency keys (the IETF Idempotency-Key draft, as payment APIs use them): the first request
 * with a key does the work and stores its response; a retry with the same key and the same body
 * gets the stored response instead of doing the work twice. The same key with a different body is
 * a client bug (422); a retry while the first is still running gets 409.
 */
import { createHash } from 'node:crypto';

export interface Stored {
  status: number;
  body: unknown;
}

type Entry =
  | { state: 'running'; fingerprint: string; at: number }
  | ({ state: 'done'; fingerprint: string; at: number } & Stored);

export type Begin =
  | { kind: 'new' }
  | { kind: 'replay'; response: Stored }
  | { kind: 'mismatch' }
  | { kind: 'in-flight' };

export const fingerprint = (...parts: string[]): string =>
  createHash('sha256').update(parts.join('\u0000')).digest('base64url');

export class IdempotencyStore {
  private readonly entries = new Map<string, Entry>();
  private readonly ttl: number;
  private readonly now: () => number;

  constructor(options: { ttlMs?: number; now?: () => number } = {}) {
    this.ttl = options.ttlMs ?? 24 * 60 * 60 * 1000;
    this.now = options.now ?? Date.now;
  }

  begin(key: string, print: string): Begin {
    this.sweep();
    const entry = this.entries.get(key);
    if (!entry) {
      this.entries.set(key, { state: 'running', fingerprint: print, at: this.now() });
      return { kind: 'new' };
    }
    if (entry.fingerprint !== print) return { kind: 'mismatch' };
    if (entry.state === 'running') return { kind: 'in-flight' };
    return { kind: 'replay', response: { status: entry.status, body: entry.body } };
  }

  complete(key: string, response: Stored): void {
    const entry = this.entries.get(key);
    if (entry)
      this.entries.set(key, {
        ...response,
        state: 'done',
        fingerprint: entry.fingerprint,
        at: this.now(),
      });
  }

  /** The work failed before any side effect: forget the key so a retry can run it again. */
  abandon(key: string): void {
    this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  private sweep(): void {
    const cutoff = this.now() - this.ttl;
    for (const [key, entry] of this.entries) if (entry.at < cutoff) this.entries.delete(key);
  }
}

/** Keys are opaque client-generated strings; bound their shape so they can't be abused. */
export const validKey = (key: string | undefined): key is string =>
  typeof key === 'string' && /^[\w-]{8,100}$/.test(key);
