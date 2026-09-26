/**
 * Server-side sessions behind a signed cookie.
 * - The cookie holds an opaque random ID plus an HMAC, so a forged or tampered ID is rejected
 *   before any lookup; everything else stays on the server (revocable, small cookie).
 * - IDs rotate on login and privilege change (session fixation), sessions expire on idle and
 *   absolute timeouts, and each carries a CSRF token for the synchroniser-token pattern.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export interface Session {
  id: string;
  userId?: string;
  csrf: string;
  createdAt: number;
  lastSeenAt: number;
  /** Pending WebAuthn challenge, bound to this session. */
  challenge?: string;
}

export const IDLE_MS = 30 * 60 * 1000;
export const ABSOLUTE_MS = 8 * 60 * 60 * 1000;

export function sign(value: string, secret: Buffer): string {
  return `${value}.${createHmac('sha256', secret).update(value).digest('base64url').slice(0, 32)}`;
}

/** Returns the value if the signature is valid, comparing in constant time. */
export function unsign(signed: string | undefined, secret: Buffer): string | undefined {
  if (!signed) return undefined;
  const dot = signed.lastIndexOf('.');
  if (dot < 1) return undefined;
  const value = signed.slice(0, dot);
  const expected = Buffer.from(sign(value, secret));
  const actual = Buffer.from(signed);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? value : undefined;
}

export class SessionStore {
  private readonly sessions = new Map<string, Session>();
  private readonly now: () => number;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  create(userId?: string): Session {
    const now = this.now();
    const session: Session = {
      id: randomBytes(18).toString('base64url'),
      userId,
      csrf: randomBytes(18).toString('base64url'),
      createdAt: now,
      lastSeenAt: now,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  /** Looks a session up, enforcing idle and absolute timeouts, and touches it. */
  get(id: string | undefined): Session | undefined {
    if (!id) return undefined;
    const session = this.sessions.get(id);
    if (!session) return undefined;
    const now = this.now();
    if (now - session.lastSeenAt > IDLE_MS || now - session.createdAt > ABSOLUTE_MS) {
      this.sessions.delete(id);
      return undefined;
    }
    session.lastSeenAt = now;
    return session;
  }

  /** New ID and CSRF token, same user: the old ID stops working immediately. */
  rotate(old: Session, userId = old.userId): Session {
    this.sessions.delete(old.id);
    return this.create(userId);
  }

  destroy(id: string): void {
    this.sessions.delete(id);
  }

  /** "Log out everywhere": every session of this user, on every device. */
  destroyUser(userId: string): number {
    let count = 0;
    for (const [id, session] of this.sessions)
      if (session.userId === userId) {
        this.sessions.delete(id);
        count += 1;
      }
    return count;
  }

  countFor(userId: string): number {
    return [...this.sessions.values()].filter((s) => s.userId === userId).length;
  }
}
