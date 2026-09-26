/** Client for AuthLab.astro: session inspection, CSRF-protected calls, cross-tab logout, passkeys. */
import { need } from '@learn/shared/client/controls.ts';
import { fromBase64url, toBase64url } from '../lib/base64url.ts';
import { guard, logLine } from './api.ts';

interface SessionInfo {
  authenticated: boolean;
  user?: { name: string; email: string; role: string; passkeys: number };
  sessionId: string;
  csrfToken: string;
  idleExpiresAt: string;
  activeSessions: number;
  rotatedFrom?: string;
}

export function initAuthLab(root: HTMLElement): void {
  const log = need<HTMLOListElement>(root, '[data-al-log]');
  const stats = need<HTMLDListElement>(root, '[data-al-stats]');
  const cookieLine = need<HTMLElement>(root, '[data-al-cookie]');
  const form = need<HTMLFormElement>(root, '[data-al-form]');
  const sendCsrf = need<HTMLInputElement>(root, '[data-al-csrf]');
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('learn-auth-lab') : undefined;
  let csrf = '';

  const show = (info: SessionInfo): void => {
    csrf = info.csrfToken;
    const rows: [string, string][] = [
      [
        'Signed in',
        info.authenticated
          ? `yes, as ${info.user?.name} (${info.user?.role})`
          : 'no (anonymous session)',
      ],
      [
        'Session ID',
        info.rotatedFrom ? `${info.sessionId} (was ${info.rotatedFrom})` : info.sessionId,
      ],
      ['CSRF token', `${info.csrfToken.slice(0, 10)}…`],
      ['Idle expiry', new Date(info.idleExpiresAt).toLocaleTimeString()],
      ['Passkeys', String(info.user?.passkeys ?? 0)],
      ['Your sessions', String(info.activeSessions)],
    ];
    stats.replaceChildren(
      ...rows.map(([term, value]) => {
        const div = document.createElement('div');
        const dt = document.createElement('dt');
        dt.textContent = term;
        const dd = document.createElement('dd');
        dd.textContent = value;
        div.append(dt, dd);
        return div;
      }),
    );
    cookieLine.textContent = `document.cookie sees: ${document.cookie || '(nothing)'}. The HttpOnly sid cookie is invisible to scripts, including injected ones.`;
  };

  const refresh = async (): Promise<SessionInfo> => {
    const info = (await (await fetch('/api/auth/session')).json()) as SessionInfo;
    show(info);
    return info;
  };

  const call = async (path: string, body?: unknown): Promise<Response> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sendCsrf.checked) headers['X-CSRF-Token'] = csrf;
    return fetch(path, { method: 'POST', headers, body: JSON.stringify(body ?? {}) });
  };

  const report = async (res: Response, success: string): Promise<boolean> => {
    if (res.ok) {
      logLine(log, `${res.status} ${success}`, 'good');
      return true;
    }
    const { error } = (await res.json()) as { error?: string };
    const limit = res.headers.get('ratelimit-remaining');
    logLine(
      log,
      `${res.status} ${error ?? res.statusText}${limit !== null ? ` · attempts left: ${limit}` : ''}${res.headers.get('retry-after') ? ` · Retry-After: ${res.headers.get('retry-after')} s` : ''}`,
      'bad',
    );
    return false;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void (async () => {
      const data = Object.fromEntries(new FormData(form));
      const res = await call('/api/auth/login', data);
      if (res.ok) {
        const info = (await res.json()) as SessionInfo;
        show(info);
        logLine(
          log,
          `200 Logged in. The session ID rotated from ${info.rotatedFrom} to ${info.sessionId}: a pre-login ID (maybe planted by an attacker) is now worthless.`,
          'good',
        );
        channel?.postMessage('login');
      } else await report(res, '');
    })();
  });

  const actions: Record<string, () => Promise<void>> = {
    refresh: async () => {
      await refresh();
    },
    logout: async () => {
      if (
        await report(
          await call('/api/auth/logout'),
          'Logged out: session destroyed on the server, cookie cleared.',
        )
      ) {
        channel?.postMessage('logout');
        await refresh();
      }
    },
    'logout-all': async () => {
      const res = await call('/api/auth/logout-all');
      if (res.ok) {
        const { revokedSessions } = (await res.json()) as { revokedSessions: number };
        logLine(log, `200 Revoked ${revokedSessions} session(s) on every device.`, 'good');
        channel?.postMessage('logout');
      } else await report(res, '');
      await refresh();
    },
    admin: async () => {
      const res = await fetch('/api/auth/admin/report');
      const body = (await res.json()) as { report?: string; error?: string };
      logLine(log, `${res.status} ${body.report ?? body.error}`, res.ok ? 'good' : 'bad');
    },
    'passkey-create': async () => {
      if (!('PublicKeyCredential' in window))
        throw new Error('WebAuthn is not supported in this browser');
      const res = await call('/api/auth/passkey/register/options');
      if (!(await report(res, 'Registration options received'))) return;
      const o = (await res.json()) as {
        challenge: string;
        rp: PublicKeyCredentialRpEntity;
        user: { id: string; name: string; displayName: string };
        pubKeyCredParams: PublicKeyCredentialParameters[];
        authenticatorSelection: AuthenticatorSelectionCriteria;
        excludeCredentials: { type: 'public-key'; id: string }[];
        timeout: number;
      };
      const credential = (await navigator.credentials.create({
        publicKey: {
          ...o,
          challenge: fromBase64url(o.challenge),
          user: { ...o.user, id: fromBase64url(o.user.id) },
          excludeCredentials: o.excludeCredentials.map((c) => ({ ...c, id: fromBase64url(c.id) })),
          attestation: 'none',
        },
      })) as PublicKeyCredential | null;
      if (!credential) return;
      const r = credential.response as AuthenticatorAttestationResponse;
      const publicKey = r.getPublicKey();
      if (!publicKey) throw new Error('This authenticator did not expose a public key');
      await report(
        await call('/api/auth/passkey/register/verify', {
          id: credential.id,
          clientDataJSON: toBase64url(r.clientDataJSON),
          authenticatorData: toBase64url(r.getAuthenticatorData()),
          publicKey: toBase64url(publicKey),
          publicKeyAlgorithm: r.getPublicKeyAlgorithm(),
        }),
        'Passkey stored: the server keeps only a public key.',
      );
      await refresh();
    },
    'passkey-login': async () => {
      if (!('PublicKeyCredential' in window))
        throw new Error('WebAuthn is not supported in this browser');
      const res = await call('/api/auth/passkey/login/options');
      if (!res.ok) return void (await report(res, ''));
      const o = (await res.json()) as { challenge: string; rpId: string; timeout: number };
      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: fromBase64url(o.challenge),
          rpId: o.rpId,
          timeout: o.timeout,
          userVerification: 'preferred',
        },
      })) as PublicKeyCredential | null;
      if (!credential) return;
      const r = credential.response as AuthenticatorAssertionResponse;
      const verify = await call('/api/auth/passkey/login/verify', {
        id: credential.id,
        clientDataJSON: toBase64url(r.clientDataJSON),
        authenticatorData: toBase64url(r.authenticatorData),
        signature: toBase64url(r.signature),
      });
      if (verify.ok) {
        const info = (await verify.json()) as SessionInfo;
        show(info);
        logLine(
          log,
          `200 Signed in with a passkey: the signature over this site's origin and a fresh challenge verified. Session rotated to ${info.sessionId}.`,
          'good',
        );
        channel?.postMessage('login');
      } else await report(verify, '');
    },
  };

  root.querySelectorAll<HTMLButtonElement>('[data-al]').forEach((button) => {
    button.addEventListener('click', () => {
      void actions[button.dataset.al ?? '']?.().catch((error: unknown) =>
        logLine(log, String(error), 'bad'),
      );
    });
  });
  channel?.addEventListener('message', (event: MessageEvent<string>) => {
    logLine(
      log,
      `Another tab reported "${event.data}": this tab refreshed its session without being asked.`,
      'info',
    );
    void refresh();
  });
  void guard(root).then((ok) => {
    if (ok) void refresh();
  });
}
