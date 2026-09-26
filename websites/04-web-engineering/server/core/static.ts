/**
 * Static files from dist/: the build's output, served the way a CDN would.
 * - Hashed assets under /_astro/ are `immutable` for a year; HTML is `no-cache` (always revalidate).
 * - Every representation has a strong ETag, so revalidation costs a 304 and no body.
 * - Text is compressed once per encoding (Brotli, zstd or gzip, negotiated) and kept in memory.
 * - Range requests work for any file, and HEAD sends headers only.
 */
import { brotliCompressSync, constants, gzipSync, zstdCompressSync } from 'node:zlib';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { etagFor, isNotModified, negotiateEncoding, parseRange, type Encoding } from './http.ts';

export const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest\+json|javascript)|image\/svg)/;

export function compress(body: Buffer, encoding: Encoding): Buffer {
  switch (encoding) {
    case 'br':
      return brotliCompressSync(body, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 11,
          [constants.BROTLI_PARAM_SIZE_HINT]: body.length,
        },
      });
    case 'zstd':
      return zstdCompressSync(body, { params: { [constants.ZSTD_c_compressionLevel]: 19 } });
    case 'gzip':
      return gzipSync(body, { level: 9 });
    default:
      return body;
  }
}

/** Maps a URL path to a file inside root (never outside it): directories serve index.html. */
export function resolveFile(root: string, pathname: string): string | undefined {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  if (decoded.includes('\0')) return undefined;
  const target = normalize(join(root, decoded));
  if (target !== root && !target.startsWith(root + sep)) return undefined;
  if (existsSync(target) && statSync(target).isFile()) return target;
  const index = join(target, 'index.html');
  return existsSync(index) ? index : undefined;
}

export function cacheControlFor(pathname: string): string {
  if (pathname.startsWith('/_astro/')) return 'public, max-age=31536000, immutable';
  if (/\.(svg|png|webp|avif|woff2)$/.test(pathname)) return 'public, max-age=86400';
  return 'no-cache';
}

interface Variant {
  body: Buffer;
  etag: string;
}

export interface StaticFiles {
  /** Serves the file for this request; false when nothing matches (the caller decides the 404). */
  serve(req: IncomingMessage, res: ServerResponse, pathname: string, status?: number): boolean;
  /** Every HTML page in the build, as URL paths (used for the sitemap). */
  pages(): string[];
  /** The raw bytes of a built file, if it exists. */
  read(pathname: string): Buffer | undefined;
  /** URL path of the first hashed build asset whose name matches (e.g. the site's web font). */
  find(pattern: RegExp): string | undefined;
}

export function createStatic(root: string): StaticFiles {
  const variants = new Map<string, Variant>();
  const variant = (file: string, encoding: Encoding): Variant => {
    const mtime = statSync(file).mtimeMs;
    const key = `${file}:${encoding}:${mtime}`;
    const cached = variants.get(key);
    if (cached) return cached;
    const body = compress(readFileSync(file), encoding);
    const made = { body, etag: etagFor(body, encoding === 'identity' ? '' : encoding) };
    variants.set(key, made);
    return made;
  };

  return {
    serve(req, res, pathname, status = 200) {
      const file = resolveFile(root, pathname);
      if (!file) return false;
      const type = TYPES[extname(file)] ?? 'application/octet-stream';
      const raw = readFileSync(file);
      const wantsRange = req.headers.range !== undefined && status === 200;
      const encoding =
        COMPRESSIBLE.test(type) && raw.length > 1024 && !wantsRange
          ? negotiateEncoding(req.headers['accept-encoding'])
          : 'identity';
      const { body, etag } = variant(file, encoding);
      const lastModified = statSync(file).mtime;
      const headers: Record<string, string | number> = {
        'Content-Type': type,
        'Cache-Control': cacheControlFor(pathname),
        ETag: etag,
        'Last-Modified': lastModified.toUTCString(),
        'Accept-Ranges': 'bytes',
        Vary: 'Accept-Encoding',
      };
      if (encoding !== 'identity') headers['Content-Encoding'] = encoding;

      if (status === 200 && isNotModified(req.headers, etag, lastModified)) {
        res.writeHead(304, headers);
        res.end();
        return true;
      }
      const range = wantsRange ? parseRange(req.headers.range, body.length) : undefined;
      if (range === 'unsatisfiable') {
        res.writeHead(416, { 'Content-Range': `bytes */${body.length}` });
        res.end();
        return true;
      }
      if (range) {
        const slice = body.subarray(range.start, range.end + 1);
        res.writeHead(206, {
          ...headers,
          'Content-Range': `bytes ${range.start}-${range.end}/${body.length}`,
          'Content-Length': slice.length,
        });
        res.end(req.method === 'HEAD' ? undefined : slice);
        return true;
      }
      res.writeHead(status, { ...headers, 'Content-Length': body.length });
      res.end(req.method === 'HEAD' ? undefined : body);
      return true;
    },

    pages() {
      const out: string[] = [];
      const walk = (dir: string, prefix: string): void => {
        if (!existsSync(dir)) return;
        for (const name of readdirSync(dir)) {
          const full = join(dir, name);
          if (statSync(full).isDirectory()) walk(full, `${prefix}${name}/`);
          else if (name === 'index.html') out.push(prefix);
        }
      };
      walk(root, '/');
      return out.sort();
    },

    read(pathname) {
      const file = resolveFile(root, pathname);
      return file ? readFileSync(file) : undefined;
    },

    find(pattern) {
      const dir = join(root, '_astro');
      if (!existsSync(dir)) return undefined;
      const name = readdirSync(dir)
        .sort()
        .find((file) => pattern.test(file));
      return name ? `/_astro/${name}` : undefined;
    },
  };
}
