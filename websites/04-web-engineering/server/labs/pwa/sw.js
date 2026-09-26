/*
 * The PWA lab's service worker. The server stamps VERSION into this file on every request, so a
 * "deploy" changes its bytes: the browser installs the new worker next to the old one, and it
 * waits until the page asks it to take over (the update prompt).
 */
const VERSION = '__VERSION__';
const SHELL = `pwa-shell-${VERSION}`;
const DATA = 'pwa-data';
const PRECACHE = [
  '/lab/pwa/',
  '/lab/pwa/app.js',
  '/lab/pwa/offline',
  '/lab/pwa/icon.svg',
  '/lab/pwa/manifest.webmanifest',
];

const tell = async (message) => {
  const all = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of all) client.postMessage({ ...message, version: VERSION });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => tell({ type: 'installed' })),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      const old = names.filter((name) => name.startsWith('pwa-shell-') && name !== SHELL);
      await Promise.all(old.map((name) => caches.delete(name)));
      await self.clients.claim();
      await tell({ type: 'activated', removed: old });
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') void self.skipWaiting();
});

/** Pages: the network when it answers, else the cached shell or the offline page. */
async function networkFirst(request) {
  try {
    return { response: await fetch(request), source: 'network' };
  } catch {
    const cache = await caches.open(SHELL);
    const cached =
      (await cache.match(request, { ignoreSearch: true })) ??
      (await cache.match('/lab/pwa/offline'));
    return { response: cached, source: 'cache (network failed)' };
  }
}

/** Data: answer from cache instantly, refresh the cache in the background. */
async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(DATA);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(refresh);
    return { response: cached, source: 'cache, revalidating in the background' };
  }
  const response = await refresh;
  if (response) return { response, source: 'network' };
  return {
    response: Response.json({ notes: [], offline: true }, { status: 503 }),
    source: 'nothing cached and the network failed',
  };
}

/** Versioned static files: the cache wins; they only change with a new VERSION. */
async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return { response: cached, source: 'cache' };
  return { response: await fetch(request), source: 'network' };
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !url.pathname.startsWith('/lab/pwa/')) return;
  const strategy =
    request.mode === 'navigate'
      ? 'network-first'
      : url.pathname.startsWith('/lab/pwa/api/')
        ? 'stale-while-revalidate'
        : 'cache-first';
  event.respondWith(
    (async () => {
      const { response, source } =
        strategy === 'network-first'
          ? await networkFirst(request)
          : strategy === 'stale-while-revalidate'
            ? await staleWhileRevalidate(request, event)
            : await cacheFirst(request);
      event.waitUntil(tell({ type: 'fetch', path: url.pathname, strategy, source }));
      return response ?? Response.error();
    })(),
  );
});
