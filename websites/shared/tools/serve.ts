/**
 * A tiny static server for a built site (dist/), used by end-to-end tests and Lighthouse:
 * directory → index.html, correct content types, 404.html with a real 404 status, long-lived
 * caching for hashed /_astro/ assets, and HTML revalidated on every request.
 *
 * Run: node shared/tools/serve.ts --site 01-foundations [--port 4330]
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

/** Maps a URL path to a file inside root, or undefined (never escapes root). */
export function resolveFile(root: string, urlPath: string): string | undefined {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const target = normalize(join(root, decoded));
  if (!target.startsWith(root)) return undefined;
  if (existsSync(target) && statSync(target).isFile()) return target;
  const index = join(target, 'index.html');
  if (existsSync(index)) return index;
  return undefined;
}

export function serve(root: string, port: number): Server {
  const base = resolve(root);
  return createServer((req, res) => {
    const file = resolveFile(base, req.url ?? '/');
    const notFound = join(base, '404.html');
    const path = file ?? (existsSync(notFound) ? notFound : undefined);
    if (!path) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const type = TYPES[extname(path)] ?? 'application/octet-stream';
    const immutable = (req.url ?? '').startsWith('/_astro/');
    res.writeHead(file ? 200 : 404, {
      'Content-Type': type,
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    createReadStream(path).pipe(res);
  }).listen(port);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const site = args[args.indexOf('--site') + 1] ?? '';
  const port = Number(args.includes('--port') ? args[args.indexOf('--port') + 1] : 4330);
  const root = resolve(fileURLToPath(new URL('../..', import.meta.url)), site, 'dist');
  serve(root, port).on('listening', () =>
    console.info(`Serving ${root} on http://localhost:${port}`),
  );
}
