/**
 * Platform routes: health, runtime facts, the log buffer, an echo endpoint for the HTTP inspector,
 * status and latency helpers, client error reports, robots.txt, a sitemap built from dist/ and
 * a redirect map for legacy URLs.
 */
import { randomBytes } from 'node:crypto';
import { request } from 'node:http';
import type { Deps } from '../app.ts';
import {
  HttpError,
  appendSetCookie,
  json,
  readBody,
  readJson,
  redirect,
  send,
  serializeCookie,
} from '../core/http.ts';
import type { Level } from '../core/log.ts';
import type { Router } from '../core/router.ts';

/** Legacy URL → current URL. 301 for moves that are forever, 302 for temporary ones. */
export const REDIRECTS: Record<string, { to: string; status: 301 | 302 | 308 }> = {
  '/old/web-engineering': { to: '/learn/', status: 301 },
  '/old/caching': { to: '/learn/05-performance/#caching', status: 301 },
  '/old/chain': { to: '/old/web-engineering', status: 301 },
  '/promo': { to: '/learn/00-what-web-engineering-is/', status: 302 },
  '/api/v1/health': { to: '/api/health', status: 308 },
};

const started = Date.now();

const CURL_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

export interface CurlResult {
  status: number;
  statusText: string;
  httpVersion: string;
  headers: [string, string][];
  body: string;
  bytes: number;
  ms: number;
}

/**
 * `curl -v` against this same server: the request goes over a real socket and the raw response
 * comes back untouched, so redirects, Set-Cookie and 304s are visible (a browser's fetch hides
 * all three). Only paths on this server are allowed, so it can't be turned into an SSRF proxy.
 */
export function curlSelf(
  port: number,
  input: { method: string; path: string; headers: Record<string, string>; body?: string },
): Promise<CurlResult> {
  const startedAt = performance.now();
  return new Promise((resolve, reject) => {
    const req = request(
      { host: '127.0.0.1', port, path: input.path, method: input.method, headers: input.headers },
      (res) => {
        const chunks: Buffer[] = [];
        let bytes = 0;
        res.on('data', (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes <= 20_000) chunks.push(chunk);
        });
        res.on('end', () => {
          const pairs: [string, string][] = [];
          for (let i = 0; i < res.rawHeaders.length; i += 2)
            pairs.push([res.rawHeaders[i] ?? '', res.rawHeaders[i + 1] ?? '']);
          const encoded = res.headers['content-encoding'];
          resolve({
            status: res.statusCode ?? 0,
            statusText: res.statusMessage ?? '',
            httpVersion: res.httpVersion,
            headers: pairs,
            body: encoded
              ? `(${bytes} bytes of ${encoded}-encoded data)`
              : Buffer.concat(chunks).toString('utf8'),
            bytes,
            ms: Math.round((performance.now() - startedAt) * 10) / 10,
          });
        });
      },
    );
    req.setTimeout(10_000, () => req.destroy(new Error('Timed out after 10 s')));
    req.on('error', reject);
    req.end(input.body || undefined);
  });
}

export function registerPlatform(router: Router, deps: Deps): void {
  router.get('/api/health', ({ res }) => {
    json(res, 200, {
      status: 'ok',
      release: deps.release,
      uptimeSeconds: Math.round((Date.now() - started) / 1000),
    });
  });

  router.get('/api/runtime', ({ res }) => {
    const has = (name: string): boolean => name in globalThis;
    json(res, 200, {
      runtime: 'Node.js',
      version: process.version,
      v8: process.versions.v8,
      platform: `${process.platform}/${process.arch}`,
      pid: process.pid,
      memoryMB: Math.round(process.memoryUsage().rss / 1e6),
      webStandardGlobals: {
        fetch: has('fetch'),
        Request: has('Request'),
        Response: has('Response'),
        WebSocket: has('WebSocket'),
        crypto_subtle: typeof globalThis.crypto?.subtle === 'object',
        ReadableStream: has('ReadableStream'),
      },
      nodeOnly: { fs: true, child_process: true, sqlite: true, net_sockets: true },
    });
  });

  router.get('/api/logs', ({ res, url }) => {
    const requestId = url.searchParams.get('requestId') ?? undefined;
    const level = (url.searchParams.get('level') ?? undefined) as Level | undefined;
    const limit = Math.min(200, Number(url.searchParams.get('limit') ?? 50));
    json(res, 200, { entries: deps.logger.recent({ requestId, level, limit }) });
  });

  // Reflects the request back: what the server actually received after the browser was done.
  router.on(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], '/api/echo', async (ctx) => {
    const body = ctx.req.method === 'GET' ? '' : (await readBody(ctx.req, 50_000)).toString('utf8');
    const headers = Object.fromEntries(
      Object.entries(ctx.req.headers).filter(([name]) => name !== 'cookie'),
    );
    json(ctx.res, 200, {
      method: ctx.req.method,
      path: ctx.url.pathname,
      query: Object.fromEntries(ctx.url.searchParams),
      headers,
      cookieNames: Object.keys(ctx.cookies),
      body,
      requestId: ctx.requestId,
    });
  });

  router.post('/api/curl', async (ctx) => {
    const input = await readJson<{
      method?: string;
      path?: string;
      headers?: Record<string, string>;
      body?: string;
    }>(ctx.req);
    const method = (input.method ?? 'GET').toUpperCase();
    const path = input.path ?? '/';
    if (!CURL_METHODS.includes(method)) throw new HttpError(400, `Unsupported method ${method}`);
    if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/api/curl'))
      throw new HttpError(400, 'Use a path on this server, such as /api/health');
    const headers: Record<string, string> = { host: ctx.req.headers.host ?? 'localhost' };
    for (const [name, value] of Object.entries(input.headers ?? {}))
      if (
        /^[\w-]+$/.test(name) &&
        !/^(host|content-length|transfer-encoding|connection)$/i.test(name)
      )
        headers[name.toLowerCase()] = String(value).replace(/[\r\n]/g, '');
    if (input.body) headers['content-length'] = String(Buffer.byteLength(input.body));
    const result = await curlSelf(ctx.req.socket.localPort ?? 0, {
      method,
      path,
      headers,
      body: input.body,
    });
    json(ctx.res, 200, { request: { method, path, headers }, response: result });
  });

  router.get('/api/slow', async ({ res, url, timing, req }) => {
    const ms = Math.min(10_000, Math.max(0, Number(url.searchParams.get('ms') ?? 500)));
    const label = url.searchParams.get('label') ?? 'resource';
    const abort = new AbortController();
    req.on('close', () => abort.abort());
    await timing.measure('work', () => deps.sleep(ms, abort.signal).catch(() => undefined));
    json(res, 200, { label, waitedMs: ms, at: new Date(deps.now()).toISOString() });
  });

  // N KB of valid, deliberately bulky JavaScript: the "multi-megabyte bundle" failure mode.
  router.get('/api/payload', ({ res, url }) => {
    const kb = Math.min(4096, Math.max(1, Number(url.searchParams.get('kb') ?? 100)));
    const lines: string[] = [];
    let size = 0;
    for (let i = 0; size < kb * 1024; i += 1) {
      const line = `function f${i}(a,b){const s="${randomBytes(24).toString('base64')}";return a+b+s.length+${i}}\n`;
      lines.push(line);
      size += line.length;
    }
    send(res, 200, lines.join(''), {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  });

  // A chart that arrives late, for layout-shift demos.
  router.get('/api/slow-image', async ({ res, url }) => {
    await deps.sleep(Math.min(5000, Number(url.searchParams.get('ms') ?? 1000)));
    const bars = [40, 75, 55, 95, 70, 110]
      .map((h, i) => `<rect x="${20 + i * 50}" y="${120 - h}" width="36" height="${h}" rx="4"/>`)
      .join('');
    send(
      res,
      200,
      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120"><rect width="320" height="120" fill="#e0f2fe"/><g fill="#0e7490">${bars}</g></svg>`,
      { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' },
    );
  });

  // An HttpOnly session cookie, to compare with a token kept in localStorage.
  router.post('/api/failure/session', ({ res }) => {
    appendSetCookie(
      res,
      serializeCookie('demo_session', randomBytes(16).toString('base64url'), {
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: 3600,
      }),
    );
    send(res, 204, '');
  });

  router.get('/api/status/:code', ({ res, params }) => {
    const code = Number(params.code);
    if (!Number.isInteger(code) || code < 200 || code > 599)
      throw new HttpError(400, 'Pick a status between 200 and 599');
    const headers: Record<string, string> = {};
    if (code === 429 || code === 503) headers['Retry-After'] = '5';
    if (code === 401) headers['WWW-Authenticate'] = 'Bearer realm="demo"';
    json(res, code, { status: code }, headers);
  });

  // Client-side error reports (window.onerror, unhandledrejection, fetch failures).
  router.post('/api/errors', async (ctx) => {
    const text = (await readBody(ctx.req, 20_000)).toString('utf8');
    let report: Record<string, unknown>;
    try {
      report = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new HttpError(400, 'Send a JSON error report');
    }
    const relatedRequestId =
      typeof report.requestId === 'string' ? report.requestId : ctx.requestId;
    deps.logger.write('error', 'client error', {
      requestId: relatedRequestId,
      source: 'browser',
      message: String(report.message ?? '').slice(0, 300),
      release: String(report.release ?? 'unknown'),
      route: String(report.route ?? ''),
    });
    send(ctx.res, 202, '');
  });

  router.get('/robots.txt', ({ res, url }) => {
    send(
      res,
      200,
      [
        '# Crawlers may read every lesson. Labs and the API are demos, not content.',
        'User-agent: *',
        'Disallow: /lab/',
        'Disallow: /api/',
        '',
        `Sitemap: ${url.origin}/sitemap.xml`,
        '',
      ].join('\n'),
      { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    );
  });

  router.get('/sitemap.xml', ({ res, url }) => {
    const urls = deps.files
      .pages()
      .filter((path) => path !== '/404/')
      .map((path) => `  <url><loc>${url.origin}${path}</loc></url>`);
    send(
      res,
      200,
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    );
  });

  for (const [from, { to, status }] of Object.entries(REDIRECTS)) {
    router.on(['GET', 'HEAD'], from, ({ res }) => {
      redirect(res, status, to);
    });
  }
}
