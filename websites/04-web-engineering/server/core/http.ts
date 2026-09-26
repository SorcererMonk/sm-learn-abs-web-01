/**
 * The HTTP plumbing every route uses: cookies, bodies with size limits, conditional requests,
 * content negotiation and range requests. Pure functions over headers where possible, so each
 * rule is unit-tested without a socket.
 */
import { createHash } from 'node:crypto';
import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'node:http';

/** An error that becomes an HTTP response: the status, a message and optional headers. */
export class HttpError extends Error {
  readonly status: number;
  readonly headers: Record<string, string>;
  constructor(status: number, message: string, headers: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.headers = headers;
  }
}

export const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  206: 'Partial Content',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  412: 'Precondition Failed',
  413: 'Content Too Large',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  422: 'Unprocessable Content',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

// ---------------------------------------------------------------- cookies

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const eq = part.indexOf('=');
    if (eq < 1) continue;
    const name = part.slice(0, eq).trim();
    const raw = part
      .slice(eq + 1)
      .trim()
      .replace(/^"(.*)"$/, '$1');
    if (!(name in out)) {
      try {
        out[name] = decodeURIComponent(raw);
      } catch {
        out[name] = raw;
      }
    }
  }
  return out;
}

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  partitioned?: boolean;
}

/** Serialises a Set-Cookie value and enforces the rules browsers enforce (prefixes, SameSite=None). */
export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  if (!/^[\w!#$%&'*+.^`|~-]+$/.test(name)) throw new Error(`Invalid cookie name: ${name}`);
  if (name.startsWith('__Secure-') && !options.secure)
    throw new Error('__Secure- cookies must be Secure');
  if (name.startsWith('__Host-') && (!options.secure || options.domain || options.path !== '/'))
    throw new Error('__Host- cookies must be Secure, Path=/ and have no Domain');
  if (options.sameSite === 'None' && !options.secure)
    throw new Error('SameSite=None cookies must be Secure');
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  parts.push(`Path=${options.path ?? '/'}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.partitioned) parts.push('Partitioned');
  return parts.join('; ');
}

/** Adds a Set-Cookie header without dropping earlier ones. */
export function appendSetCookie(res: ServerResponse, cookie: string): void {
  const existing = res.getHeader('Set-Cookie');
  const list = Array.isArray(existing) ? existing : existing ? [String(existing)] : [];
  res.setHeader('Set-Cookie', [...list, cookie]);
}

// ---------------------------------------------------------------- bodies

/** Reads a request body, failing with 413 as soon as it grows past the limit. */
export async function readBody(req: IncomingMessage, limit = 1_000_000): Promise<Buffer> {
  const declared = Number(req.headers['content-length'] ?? 0);
  if (declared > limit) throw new HttpError(413, `Body larger than ${limit} bytes`);
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, `Body larger than ${limit} bytes`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export const mediaType = (headers: IncomingHttpHeaders): string =>
  (headers['content-type'] ?? '').split(';')[0]?.trim().toLowerCase() ?? '';

export async function readJson<T = unknown>(req: IncomingMessage, limit = 100_000): Promise<T> {
  const type = mediaType(req.headers);
  if (type !== 'application/json' && !type.endsWith('+json'))
    throw new HttpError(415, 'Send Content-Type: application/json');
  const body = await readBody(req, limit);
  try {
    return JSON.parse(body.toString('utf8')) as T;
  } catch {
    throw new HttpError(400, 'Body is not valid JSON');
  }
}

export async function readForm(req: IncomingMessage, limit = 100_000): Promise<URLSearchParams> {
  if (mediaType(req.headers) !== 'application/x-www-form-urlencoded')
    throw new HttpError(415, 'Send Content-Type: application/x-www-form-urlencoded');
  return new URLSearchParams((await readBody(req, limit)).toString('utf8'));
}

// ---------------------------------------------------------------- responses

export function send(
  res: ServerResponse,
  status: number,
  body: string | Buffer,
  headers: Record<string, string | number> = {},
): void {
  const buf = typeof body === 'string' ? Buffer.from(body) : body;
  res.writeHead(status, { 'Content-Length': buf.length, ...headers });
  res.end(res.req.method === 'HEAD' ? undefined : buf);
}

export function json(
  res: ServerResponse,
  status: number,
  data: unknown,
  headers: Record<string, string | number> = {},
): void {
  send(res, status, JSON.stringify(data, null, 2), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
}

export function html(
  res: ServerResponse,
  status: number,
  markup: string,
  headers: Record<string, string | number> = {},
): void {
  send(res, status, markup, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
}

export function redirect(
  res: ServerResponse,
  status: 301 | 302 | 303 | 307 | 308,
  to: string,
): void {
  send(res, status, `Redirecting to ${to}`, {
    Location: to,
    'Content-Type': 'text/plain; charset=utf-8',
  });
}

// ---------------------------------------------------------------- caching

/** A strong validator: a hash of the exact bytes of one representation. */
export function etagFor(body: string | Buffer, suffix = ''): string {
  const hash = createHash('sha1').update(body).digest('base64url').slice(0, 20);
  return `"${hash}${suffix ? `-${suffix}` : ''}"`;
}

const stripWeak = (tag: string): string => tag.trim().replace(/^W\//, '');

/**
 * RFC 9110 §13.1: If-None-Match wins over If-Modified-Since. Weak comparison is right for
 * GET/HEAD revalidation, so W/"x" matches "x".
 */
export function isNotModified(
  headers: IncomingHttpHeaders,
  etag: string | undefined,
  lastModified?: Date,
): boolean {
  const inm = headers['if-none-match'];
  if (inm !== undefined) {
    if (!etag) return false;
    if (inm.trim() === '*') return true;
    return inm.split(',').some((tag) => stripWeak(tag) === stripWeak(etag));
  }
  const ims = headers['if-modified-since'];
  if (ims && lastModified) {
    const since = Date.parse(ims);
    return !Number.isNaN(since) && Math.floor(lastModified.getTime() / 1000) * 1000 <= since;
  }
  return false;
}

/** If-Match for optimistic concurrency: strong comparison, "*" means "any current version". */
export function matchesIfMatch(headers: IncomingHttpHeaders, etag: string): boolean {
  const im = headers['if-match'];
  if (im === undefined) return true;
  if (im.trim() === '*') return true;
  return im.split(',').some((tag) => tag.trim() === etag && !tag.trim().startsWith('W/'));
}

// ---------------------------------------------------------------- negotiation

export type Encoding = 'br' | 'zstd' | 'gzip' | 'identity';

/** Picks a content-coding from Accept-Encoding, honouring q-values; ties go to the server's order. */
export function negotiateEncoding(
  accept: string | undefined,
  available: Encoding[] = ['br', 'zstd', 'gzip'],
): Encoding {
  const prefs = new Map<string, number>();
  for (const part of (accept ?? '').split(',')) {
    const [token = '', ...params] = part.trim().toLowerCase().split(';');
    if (!token) continue;
    const q = params.map((p) => /^\s*q=([\d.]+)/.exec(p)?.[1]).find(Boolean);
    prefs.set(token, q === undefined ? 1 : Number(q));
  }
  const weight = (enc: string): number => prefs.get(enc) ?? prefs.get('*') ?? 0;
  let best: Encoding = 'identity';
  let bestQ = 0;
  for (const enc of available) {
    const q = weight(enc);
    if (q > bestQ) {
      best = enc;
      bestQ = q;
    }
  }
  return best;
}

/** Negotiates a language from Accept-Language against the supported list (basic filtering). */
export function negotiateLanguage(accept: string | undefined, supported: string[]): string {
  const ranges = (accept ?? '')
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.map((p) => /^\s*q=([\d.]+)/.exec(p)?.[1]).find(Boolean);
      return { tag: tag.toLowerCase(), q: q === undefined ? 1 : Number(q), index };
    })
    .filter((r) => r.tag && r.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { tag } of ranges) {
    const exact = supported.find((s) => s.toLowerCase() === tag);
    if (exact) return exact;
    const prefix = supported.find((s) => s.toLowerCase().split('-')[0] === tag.split('-')[0]);
    if (prefix) return prefix;
  }
  return supported[0] ?? 'en';
}

// ---------------------------------------------------------------- ranges

export type RangeResult = { start: number; end: number } | 'unsatisfiable' | undefined;

/** A single byte range (bytes=a-b, bytes=a-, bytes=-n). Multiple ranges are ignored (full body). */
export function parseRange(header: string | undefined, size: number): RangeResult {
  if (!header) return undefined;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return undefined;
  const [, a = '', b = ''] = match;
  if (a === '' && b === '') return undefined;
  let start: number;
  let end: number;
  if (a === '') {
    const suffix = Number(b);
    if (suffix === 0) return 'unsatisfiable';
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(a);
    end = b === '' ? size - 1 : Math.min(Number(b), size - 1);
  }
  if (start >= size || start > end) return 'unsatisfiable';
  return { start, end };
}
