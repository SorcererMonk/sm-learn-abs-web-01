/**
 * A sign-up form that works with and without JavaScript, validated by the same schema the browser
 * uses (src/lib/signup-schema.ts).
 * - No JavaScript: the browser posts urlencoded; errors re-render the form as HTML with 422, success
 *   is Post/Redirect/Get (303). A hidden per-render key makes a double submit harmless.
 * - JavaScript: fetch with Accept: application/json and an Idempotency-Key header; 201 or 422 JSON.
 */
import { randomBytes, randomUUID } from 'node:crypto';
import type { Deps } from '../app.ts';
import { HttpError, html, json, mediaType, readBody, redirect } from '../core/http.ts';
import { IdempotencyStore, fingerprint, validKey } from '../core/idempotency.ts';
import type { Router } from '../core/router.ts';
import { escapeHtml, labPage } from '../labs/layout.ts';
import {
  FIELD_ORDER,
  PLANS,
  validateSignup,
  type SignupErrors,
  type SignupField,
} from '../../src/lib/signup-schema.ts';

export interface Account {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
}

export function renderSignupForm(
  values: Record<string, string>,
  errors: SignupErrors,
  key: string,
): string {
  const field = (name: SignupField, control: string): string => {
    const error = errors[name];
    return `<div class="card"${error ? ' style="border-color:var(--bad)"' : ''}>
${control}
${error ? `<p id="${name}-error" class="bad"><strong>Error:</strong> ${escapeHtml(error)}</p>` : ''}
</div>`;
  };
  const attrs = (name: SignupField): string =>
    errors[name] ? ` aria-invalid="true" aria-describedby="${name}-error"` : '';
  const summary = Object.keys(errors).length
    ? `<div class="card" role="alert" tabindex="-1" id="summary" style="border:3px solid var(--bad)"><h2>There is a problem</h2><ul>${FIELD_ORDER.filter(
        (f) => errors[f],
      )
        .map((f) => `<li><a href="#${f}">${escapeHtml(errors[f])}</a></li>`)
        .join('')}</ul></div>`
    : '';
  return `${summary}
<form action="/api/signup" method="post" novalidate>
<input type="hidden" name="idempotency" value="${escapeHtml(key)}">
${field('name', `<label for="name">Name</label><br><input id="name" name="name" autocomplete="name" value="${escapeHtml(values.name)}"${attrs('name')}>`)}
${field('email', `<label for="email">Email</label><br><input id="email" name="email" type="email" autocomplete="email" value="${escapeHtml(values.email)}"${attrs('email')}>`)}
${field('password', `<label for="password">Password (10+ characters)</label><br><input id="password" name="password" type="password" autocomplete="new-password"${attrs('password')}>`)}
${field('plan', `<label for="plan">Plan</label><br><select id="plan" name="plan"${attrs('plan')}><option value="">Choose…</option>${PLANS.map((p) => `<option${values.plan === p ? ' selected' : ''}>${p}</option>`).join('')}</select>`)}
${field('terms', `<label><input type="checkbox" id="terms" name="terms"${attrs('terms')}> I accept the terms</label>`)}
<p><button>Create account</button></p>
</form>`;
}

export function registerForms(router: Router, deps: Deps): void {
  const accounts = new Map<string, Account>();
  const idempotency = new IdempotencyStore({ now: deps.now });

  const create = (value: { name: string; email: string; plan: string }): Account => {
    const account: Account = {
      id: randomUUID().slice(0, 8),
      name: value.name,
      email: value.email,
      plan: value.plan,
      createdAt: new Date(deps.now()).toISOString(),
    };
    accounts.set(account.email, account);
    return account;
  };

  router.get('/lab/signup', ({ res }) => {
    html(
      res,
      200,
      labPage({
        title: 'Create an account',
        body: `<p class="kicker">Lab · server-rendered form</p><h1>Create an account</h1>${renderSignupForm({}, {}, randomBytes(12).toString('base64url'))}`,
      }),
    );
  });

  router.post('/api/signup', async (ctx) => {
    const { req, res } = ctx;
    const type = mediaType(req.headers);
    const raw = (await readBody(req, 20_000)).toString('utf8');
    let input: Record<string, unknown>;
    if (type === 'application/json') {
      try {
        input = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        throw new HttpError(400, 'Body is not valid JSON');
      }
    } else if (type === 'application/x-www-form-urlencoded') {
      input = Object.fromEntries(new URLSearchParams(raw));
    } else {
      throw new HttpError(415, 'Send a form or JSON');
    }
    const wantsJson = (req.headers.accept ?? '').includes('application/json');
    const delay = Math.min(3000, Number(ctx.url.searchParams.get('delay') ?? 0));
    const headerKey = req.headers['idempotency-key'];
    const key = typeof headerKey === 'string' ? headerKey : String(input.idempotency ?? '');
    const print = fingerprint('signup', JSON.stringify({ ...input, idempotency: undefined }));

    if (validKey(key)) {
      const begun = idempotency.begin(key, print);
      if (begun.kind === 'replay') {
        ctx.log('info', 'idempotent replay', { key });
        const account = begun.response.body as Account;
        if (wantsJson)
          json(res, begun.response.status, account, { 'Idempotency-Replayed': 'true' });
        else redirect(res, 303, `/lab/signup/done?id=${account.id}&replayed=1`);
        return;
      }
      if (begun.kind === 'in-flight')
        throw new HttpError(409, 'That submission is still being processed');
      if (begun.kind === 'mismatch')
        throw new HttpError(422, 'That idempotency key was used with a different submission');
    }

    // Simulated slow work (after the key is claimed, so a concurrent duplicate sees it in flight).
    if (delay > 0) await deps.sleep(delay);
    const result = validateSignup(input);
    const errors: SignupErrors = result.ok ? {} : result.errors;
    const email = result.ok
      ? result.value.email
      : String(input.email ?? '')
          .trim()
          .toLowerCase();
    if (!errors.email && email && accounts.has(email))
      errors.email = 'An account with that email already exists (only the server can know this)';
    if (!result.ok || Object.keys(errors).length) {
      if (validKey(key)) idempotency.abandon(key);
      ctx.log('info', 'signup rejected', { fields: Object.keys(errors) });
      if (wantsJson) {
        json(res, 422, { errors });
        return;
      }
      const values = result.ok
        ? { name: result.value.name, email, plan: result.value.plan }
        : result.values;
      html(
        res,
        422,
        labPage({
          title: 'Error: create an account',
          body: `<p class="kicker">Lab · server-rendered form · 422</p><h1>Create an account</h1>${renderSignupForm(values, errors, randomBytes(12).toString('base64url'))}<script>document.getElementById('summary')?.focus()</script>`,
        }),
      );
      return;
    }
    const account = create(result.value);
    if (validKey(key)) idempotency.complete(key, { status: 201, body: account });
    ctx.log('info', 'account created', { id: account.id, plan: account.plan });
    if (wantsJson) json(res, 201, account, { Location: `/api/signup/${account.id}` });
    else redirect(res, 303, `/lab/signup/done?id=${account.id}`);
  });

  router.get('/lab/signup/done', ({ res, url }) => {
    const account = [...accounts.values()].find((a) => a.id === url.searchParams.get('id'));
    const replayed = url.searchParams.get('replayed') === '1';
    html(
      res,
      account ? 200 : 404,
      labPage({
        title: account ? 'Account created' : 'Account not found',
        body: account
          ? `<p class="kicker">Lab · 303 See Other → GET</p><h1>Welcome, ${escapeHtml(account.name)}</h1><p>Account <code>${account.id}</code> on the <strong>${escapeHtml(account.plan)}</strong> plan.${replayed ? ' <strong>This was a duplicate submission:</strong> the server recognised its key and did not create a second account.' : ''}</p><p class="muted">Refresh this page: it's a GET, so nothing is re-submitted.</p><p><a href="/lab/signup">Create another</a></p>`
          : '<h1>Account not found</h1>',
      }),
    );
  });

  router.get('/api/signup/accounts', ({ res }) => {
    json(res, 200, { accounts: [...accounts.values()] });
  });

  router.post('/api/signup/reset', ({ res }) => {
    accounts.clear();
    idempotency.clear();
    json(res, 200, { ok: true });
  });
}
