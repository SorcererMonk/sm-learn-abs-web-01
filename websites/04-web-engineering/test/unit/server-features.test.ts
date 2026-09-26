import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { IdempotencyStore, fingerprint, validKey } from '../../server/core/idempotency.ts';
import { parseWaterfall, waterfallPage } from '../../server/features/labs-browser.ts';
import { escapeHtml, safeJson } from '../../server/labs/layout.ts';
import { start, type Started } from '../../server/main.ts';
import { validateSignup } from '../../src/lib/signup-schema.ts';

describe('signup schema (shared by browser and server)', () => {
  it('accepts a valid sign-up and normalises it', () => {
    const result = validateSignup({
      name: ' Asha ',
      email: 'Asha@Example.com',
      password: 'correct horse',
      plan: 'pro',
      terms: 'on',
    });
    expect(result).toEqual({
      ok: true,
      value: {
        name: 'Asha',
        email: 'asha@example.com',
        password: 'correct horse',
        plan: 'pro',
        terms: true,
      },
    });
  });

  it('reports every problem at once, and rejects breached passwords', () => {
    const result = validateSignup({ email: 'nope', password: 'password123', plan: 'gold' });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(Object.keys(result.errors).sort()).toEqual([
        'email',
        'name',
        'password',
        'plan',
        'terms',
      ]);
    const breached = validateSignup({ password: 'Password123' });
    if (!breached.ok) expect(breached.errors.password).toMatch(/breach/);
  });
});

describe('idempotency store', () => {
  it('runs once, replays, rejects mismatches and expires', () => {
    let now = 0;
    const store = new IdempotencyStore({ ttlMs: 1000, now: () => now });
    const print = fingerprint('POST', '/pay', '{"amount":10}');
    expect(store.begin('key-12345678', print)).toEqual({ kind: 'new' });
    expect(store.begin('key-12345678', print)).toEqual({ kind: 'in-flight' });
    store.complete('key-12345678', { status: 201, body: { id: 1 } });
    expect(store.begin('key-12345678', print)).toEqual({
      kind: 'replay',
      response: { status: 201, body: { id: 1 } },
    });
    expect(store.begin('key-12345678', fingerprint('other'))).toEqual({ kind: 'mismatch' });
    now = 5000;
    expect(store.begin('key-12345678', print)).toEqual({ kind: 'new' });
    store.abandon('key-12345678');
    expect(store.begin('key-12345678', print)).toEqual({ kind: 'new' });
    expect(validKey('short')).toBe(false);
    expect(validKey('a'.repeat(20))).toBe(true);
  });
});

describe('lab page helpers', () => {
  it('escapes HTML and makes JSON safe inside script elements', () => {
    expect(escapeHtml(`<a href="x">'&`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
    expect(safeJson({ s: '</script><script>alert(1)</script>' })).not.toContain('</script>');
    expect(safeJson('\u2028')).toBe('"\\u2028"');
  });

  it('builds the waterfall page the configuration describes', () => {
    const config = parseWaterfall(
      new URLSearchParams(
        'css=900&cssMode=blocking&jsMode=defer&js=99999&imgMode=lazy&vendorMode=async&vendor=100&run=a<b>',
      ),
    );
    expect(config).toMatchObject({
      css: 900,
      js: 5000,
      jsMode: 'defer',
      imgMode: 'lazy',
      run: 'ab',
    });
    const page = waterfallPage(config, 'http://127.0.0.1:4400');
    expect(page).toContain('<link rel="stylesheet" href="/lab/asset/style.css?delay=900&run=ab">');
    expect(page).toContain('<script defer src="/lab/asset/app.js');
    expect(page).toContain('loading="lazy"');
    expect(page).toContain('<script async src="http://127.0.0.1:4400/lab/asset/vendor.js');
    expect(parseWaterfall(new URLSearchParams('cssMode=evil'))).toMatchObject({
      cssMode: 'blocking',
    });
  });
});

describe('feature routes over HTTP', () => {
  let server: Started;
  beforeAll(async () => {
    const root = mkdtempSync(join(tmpdir(), 'dist-'));
    writeFileSync(join(root, 'index.html'), '<!doctype html><title>x</title>');
    server = await start({ port: 0, root });
  });
  afterAll(async () => {
    await server.close();
  });
  const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    fetch(`${server.url}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', ...headers },
      body: JSON.stringify(body),
      redirect: 'manual',
    });
  const valid = {
    name: 'Asha',
    email: 'asha@example.com',
    password: 'correct horse',
    plan: 'pro',
    terms: 'on',
  };

  it('validates sign-ups on the server with the shared schema, plus what only it knows', async () => {
    const bad = await post('/api/signup', { name: '' });
    expect(bad.status).toBe(422);
    expect(((await bad.json()) as { errors: Record<string, string> }).errors.name).toBeTruthy();

    const created = await post('/api/signup', valid, { 'idempotency-key': 'signup-key-0001' });
    expect(created.status).toBe(201);
    const account = (await created.json()) as { id: string };

    const replay = await post('/api/signup', valid, { 'idempotency-key': 'signup-key-0001' });
    expect(replay.status).toBe(201);
    expect(replay.headers.get('idempotency-replayed')).toBe('true');
    expect(((await replay.json()) as { id: string }).id).toBe(account.id);

    const taken = await post('/api/signup', valid, { 'idempotency-key': 'signup-key-0002' });
    expect(taken.status).toBe(422);
    expect(await taken.text()).toMatch(/already exists/);
  });

  it('answers a no-JavaScript form post with 422 HTML or 303 See Other', async () => {
    const form = (fields: Record<string, string>) =>
      fetch(`${server.url}/api/signup`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/html' },
        body: new URLSearchParams(fields),
        redirect: 'manual',
      });
    const errors = await form({ name: '<b>Bo</b>', email: 'x' });
    expect(errors.status).toBe(422);
    const markup = await errors.text();
    expect(markup).toContain('<title>Error: create an account</title>');
    expect(markup).toContain('value="&lt;b&gt;Bo&lt;/b&gt;"');
    expect(markup).toContain('aria-invalid="true" aria-describedby="email-error"');

    const ok = await form({ ...valid, email: 'bo@example.com', idempotency: 'form-key-00001' });
    expect(ok.status).toBe(303);
    expect(ok.headers.get('location')).toMatch(/^\/lab\/signup\/done\?id=/);
    const again = await form({ ...valid, email: 'bo@example.com', idempotency: 'form-key-00001' });
    expect(again.headers.get('location')).toMatch(/replayed=1/);
  });

  it('streams NDJSON rows as they are produced', async () => {
    const res = await fetch(`${server.url}/api/stream/ndjson?count=50&delay=0`);
    expect(res.headers.get('content-type')).toContain('ndjson');
    const lines = (await res.text()).trim().split('\n');
    expect(lines).toHaveLength(50);
    expect(JSON.parse(lines[0] ?? '{}')).toMatchObject({ id: 1 });
  });

  it('serves the PWA lab, stamps the worker, dedupes replayed notes and simulates outages', async () => {
    const sw = await (await fetch(`${server.url}/lab/pwa/sw.js`)).text();
    expect(sw).toContain("const VERSION = 'v1'");
    await fetch(`${server.url}/api/pwa/deploy`, { method: 'POST' });
    expect(await (await fetch(`${server.url}/lab/pwa/sw.js`)).text()).toContain("'v2'");

    const note = { id: 'note-1', text: 'Buy oats', at: 1 };
    expect((await post('/lab/pwa/api/notes', note)).status).toBe(201);
    expect((await post('/lab/pwa/api/notes', note)).status).toBe(201);
    const { notes } = (await (await fetch(`${server.url}/lab/pwa/api/notes`)).json()) as {
      notes: unknown[];
    };
    expect(notes).toHaveLength(1);

    await fetch(`${server.url}/api/pwa/outage?on=1`, { method: 'POST' });
    await expect(fetch(`${server.url}/lab/pwa/`)).rejects.toThrow();
    await fetch(`${server.url}/api/pwa/outage?on=0`, { method: 'POST' });
    expect((await fetch(`${server.url}/lab/pwa/`)).status).toBe(200);
  });

  it('serves lab pages for isolation and navigation with the right headers', async () => {
    const isolated = await fetch(`${server.url}/lab/isolation?coep=1`);
    expect(isolated.headers.get('cross-origin-embedder-policy')).toBe('require-corp');
    const nostore = await fetch(`${server.url}/lab/nav/a?nostore=1&prerender=1`);
    expect(nostore.headers.get('cache-control')).toBe('no-store');
    expect(await nostore.text()).toContain('<script type="speculationrules">');
    const vendor = await fetch(`${server.url}/lab/asset/vendor.js?delay=0`);
    expect(vendor.headers.get('cross-origin-resource-policy')).toBe('cross-origin');
  });
});
