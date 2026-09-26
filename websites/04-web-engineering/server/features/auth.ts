/**
 * Authentication and sessions, done the boring, correct way:
 * - passwords hashed with scrypt; one generic error for unknown emails and wrong passwords
 *   (no account enumeration), and a per-account token bucket that locks out guessing;
 * - an HttpOnly, SameSite=Lax session cookie carrying a signed opaque ID; the session is rotated
 *   on login (session fixation), expires on idle and absolute timeouts, and can be revoked
 *   everywhere;
 * - a CSRF token per session, required on every state-changing request, plus an Origin check;
 * - passkeys (WebAuthn) as a phishing-resistant primary factor;
 * - authorisation on the server: 401 when anonymous, 403 when the role is wrong.
 */
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Deps } from '../app.ts';
import { HttpError, appendSetCookie, json, readJson, serializeCookie } from '../core/http.ts';
import { hashPassword, verifyPassword } from '../core/password.ts';
import { TokenBucket, rateLimitHeaders } from '../core/rate-limit.ts';
import type { Ctx, Router } from '../core/router.ts';
import { SessionStore, sign, unsign, IDLE_MS, type Session } from '../core/session.ts';
import {
  b64url,
  checkAuthenticatorData,
  checkClientData,
  verifyAssertion,
} from '../core/webauthn.ts';

interface Credential {
  id: string;
  publicKey: Buffer;
  signCount: number;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  passwordHash: string;
  credentials: Credential[];
}

export const DEMO_ACCOUNTS = [
  {
    email: 'ada@example.com',
    password: 'correct horse battery',
    name: 'Ada',
    role: 'admin' as const,
  },
  { email: 'lin@example.com', password: 'trail-running-42', name: 'Lin', role: 'member' as const },
];

const COOKIE = 'sid';
const DUMMY_HASH = hashPassword('not-a-real-password');

export function registerAuth(router: Router, deps: Deps): void {
  const store = new SessionStore(deps.now);
  const lockout = new TokenBucket({ capacity: 5, refillPerSecond: 5 / 300, now: deps.now });
  const users = new Map<string, User>(
    DEMO_ACCOUNTS.map((a, i) => [
      a.email,
      {
        id: `u${i + 1}`,
        email: a.email,
        name: a.name,
        role: a.role,
        passwordHash: hashPassword(a.password),
        credentials: [],
      },
    ]),
  );
  const byId = (id: string | undefined): User | undefined =>
    [...users.values()].find((u) => u.id === id);

  const isHttps = (ctx: Ctx): boolean =>
    'encrypted' in ctx.req.socket && Boolean(ctx.req.socket.encrypted);
  const setCookie = (ctx: Ctx, session: Session | undefined): void => {
    appendSetCookie(
      ctx.res,
      serializeCookie(COOKIE, session ? sign(session.id, deps.secret) : '', {
        httpOnly: true,
        sameSite: 'Lax',
        secure: isHttps(ctx),
        path: '/',
        ...(session ? {} : { maxAge: 0 }),
      }),
    );
  };
  const current = (ctx: Ctx): Session | undefined =>
    store.get(unsign(ctx.cookies[COOKIE], deps.secret));
  const ensure = (ctx: Ctx): Session => {
    const existing = current(ctx);
    if (existing) return existing;
    const session = store.create();
    setCookie(ctx, session);
    return session;
  };

  /** Synchroniser token + Origin check on every state-changing request. */
  const requireCsrf = (ctx: Ctx, session: Session | undefined): Session => {
    const origin = ctx.req.headers.origin;
    if (origin && new URL(origin).host !== ctx.req.headers.host)
      throw new HttpError(403, 'Cross-origin request refused');
    const sent = Buffer.from(String(ctx.req.headers['x-csrf-token'] ?? ''));
    const expected = Buffer.from(session?.csrf ?? '');
    if (!session || sent.length !== expected.length || !timingSafeEqual(sent, expected))
      throw new HttpError(403, 'Missing or wrong CSRF token');
    return session;
  };

  const describe = (session: Session): Record<string, unknown> => {
    const user = byId(session.userId);
    return {
      authenticated: Boolean(user),
      user: user && {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        passkeys: user.credentials.length,
      },
      sessionId: `${session.id.slice(0, 8)}…`,
      csrfToken: session.csrf,
      createdAt: new Date(session.createdAt).toISOString(),
      idleExpiresAt: new Date(session.lastSeenAt + IDLE_MS).toISOString(),
      activeSessions: user ? store.countFor(user.id) : 0,
    };
  };

  const logIn = (ctx: Ctx, session: Session, user: User, method: string): void => {
    const fresh = store.rotate(session, user.id);
    setCookie(ctx, fresh);
    ctx.log('info', 'login', { user: user.id, method, rotatedFrom: session.id.slice(0, 8) });
    json(ctx.res, 200, { ...describe(fresh), rotatedFrom: `${session.id.slice(0, 8)}…` });
  };

  router.get('/api/auth/session', (ctx) => {
    json(ctx.res, 200, describe(ensure(ctx)));
  });

  router.post('/api/auth/login', async (ctx) => {
    const session = requireCsrf(ctx, current(ctx));
    const { email = '', password = '' } = await readJson<{ email?: string; password?: string }>(
      ctx.req,
      2_000,
    );
    const key = email.trim().toLowerCase();
    const gate = lockout.peek(key);
    if (!gate.allowed)
      throw new HttpError(
        429,
        'Too many attempts for this account; wait and try again',
        rateLimitHeaders(gate, lockout.capacity),
      );
    const user = users.get(key);
    // Hash even for unknown emails, so response time doesn't reveal which accounts exist.
    const ok = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH) && Boolean(user);
    if (!ok || !user) {
      const after = lockout.take(key);
      ctx.log('warn', 'login failed', { attemptsLeft: after.remaining });
      throw new HttpError(
        401,
        'Email or password is incorrect',
        rateLimitHeaders(after, lockout.capacity),
      );
    }
    lockout.reset(key);
    logIn(ctx, session, user, 'password');
  });

  router.post('/api/auth/logout', (ctx) => {
    const session = requireCsrf(ctx, current(ctx));
    store.destroy(session.id);
    setCookie(ctx, undefined);
    json(ctx.res, 200, { loggedOut: true });
  });

  router.post('/api/auth/logout-all', (ctx) => {
    const session = requireCsrf(ctx, current(ctx));
    if (!session.userId) throw new HttpError(401, 'Log in first');
    const count = store.destroyUser(session.userId);
    setCookie(ctx, undefined);
    json(ctx.res, 200, { revokedSessions: count });
  });

  router.get('/api/auth/admin/report', (ctx) => {
    const user = byId(current(ctx)?.userId);
    if (!user)
      throw new HttpError(401, 'Log in to see this', { 'WWW-Authenticate': 'Cookie realm="lab"' });
    if (user.role !== 'admin')
      throw new HttpError(403, `Your role (${user.role}) can't see admin reports`);
    json(ctx.res, 200, { report: 'Revenue this week: €12,340', viewer: user.name });
  });

  // ---- Passkeys
  const rp = (ctx: Ctx): { id: string; origin: string } => {
    const host = ctx.req.headers.host ?? 'localhost';
    return {
      id: host.split(':')[0] ?? 'localhost',
      origin: `${isHttps(ctx) ? 'https' : 'http'}://${host}`,
    };
  };

  router.post('/api/auth/passkey/register/options', (ctx) => {
    const session = requireCsrf(ctx, current(ctx));
    const user = byId(session.userId);
    if (!user) throw new HttpError(401, 'Log in with your password first, then add a passkey');
    session.challenge = randomBytes(32).toString('base64url');
    json(ctx.res, 200, {
      challenge: session.challenge,
      rp: { id: rp(ctx).id, name: 'Web Engineering lab' },
      user: {
        id: Buffer.from(user.id).toString('base64url'),
        name: user.email,
        displayName: user.name,
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
      excludeCredentials: user.credentials.map((c) => ({ type: 'public-key', id: c.id })),
      attestation: 'none',
      timeout: 60_000,
    });
  });

  router.post('/api/auth/passkey/register/verify', async (ctx) => {
    const session = requireCsrf(ctx, current(ctx));
    const user = byId(session.userId);
    if (!user || !session.challenge) throw new HttpError(400, 'No registration in progress');
    const body = await readJson<{
      id?: string;
      clientDataJSON?: string;
      authenticatorData?: string;
      publicKey?: string;
      publicKeyAlgorithm?: number;
    }>(ctx.req, 20_000);
    const { id: rpId, origin } = rp(ctx);
    try {
      checkClientData(b64url(body.clientDataJSON), {
        type: 'webauthn.create',
        challenge: session.challenge,
        origin,
      });
      const auth = checkAuthenticatorData(b64url(body.authenticatorData), rpId);
      if (body.publicKeyAlgorithm !== -7 || !body.publicKey || !body.id)
        throw new Error('Only ES256 passkeys are accepted here');
      user.credentials.push({
        id: body.id,
        publicKey: b64url(body.publicKey),
        signCount: auth.signCount,
        createdAt: new Date(deps.now()).toISOString(),
      });
    } catch (error) {
      throw new HttpError(
        400,
        `Passkey rejected: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      delete session.challenge;
    }
    ctx.log('info', 'passkey registered', { user: user.id });
    json(ctx.res, 201, { registered: true, passkeys: user.credentials.length });
  });

  router.post('/api/auth/passkey/login/options', (ctx) => {
    const session = requireCsrf(ctx, current(ctx));
    session.challenge = randomBytes(32).toString('base64url');
    json(ctx.res, 200, {
      challenge: session.challenge,
      rpId: rp(ctx).id,
      userVerification: 'preferred',
      timeout: 60_000,
    });
  });

  router.post('/api/auth/passkey/login/verify', async (ctx) => {
    const session = requireCsrf(ctx, current(ctx));
    const challenge = session.challenge;
    delete session.challenge;
    if (!challenge) throw new HttpError(400, 'No sign-in in progress');
    const body = await readJson<{
      id?: string;
      clientDataJSON?: string;
      authenticatorData?: string;
      signature?: string;
    }>(ctx.req, 20_000);
    const owner = [...users.values()].find((u) => u.credentials.some((c) => c.id === body.id));
    const credential = owner?.credentials.find((c) => c.id === body.id);
    if (!owner || !credential) throw new HttpError(401, 'Unknown passkey');
    const { id: rpId, origin } = rp(ctx);
    try {
      const clientDataJSON = b64url(body.clientDataJSON);
      const authenticatorData = b64url(body.authenticatorData);
      checkClientData(clientDataJSON, { type: 'webauthn.get', challenge, origin });
      const auth = checkAuthenticatorData(authenticatorData, rpId);
      if (
        !verifyAssertion({
          publicKeySpki: credential.publicKey,
          authenticatorData,
          clientDataJSON,
          signature: b64url(body.signature),
        })
      )
        throw new Error('Signature does not verify');
      if (auth.signCount !== 0 && auth.signCount <= credential.signCount)
        throw new Error('Signature counter went backwards: possible cloned authenticator');
      credential.signCount = auth.signCount;
    } catch (error) {
      throw new HttpError(
        401,
        `Passkey sign-in failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    logIn(ctx, session, owner, 'passkey');
  });
}
