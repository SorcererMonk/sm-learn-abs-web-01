/**
 * The data layer's backend: streamed and buffered payloads for the Streams lab. Later Parts add
 * REST resources with ETags and preconditions, a GraphQL-shaped endpoint, likes for optimistic
 * updates and a flaky endpoint for retry policies.
 */
import type { ServerResponse } from 'node:http';
import type { Deps } from '../app.ts';
import { json } from '../core/http.ts';
import type { Router } from '../core/router.ts';

const NAMES = ['Aarav', 'Bea', 'Chidi', 'Dana', 'Emeka', 'Fatima', 'Goran', 'Hana', 'Ines', 'Jun'];

export const row = (i: number): { id: number; name: string; score: number } => ({
  id: i + 1,
  name: `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
  score: (i * 7919) % 1000,
});

/** Writes respecting back-pressure: waits for 'drain' when the socket buffer is full. */
export async function writeChunk(res: ServerResponse, chunk: string): Promise<void> {
  if (!res.write(chunk)) await new Promise<void>((resolve) => res.once('drain', resolve));
}

export function registerData(router: Router, deps: Deps): void {
  const params = (url: URL): { count: number; delay: number } => ({
    count: Math.min(50_000, Math.max(1, Number(url.searchParams.get('count') ?? 200))),
    delay: Math.min(200, Math.max(0, Number(url.searchParams.get('delay') ?? 10))),
  });

  // Newline-delimited JSON, flushed in batches as it is "produced": the client can render row 1
  // long before row N exists. Stops as soon as the client goes away.
  router.get('/api/stream/ndjson', async ({ req, res, url, log }) => {
    const { count, delay } = params(url);
    let closed = false;
    req.on('close', () => {
      closed = true;
    });
    res.writeHead(200, {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    const batch = Math.max(1, Math.ceil(count / 100));
    for (let i = 0; i < count && !closed; i += batch) {
      let chunk = '';
      for (let j = i; j < Math.min(count, i + batch); j += 1)
        chunk += `${JSON.stringify(row(j))}\n`;
      await writeChunk(res, chunk);
      if (delay) await deps.sleep(delay);
    }
    if (closed) log('info', 'stream aborted by client', { path: url.pathname });
    res.end();
  });

  // The same rows as one JSON array: nothing can be shown until the last row exists.
  router.get('/api/stream/json', async ({ res, url }) => {
    const { count, delay } = params(url);
    const batch = Math.max(1, Math.ceil(count / 100));
    await deps.sleep(Math.ceil(count / batch) * delay);
    json(
      res,
      200,
      Array.from({ length: count }, (_, i) => row(i)),
    );
  });
}
