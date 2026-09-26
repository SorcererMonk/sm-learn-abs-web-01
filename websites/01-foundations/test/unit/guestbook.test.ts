import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp, openDatabase } from '../../examples/guestbook/server.ts';

const app = createApp(openDatabase(':memory:'));
let base = '';

beforeAll(async () => {
  await new Promise<void>((resolve) => app.listen(0, resolve));
  base = `http://127.0.0.1:${(app.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((resolve) => app.close(() => resolve())));

/** GET / like a first-time visitor: returns the session cookie and the form's CSRF token. */
async function visit(): Promise<{ cookie: string; token: string; body: string }> {
  const res = await fetch(`${base}/`);
  const cookie = (res.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
  const body = await res.text();
  const token = /name="csrf" value="([^"]+)"/.exec(body)?.[1] ?? '';
  return { cookie, token, body };
}

const sign = (cookie: string, fields: Record<string, string>) =>
  fetch(`${base}/sign`, {
    method: 'POST',
    redirect: 'manual',
    headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });

describe('guestbook server', () => {
  it('serves HTML with security headers and an HttpOnly session cookie', async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(res.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('set-cookie')).toMatch(/HttpOnly; SameSite=Lax/);
  });

  it('rejects a POST without the session token (CSRF)', async () => {
    const res = await sign('', { name: 'Mallory', message: 'hi there' });
    expect(res.status).toBe(403);
  });

  it('re-renders errors with 422 and keeps the input', async () => {
    const { cookie, token } = await visit();
    const res = await sign(cookie, { csrf: token, name: '', message: 'ok message' });
    expect(res.status).toBe(422);
    const body = await res.text();
    expect(body).toContain('Enter your name');
    expect(body).toContain('>ok message</textarea>');
  });

  it('stores a valid entry, redirects with 303, and renders it escaped', async () => {
    const { cookie, token } = await visit();
    const res = await sign(cookie, { csrf: token, name: '<b>Asha</b>', message: 'Lovely site!' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/');
    const page = await (await fetch(`${base}/`, { headers: { cookie } })).text();
    expect(page).toContain('&lt;b&gt;Asha&lt;/b&gt;');
    expect(page).not.toContain('<b>Asha</b>');
  });

  it('serves an Atom feed, immutable static CSS, streaming HTML and a 404', async () => {
    const feed = await fetch(`${base}/feed.xml`);
    expect(feed.headers.get('content-type')).toContain('application/atom+xml');
    expect(await feed.text()).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    const css = await fetch(`${base}/static/site.v1.css`);
    expect(css.headers.get('cache-control')).toContain('immutable');
    const slow = await (await fetch(`${base}/slow`)).text();
    expect(slow).toContain('Figures: 42');
    expect((await fetch(`${base}/missing`)).status).toBe(404);
  });
});
