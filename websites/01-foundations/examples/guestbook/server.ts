/**
 * The "minimal backend you should be able to write" from Part 22, with no dependencies:
 * node:http + node:sqlite, auto-escaped templates, a PRG form with server validation and a CSRF
 * token bound to an HttpOnly session cookie, pagination by URL, cache and security headers,
 * a streamed slow page, an Atom feed, and real 404/500 pages.
 *
 * Run: npm run guestbook   (then open http://localhost:4400)
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { html, render, type SafeHtml } from '../../src/lib/html-template.ts';

const PAGE_SIZE = 5;
const CSS = `body{font:1rem/1.6 system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem;color:#1d1a19}
.field{display:grid;gap:.25rem;margin-bottom:1rem}input,textarea{font:inherit;padding:.4rem}
[aria-invalid=true]{border:2px solid #b91c1c}.error{color:#b91c1c;font-weight:700;margin:0}
.error-summary{border:4px solid #b91c1c;padding:.5rem 1rem}article{border-top:1px solid #e7e5e4;padding:.5rem 0}`;
const CSS_PATH = '/static/site.v1.css'; // the version in the name makes "immutable" caching safe

export interface Entry {
  id: number;
  name: string;
  message: string;
  created: string;
}

export function openDatabase(file = ':memory:'): DatabaseSync {
  const db = new DatabaseSync(file);
  db.exec(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, message TEXT NOT NULL,
    created TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')))`);
  return db;
}

const SECURITY = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

function layout(title: string, body: SafeHtml): string {
  return render(
    html`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          <link rel="stylesheet" href="${CSS_PATH}" />
          <link rel="alternate" type="application/atom+xml" title="Guestbook" href="/feed.xml" />
        </head>
        <body>
          <main>${body}</main>
        </body>
      </html>`,
  );
}

function send(
  res: ServerResponse,
  status: number,
  body: string,
  headers: Record<string, string> = {},
): void {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache', // HTML: always revalidate
    ...SECURITY,
    ...headers,
  });
  res.end(body);
}

function cookies(req: IncomingMessage): Record<string, string> {
  return Object.fromEntries(
    (req.headers.cookie ?? '')
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]),
  );
}

async function readBody(req: IncomingMessage, limit = 10_000): Promise<string> {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > limit) throw new Error('Body too large');
  }
  return body;
}

const sameToken = (a = '', b = ''): boolean =>
  a.length === b.length && a.length > 0 && timingSafeEqual(Buffer.from(a), Buffer.from(b));

type Errors = { name?: string; message?: string };

function validate(name: string, message: string): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Enter your name';
  else if (name.length > 60) errors.name = 'Use 60 characters or fewer for your name';
  if (message.trim().length < 3) errors.message = 'Write a message of at least 3 characters';
  else if (message.length > 500) errors.message = 'Use 500 characters or fewer';
  return errors;
}

function homePage(
  db: DatabaseSync,
  page: number,
  token: string,
  values = { name: '', message: '' },
  errors: Errors = {},
): string {
  const total = Number((db.prepare('SELECT COUNT(*) AS n FROM entries').get() as { n: number }).n);
  const rows = db
    .prepare('SELECT id, name, message, created FROM entries ORDER BY id DESC LIMIT ? OFFSET ?')
    .all(PAGE_SIZE, (page - 1) * PAGE_SIZE) as unknown as Entry[];
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const keys = Object.keys(errors) as (keyof Errors)[];
  const input = (name: keyof Errors, label: string, multiline = false): SafeHtml => {
    const err = errors[name];
    const aria = err ? html` aria-invalid="true" aria-describedby="${name}-error"` : '';
    return html`<div class="field">
      <label for="${name}">${label}</label>
      ${err ? html`<p class="error" id="${name}-error">${err}</p>` : ''}
      ${multiline ? html`<textarea id="${name}" name="${name}" rows="3" ${aria}>${values[name]}</textarea>` : html`<input id="${name}" name="${name}" value="${values[name]}" ${aria} />`}
    </div>`;
  };
  return layout(
    keys.length ? 'Error: Guestbook' : `Guestbook${page > 1 ? ` (page ${page})` : ''}`,
    html`<h1>Guestbook</h1>
      ${
        keys.length
          ? html`<div class="error-summary" role="alert">
              <h2>There is a problem</h2>
              <ul>
                ${keys.map((k) => html`<li><a href="#${k}">${errors[k]}</a></li>`)}
              </ul>
            </div>`
          : ''
      }
      <form method="post" action="/sign">
        <input type="hidden" name="csrf" value="${token}" />
        ${input('name', 'Your name')} ${input('message', 'Message', true)}
        <button>Sign the guestbook</button>
      </form>
      <h2>${total} ${total === 1 ? 'entry' : 'entries'}</h2>
      ${rows.map(
        (e) =>
          html`<article>
            <h3>${e.name}</h3>
            <p>${e.message}</p>
            <time datetime="${e.created}">${e.created.slice(0, 10)}</time>
          </article>`,
      )}
      <nav aria-label="Pages">
        ${page > 1 ? html`<a href="/?page=${page - 1}" rel="prev">Newer</a> ` : ''}${page < pages ? html`<a href="/?page=${page + 1}" rel="next">Older</a>` : ''}
      </nav>`,
  );
}

function feed(db: DatabaseSync): string {
  const rows = db
    .prepare('SELECT id, name, message, created FROM entries ORDER BY id DESC LIMIT 20')
    .all() as unknown as Entry[];
  return render(
    html`<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Guestbook</title>
        <id>urn:guestbook</id>
        <updated>${rows[0]?.created ?? new Date().toISOString()}</updated>
        ${rows.map((e) => html`<entry><id>urn:guestbook:${e.id}</id><title>${e.name}</title><updated>${e.created}</updated><content type="text">${e.message}</content></entry>`)}
      </feed>`,
  );
}

export function createApp(db: DatabaseSync = openDatabase()) {
  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const jar = cookies(req);
      // One CSRF token per session, kept in an HttpOnly cookie and echoed in each form.
      let token = jar.session ?? '';
      const setCookie: Record<string, string> = {};
      if (!token) {
        token = randomBytes(16).toString('hex');
        // add `Secure` in production (HTTPS); omitted here so it works on http://localhost
        setCookie['Set-Cookie'] = `session=${token}; Path=/; HttpOnly; SameSite=Lax`;
      }

      if (req.method === 'GET' && url.pathname === CSS_PATH) {
        res.writeHead(200, {
          'Content-Type': 'text/css; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000, immutable',
        });
        return void res.end(CSS);
      }
      if (req.method === 'GET' && url.pathname === '/') {
        const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
        return send(res, 200, homePage(db, page, token), setCookie);
      }
      if (req.method === 'POST' && url.pathname === '/sign') {
        const form = Object.fromEntries(new URLSearchParams(await readBody(req)));
        if (!sameToken(form.csrf, jar.session))
          return send(
            res,
            403,
            layout(
              'Forbidden',
              html`<h1>Forbidden</h1>
                <p>Your session expired. <a href="/">Reload the guestbook</a> and try again.</p>`,
            ),
          );
        const values = { name: form.name ?? '', message: form.message ?? '' };
        const errors = validate(values.name, values.message);
        if (Object.keys(errors).length)
          return send(res, 422, homePage(db, 1, token, values, errors));
        db.prepare('INSERT INTO entries (name, message) VALUES (?, ?)').run(
          values.name.trim(),
          values.message.trim(),
        );
        res.writeHead(303, { Location: '/', ...SECURITY });
        return void res.end();
      }
      if (req.method === 'GET' && url.pathname === '/feed.xml') {
        res.writeHead(200, {
          'Content-Type': 'application/atom+xml; charset=utf-8',
          'Cache-Control': 'max-age=300',
          ...SECURITY,
        });
        return void res.end(feed(db));
      }
      if (req.method === 'GET' && url.pathname === '/slow') {
        // Streaming: the head and shell go out immediately, the slow part when it's ready.
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY });
        res.write(
          `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Streaming</title><link rel="stylesheet" href="${CSS_PATH}"></head><body><main><h1>Report</h1><p>Loading figures…</p>`,
        );
        await new Promise((resolve) => setTimeout(resolve, 800));
        return void res.end('<p>Figures: 42 visitors today.</p></main></body></html>');
      }
      if (req.method !== 'GET' && req.method !== 'POST')
        return send(res, 405, layout('Method not allowed', html`<h1>Method not allowed</h1>`), {
          Allow: 'GET, POST',
        });
      return send(
        res,
        404,
        layout(
          'Page not found',
          html`<h1>Page not found</h1>
            <p><a href="/">Back to the guestbook</a></p>`,
        ),
      );
    } catch (error) {
      console.error(error);
      return send(
        res,
        500,
        layout(
          'Something went wrong',
          html`<h1>Something went wrong</h1>
            <p>Please try again in a moment.</p>`,
        ),
      );
    }
  }
  // handle() catches its own errors, so the promise can be safely ignored here
  return createServer((req, res) => void handle(req, res));
}

if (import.meta.filename === process.argv[1]) {
  const port = Number(process.env.PORT ?? 4400);
  createApp(openDatabase(process.env.DB ?? 'guestbook.db')).listen(port, () =>
    console.info(`Guestbook on http://localhost:${port}`),
  );
}
