/**
 * The application: one request handler composed from small, explicit steps.
 *
 *   request ID → security headers → Server-Timing → route (API, labs) → static files → 404
 *
 * Every response carries X-Request-Id and Server-Timing; every request is logged as one JSON
 * line on finish; errors become typed responses (HttpError) or a 500 that names the request ID.
 */
import { randomBytes, randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import { HttpError, STATUS_TEXT, html, json, parseCookies, send } from './core/http.ts';
import { createLogger, requestIdFrom, type Logger } from './core/log.ts';
import { Router, type Ctx } from './core/router.ts';
import { securityHeaders } from './core/security-headers.ts';
import { createStatic, type StaticFiles } from './core/static.ts';
import { Timing } from './core/timing.ts';
import { registerArchitectureLabs } from './features/labs-architecture.ts';
import { registerBrowserLabs } from './features/labs-browser.ts';
import { registerAuth } from './features/auth.ts';
import { registerData } from './features/data.ts';
import { registerForms } from './features/forms.ts';
import { registerPlatform } from './features/platform.ts';
import { registerPwa } from './features/pwa.ts';
import { registerRealtime } from './features/realtime.ts';
import { registerUploads } from './features/uploads.ts';

export interface Deps {
  logger: Logger;
  files: StaticFiles;
  /** Key for HMAC signatures (sessions, webhooks, CSRF). Random per process unless configured. */
  secret: Buffer;
  release: string;
  now: () => number;
  sleep: (ms: number, signal?: AbortSignal) => Promise<void>;
  /** Registers cleanup for open streams, sockets and timers (graceful shutdown). */
  onClose: (fn: () => void) => void;
  /** WebSocket upgrade handlers keyed by path. */
  upgrades: Map<string, (req: IncomingMessage, socket: Duplex, head: Buffer) => void>;
}

export interface AppOptions {
  root: string;
  release?: string;
  secret?: string;
  logSink?: (line: string) => void;
  now?: () => number;
  /** Trust X-Forwarded-Proto (only behind a proxy you control). */
  trustProxy?: boolean;
}

export interface App {
  handle: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
  upgrade: (req: IncomingMessage, socket: Duplex, head: Buffer) => void;
  deps: Deps;
  close: () => void;
}

export function createApp(options: AppOptions): App {
  const cleanups: (() => void)[] = [];
  const deps: Deps = {
    logger: createLogger({ sink: options.logSink }),
    files: createStatic(options.root),
    secret: options.secret ? Buffer.from(options.secret) : randomBytes(32),
    release: options.release ?? 'dev',
    now: options.now ?? Date.now,
    sleep: async (ms, signal) => {
      await delay(ms, undefined, { signal });
    },
    onClose: (fn) => cleanups.push(fn),
    upgrades: new Map(),
  };
  const router = new Router();
  registerPlatform(router, deps);
  registerBrowserLabs(router, deps);
  registerArchitectureLabs(router, deps);
  registerForms(router, deps);
  registerData(router, deps);
  registerPwa(router, deps);
  registerRealtime(router, deps);
  registerAuth(router, deps);
  registerUploads(router, deps);

  const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const started = performance.now();
    const requestId = requestIdFrom(req.headers['x-request-id'], randomUUID);
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const https =
      ('encrypted' in req.socket && Boolean(req.socket.encrypted)) ||
      (options.trustProxy === true && req.headers['x-forwarded-proto'] === 'https');
    const timing = new Timing();
    for (const [name, value] of Object.entries(securityHeaders({ https })))
      res.setHeader(name, value);
    res.setHeader('X-Request-Id', requestId);

    // Server-Timing has to be decided when the headers go out, whichever code path sends them.
    const writeHead = res.writeHead.bind(res) as (...args: unknown[]) => ServerResponse;
    (res as { writeHead: unknown }).writeHead = (...args: unknown[]): ServerResponse => {
      timing.add('total', performance.now() - started);
      if (!res.hasHeader('Server-Timing')) res.setHeader('Server-Timing', timing.header());
      return writeHead(...args);
    };

    res.on('finish', () => {
      const isAsset = url.pathname.startsWith('/_astro/');
      deps.logger.write(isAsset ? 'debug' : 'info', 'request', {
        requestId,
        method: req.method,
        path: url.pathname,
        status: res.statusCode,
        ms: Math.round((performance.now() - started) * 10) / 10,
      });
    });

    const ctx: Ctx = {
      req,
      res,
      url,
      params: {},
      cookies: parseCookies(req.headers.cookie),
      requestId,
      timing,
      log: deps.logger.forRequest(requestId),
    };
    const method = req.method ?? 'GET';
    try {
      const match = router.match(method, url.pathname);
      if (match.kind === 'found') {
        ctx.params = match.params;
        await timing.measure('app', () => match.handler(ctx));
        return;
      }
      if (match.kind === 'method') {
        if (method === 'OPTIONS') {
          send(res, 204, '', { Allow: match.allow.join(', ') });
          return;
        }
        throw new HttpError(405, `${method} is not allowed here`, {
          Allow: match.allow.join(', '),
        });
      }
      if (method === 'GET' || method === 'HEAD') {
        timing.start('static', 'read + compress');
        if (deps.files.serve(req, res, url.pathname)) return;
      }
      throw new HttpError(404, `Nothing at ${url.pathname}`);
    } catch (error) {
      respondWithError(ctx, error);
    }
  };

  const respondWithError = (ctx: Ctx, error: unknown): void => {
    const { req, res, url, requestId } = ctx;
    if (res.headersSent) {
      ctx.log('error', 'error after headers were sent', { error: String(error) });
      res.destroy();
      return;
    }
    const known = error instanceof HttpError;
    const status = known ? error.status : 500;
    const message = known ? error.message : 'Something went wrong on our side';
    if (!known)
      ctx.log('error', 'unhandled error', {
        error: error instanceof Error ? (error.stack ?? error.message) : String(error),
      });
    const headers = known ? error.headers : {};
    const wantsHtml =
      !url.pathname.startsWith('/api/') && (req.headers.accept ?? '').includes('text/html');
    if (status === 404 && wantsHtml && deps.files.serve(req, res, '/404.html', 404)) return;
    if (wantsHtml) {
      html(
        res,
        status,
        `<!doctype html><html lang="en"><meta charset="utf-8"><title>${status} ${STATUS_TEXT[status] ?? ''}</title><main><h1>${status} ${STATUS_TEXT[status] ?? ''}</h1><p>${escapeText(message)}</p><p>Request ID: <code>${requestId}</code></p></main></html>`,
        headers,
      );
      return;
    }
    json(res, status, { error: message, status, requestId }, headers);
  };

  return {
    handle,
    deps,
    upgrade(req, socket, head) {
      const path = new URL(req.url ?? '/', 'http://x').pathname;
      const handler = deps.upgrades.get(path);
      if (handler) handler(req, socket, head);
      else socket.destroy();
    },
    close() {
      cleanups.splice(0).forEach((fn) => {
        fn();
      });
    },
  };
}

const escapeText = (text: string): string =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
