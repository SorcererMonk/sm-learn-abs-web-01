/**
 * The PWA lab's backend: an app shell, a service worker stamped with the current release, a
 * manifest, a notes API that accepts replays idempotently (by note ID), and two switches the
 * lesson flips: "deploy a new version" and "server outage" (sockets are destroyed, so the browser
 * sees a genuine network error, not a friendly 503).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Deps } from '../app.ts';
import { HttpError, html, json, readJson, send } from '../core/http.ts';
import type { Handler, Router } from '../core/router.ts';
import { labPage } from '../labs/layout.ts';

interface Note {
  id: string;
  text: string;
  at: number;
}

const dir = join(import.meta.dirname, '..', 'labs', 'pwa');
const SW_SOURCE = readFileSync(join(dir, 'sw.js'), 'utf8');
const APP_SOURCE = readFileSync(join(dir, 'app.js'), 'utf8');

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#0e7490"/><path d="M150 140h170l60 60v172H150z" fill="#ecfeff"/><path d="M190 240h140M190 290h140M190 340h90" stroke="#0e7490" stroke-width="22" stroke-linecap="round"/></svg>`;

export function registerPwa(router: Router, deps: Deps): void {
  const state = { version: 1, outage: false, notes: [] as Note[] };

  /** During a simulated outage, drop the connection: exactly what a dead server looks like. */
  const reachable =
    (handler: Handler): Handler =>
    (ctx) => {
      if (state.outage) {
        ctx.log('warn', 'simulated outage: connection dropped', { path: ctx.url.pathname });
        ctx.req.socket.destroy();
        return;
      }
      return handler(ctx);
    };

  router.get(
    '/lab/pwa/',
    reachable(({ res }) => {
      html(
        res,
        200,
        labPage({
          title: 'Notes (PWA lab)',
          head: `<link rel="manifest" href="/lab/pwa/manifest.webmanifest"><meta name="theme-color" content="#0e7490"><link rel="icon" href="/lab/pwa/icon.svg">`,
          body: `<p class="kicker">PWA lab · app shell v${state.version}</p>
<h1>Notes</h1>
<p id="sw" class="muted">Starting…</p>
<div id="update" class="card" role="status" hidden><strong>A new version is available.</strong> <button id="reload" type="button">Reload to update</button></div>
<form id="add" class="card"><label for="text">New note</label><br><input id="text" autocomplete="off" required> <button>Add</button> <span id="outbox" class="muted"></span></form>
<ul id="notes"></ul>
<p><button id="check" type="button" class="ghost">Check for updates</button></p>
<h2>What the worker did</h2>
<ol id="log" class="muted" reversed></ol>
<script type="module" src="/lab/pwa/app.js"></script>`,
        }),
        { 'Cache-Control': 'no-cache' },
      );
    }),
  );

  router.get(
    '/lab/pwa/offline',
    reachable(({ res }) => {
      html(
        res,
        200,
        labPage({
          title: 'Offline (PWA lab)',
          body: `<p class="kicker">PWA lab · offline fallback</p><h1>You're offline</h1><p>This page came from the service worker's cache. Notes you write are kept in an outbox and sent when the connection returns.</p><p><a href="/lab/pwa/">Try the app again</a></p>`,
        }),
        { 'Cache-Control': 'no-cache' },
      );
    }),
  );

  router.get(
    '/lab/pwa/sw.js',
    reachable(({ res }) => {
      // no-cache: the browser must revalidate the worker script to discover a new version.
      send(res, 200, SW_SOURCE.replace('__VERSION__', `v${state.version}`), {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
    }),
  );

  router.get(
    '/lab/pwa/app.js',
    reachable(({ res }) => {
      send(res, 200, APP_SOURCE, {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
    }),
  );

  router.get(
    '/lab/pwa/icon.svg',
    reachable(({ res }) => {
      send(res, 200, ICON, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
    }),
  );

  router.get(
    '/lab/pwa/manifest.webmanifest',
    reachable(({ res }) => {
      json(
        res,
        200,
        {
          name: 'Notes (PWA lab)',
          short_name: 'Notes',
          id: '/lab/pwa/',
          start_url: '/lab/pwa/',
          scope: '/lab/pwa/',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone'],
          background_color: '#fbf9f7',
          theme_color: '#0e7490',
          icons: [
            {
              src: '/lab/pwa/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
          shortcuts: [{ name: 'New note', url: '/lab/pwa/?new=1' }],
        },
        { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'no-cache' },
      );
    }),
  );

  router.get(
    '/lab/pwa/api/notes',
    reachable(({ res }) => {
      json(res, 200, { notes: [...state.notes].reverse(), version: state.version });
    }),
  );

  router.post(
    '/lab/pwa/api/notes',
    reachable(async ({ req, res, log }) => {
      const note = await readJson<Partial<Note>>(req, 5_000);
      if (typeof note.id !== 'string' || typeof note.text !== 'string' || !note.text.trim())
        throw new HttpError(422, 'A note needs an id and text');
      // Replays from the outbox carry the same ID: accept them without duplicating.
      if (!state.notes.some((n) => n.id === note.id)) {
        state.notes.push({
          id: note.id,
          text: note.text.slice(0, 200),
          at: Number(note.at) || deps.now(),
        });
        log('info', 'note stored', { id: note.id });
      } else log('info', 'duplicate note ignored (idempotent replay)', { id: note.id });
      json(res, 201, { ok: true });
    }),
  );

  router.get('/api/pwa/state', ({ res }) => {
    json(res, 200, { version: state.version, outage: state.outage, notes: state.notes.length });
  });

  router.post('/api/pwa/deploy', ({ res, log }) => {
    state.version += 1;
    log('info', 'pwa lab deployed', { version: state.version });
    json(res, 200, { version: state.version });
  });

  router.post('/api/pwa/outage', ({ res, url }) => {
    state.outage = url.searchParams.get('on') === '1';
    json(res, 200, { outage: state.outage });
  });

  router.post('/api/pwa/reset', ({ res }) => {
    state.notes = [];
    state.outage = false;
    json(res, 200, { ok: true, version: state.version });
  });
}
