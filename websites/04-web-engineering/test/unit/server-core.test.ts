import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { brotliDecompressSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  isNotModified,
  matchesIfMatch,
  negotiateEncoding,
  negotiateLanguage,
  parseCookies,
  parseRange,
  serializeCookie,
} from '../../server/core/http.ts';
import { compile, Router } from '../../server/core/router.ts';
import { createLogger, requestIdFrom } from '../../server/core/log.ts';
import { Timing } from '../../server/core/timing.ts';
import { cacheControlFor, resolveFile } from '../../server/core/static.ts';
import { securityHeaders } from '../../server/core/security-headers.ts';
import { gradeHeaders } from '../../src/lib/header-grade.ts';
import { start, type Started } from '../../server/main.ts';

describe('cookies', () => {
  it('parses, decodes and keeps the first of duplicate names', () => {
    expect(parseCookies('a=1; b=hello%20world; a=2; c="q"')).toEqual({
      a: '1',
      b: 'hello world',
      c: 'q',
    });
    expect(parseCookies(undefined)).toEqual({});
  });

  it('serialises attributes and enforces the browser rules', () => {
    expect(
      serializeCookie('sid', 'x y', { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 60 }),
    ).toBe('sid=x%20y; Max-Age=60; Path=/; HttpOnly; Secure; SameSite=Lax');
    expect(() => serializeCookie('__Host-x', '1', { secure: true, path: '/app' })).toThrow();
    expect(() => serializeCookie('__Secure-x', '1', {})).toThrow();
    expect(() => serializeCookie('x', '1', { sameSite: 'None' })).toThrow();
    expect(() => serializeCookie('bad name', '1')).toThrow();
  });
});

describe('conditional requests', () => {
  it('matches If-None-Match weakly and lets it win over If-Modified-Since', () => {
    expect(isNotModified({ 'if-none-match': 'W/"abc"' }, '"abc"')).toBe(true);
    expect(isNotModified({ 'if-none-match': '"x", "abc"' }, '"abc"')).toBe(true);
    expect(isNotModified({ 'if-none-match': '"x"' }, '"abc"')).toBe(false);
    const modified = new Date('2026-01-01T00:00:00Z');
    expect(
      isNotModified(
        { 'if-none-match': '"x"', 'if-modified-since': 'Fri, 01 Jan 2027 00:00:00 GMT' },
        '"abc"',
        modified,
      ),
    ).toBe(false);
    expect(
      isNotModified({ 'if-modified-since': 'Thu, 01 Jan 2026 00:00:00 GMT' }, undefined, modified),
    ).toBe(true);
  });

  it('compares If-Match strongly', () => {
    expect(matchesIfMatch({}, '"v1"')).toBe(true);
    expect(matchesIfMatch({ 'if-match': '"v1"' }, '"v1"')).toBe(true);
    expect(matchesIfMatch({ 'if-match': 'W/"v1"' }, '"v1"')).toBe(false);
    expect(matchesIfMatch({ 'if-match': '"v0"' }, '"v1"')).toBe(false);
  });
});

describe('negotiation', () => {
  it('picks an encoding by q-value, falling back to identity', () => {
    expect(negotiateEncoding('gzip, deflate, br, zstd')).toBe('br');
    expect(negotiateEncoding('gzip;q=1, br;q=0.5')).toBe('gzip');
    expect(negotiateEncoding('br;q=0, *;q=0.1')).toBe('zstd');
    expect(negotiateEncoding('')).toBe('identity');
  });

  it('picks a language by q-value and primary subtag', () => {
    expect(negotiateLanguage('fr-CA,fr;q=0.9,en;q=0.5', ['en', 'fr', 'de'])).toBe('fr');
    expect(negotiateLanguage('de-AT', ['en', 'de-DE'])).toBe('de-DE');
    expect(negotiateLanguage('ja', ['en', 'fr'])).toBe('en');
  });
});

describe('ranges', () => {
  it('handles open, closed and suffix ranges', () => {
    expect(parseRange('bytes=0-9', 100)).toEqual({ start: 0, end: 9 });
    expect(parseRange('bytes=90-', 100)).toEqual({ start: 90, end: 99 });
    expect(parseRange('bytes=-10', 100)).toEqual({ start: 90, end: 99 });
    expect(parseRange('bytes=50-500', 100)).toEqual({ start: 50, end: 99 });
    expect(parseRange('bytes=200-', 100)).toBe('unsatisfiable');
    expect(parseRange('items=0-1', 100)).toBeUndefined();
  });
});

describe('router', () => {
  it('captures params and rest segments', () => {
    const router = new Router();
    const handler = (): void => undefined;
    router.get('/api/todos/:id', handler).post('/api/todos', handler).get('/lab/pwa/*', handler);
    expect(router.match('GET', '/api/todos/42')).toMatchObject({ params: { id: '42' } });
    expect(router.match('GET', '/lab/pwa/a/b')).toMatchObject({ params: { rest: 'a/b' } });
    expect(router.match('DELETE', '/api/todos')).toEqual({ kind: 'method', allow: ['POST'] });
    expect(router.match('GET', '/nope')).toEqual({ kind: 'none' });
    expect(compile('/a.b/:x').pattern.test('/aXb/1')).toBe(false);
  });
});

describe('logging and timing', () => {
  it('keeps a bounded buffer filterable by request ID and level', () => {
    const lines: string[] = [];
    const logger = createLogger({ capacity: 3, sink: (l) => lines.push(l) });
    logger.forRequest('req-aaaaaaaa')('info', 'one');
    logger.write('warn', 'two');
    logger.forRequest('req-aaaaaaaa')('error', 'three');
    logger.write('info', 'four');
    expect(logger.recent().map((e) => e.msg)).toEqual(['two', 'three', 'four']);
    expect(logger.recent({ requestId: 'req-aaaaaaaa' }).map((e) => e.msg)).toEqual(['three']);
    expect(logger.recent({ level: 'warn' }).map((e) => e.msg)).toEqual(['two', 'three']);
    expect(JSON.parse(lines[0] ?? '{}')).toMatchObject({ requestId: 'req-aaaaaaaa', msg: 'one' });
  });

  it('accepts well-formed incoming request IDs only', () => {
    expect(requestIdFrom('abc-12345678', () => 'minted')).toBe('abc-12345678');
    expect(requestIdFrom('<script>', () => 'minted')).toBe('minted');
  });

  it('formats Server-Timing', async () => {
    let t = 0;
    const timing = new Timing(() => t);
    timing.start('db', 'query "todos"');
    t = 12.34;
    timing.end('db');
    await timing.measure('render', () => {
      t = 20;
    });
    expect(timing.header()).toBe('db;dur=12.3;desc="query todos", render;dur=7.7');
  });
});

describe('static helpers', () => {
  it('never resolves outside the root', () => {
    const root = mkdtempSync(join(tmpdir(), 'static-'));
    writeFileSync(join(root, 'a.txt'), 'a');
    expect(resolveFile(root, '/a.txt')).toBe(join(root, 'a.txt'));
    expect(resolveFile(root, '/../../etc/passwd')).toBeUndefined();
    expect(resolveFile(root, '/%2e%2e/%2e%2e/etc/passwd')).toBeUndefined();
    expect(resolveFile(root, '/a.txt%00.html')).toBeUndefined();
    expect(resolveFile(root, '/%E0%A4%A')).toBeUndefined();
  });

  it('caches hashed assets forever and revalidates HTML', () => {
    expect(cacheControlFor('/_astro/app.3f9a.js')).toContain('immutable');
    expect(cacheControlFor('/learn/')).toBe('no-cache');
  });
});

describe('security headers', () => {
  it('adds HSTS only over HTTPS and grades a header set', () => {
    expect(securityHeaders({ https: false })['Strict-Transport-Security']).toBeUndefined();
    expect(securityHeaders({ https: true })['Strict-Transport-Security']).toContain('max-age');
    const headers = new Headers(securityHeaders({ https: false }));
    const grades = gradeHeaders((n) => headers.get(n), false);
    expect(grades.find((g) => g.header === 'X-Content-Type-Options')?.verdict).toBe('good');
    expect(grades.find((g) => g.header === 'Content-Security-Policy')?.verdict).toBe('weak');
    const none = gradeHeaders(() => null, true);
    expect(none.every((g) => g.verdict === 'missing')).toBe(true);
  });
});

describe('the app over real HTTP', () => {
  let server: Started;
  const root = mkdtempSync(join(tmpdir(), 'dist-'));
  beforeAll(async () => {
    mkdirSync(join(root, '_astro'));
    mkdirSync(join(root, 'learn'));
    writeFileSync(
      join(root, 'index.html'),
      `<!doctype html><title>Home</title>${'x'.repeat(4000)}`,
    );
    writeFileSync(join(root, 'learn', 'index.html'), '<!doctype html><title>Learn</title>');
    writeFileSync(join(root, '404.html'), '<!doctype html><title>Not found</title>');
    writeFileSync(join(root, '_astro', 'app.abc123.js'), `console.log(1);${' '.repeat(3000)}`);
    server = await start({ port: 0, root, secret: 'test-secret' });
  });
  afterAll(async () => {
    await server.close();
  });

  it('serves compressed HTML with validators, security headers and a request ID', async () => {
    const res = await fetch(`${server.url}/`, { headers: { 'accept-encoding': 'gzip' } });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-encoding')).toBe('gzip');
    expect(res.headers.get('cache-control')).toBe('no-cache');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-request-id')).toMatch(/^[\w-]{8,}$/);
    expect(res.headers.get('server-timing')).toMatch(/total;dur=/);
    const etag = res.headers.get('etag') ?? '';
    expect(etag).toMatch(/-gzip"$/);
    const again = await fetch(`${server.url}/`, {
      headers: { 'accept-encoding': 'gzip', 'if-none-match': etag },
    });
    expect(again.status).toBe(304);
  });

  it('compresses with Brotli when asked and decompresses to the original', async () => {
    const { request } = await import('node:http');
    const body = await new Promise<Buffer>((done) => {
      request(
        `${server.url}/_astro/app.abc123.js`,
        { headers: { 'accept-encoding': 'br' } },
        (r) => {
          expect(r.headers['content-encoding']).toBe('br');
          expect(r.headers['cache-control']).toContain('immutable');
          const chunks: Buffer[] = [];
          r.on('data', (c: Buffer) => chunks.push(c));
          r.on('end', () => done(Buffer.concat(chunks)));
        },
      ).end();
    });
    expect(brotliDecompressSync(body).toString()).toMatch(/^console\.log\(1\);/);
  });

  it('answers ranges, 404 pages, 405 with Allow, redirects and the API', async () => {
    const partial = await fetch(`${server.url}/learn/`, { headers: { range: 'bytes=0-8' } });
    expect(partial.status).toBe(206);
    expect(await partial.text()).toBe('<!doctype');

    const missing = await fetch(`${server.url}/nope`, { headers: { accept: 'text/html' } });
    expect(missing.status).toBe(404);
    expect(await missing.text()).toContain('Not found');

    const apiMissing = await fetch(`${server.url}/api/nope`);
    expect(apiMissing.status).toBe(404);
    expect(await apiMissing.json()).toMatchObject({ status: 404 });

    const wrongMethod = await fetch(`${server.url}/api/health`, { method: 'DELETE' });
    expect(wrongMethod.status).toBe(405);
    expect(wrongMethod.headers.get('allow')).toContain('GET');

    const moved = await fetch(`${server.url}/old/chain`, { redirect: 'manual' });
    expect(moved.status).toBe(301);
    expect(moved.headers.get('location')).toBe('/old/web-engineering');

    const health = await fetch(`${server.url}/api/health`);
    expect(await health.json()).toMatchObject({ status: 'ok' });

    const sitemap = await (await fetch(`${server.url}/sitemap.xml`)).text();
    expect(sitemap).toContain(`<loc>${server.url}/learn/</loc>`);
    expect(sitemap).not.toContain('404');
  });

  it('correlates logs with the request ID', async () => {
    const res = await fetch(`${server.url}/api/status/503`, {
      headers: { 'x-request-id': 'trace-12345678' },
    });
    expect(res.status).toBe(503);
    expect(res.headers.get('retry-after')).toBe('5');
    const logs = (await (
      await fetch(`${server.url}/api/logs?requestId=trace-12345678`)
    ).json()) as { entries: { msg: string; status: number }[] };
    expect(logs.entries).toEqual([expect.objectContaining({ msg: 'request', status: 503 })]);
  });

  it('echoes what the server received and rejects oversized bodies', async () => {
    const echo = (await (
      await fetch(`${server.url}/api/echo?x=1`, { method: 'POST', body: 'hi' })
    ).json()) as { method: string; body: string; query: Record<string, string> };
    expect(echo).toMatchObject({ method: 'POST', body: 'hi', query: { x: '1' } });
    const big = await fetch(`${server.url}/api/echo`, { method: 'POST', body: 'x'.repeat(60_000) });
    expect(big.status).toBe(413);
  });
});
