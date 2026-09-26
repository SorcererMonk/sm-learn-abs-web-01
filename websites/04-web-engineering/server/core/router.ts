/**
 * A 60-line router: method + path pattern → handler. `:name` captures one segment and a trailing
 * `*` captures the rest. A path that matches with the wrong method yields the Allow list, so the
 * app can answer 405 instead of 404 (RFC 9110 §15.5.6).
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Logger } from './log.ts';
import type { Timing } from './timing.ts';

export interface Ctx {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  params: Record<string, string>;
  cookies: Record<string, string>;
  requestId: string;
  timing: Timing;
  log: Logger['bound'];
}

export type Handler = (ctx: Ctx) => void | Promise<void>;

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

export type Match =
  | { kind: 'found'; handler: Handler; params: Record<string, string> }
  | { kind: 'method'; allow: string[] }
  | { kind: 'none' };

export function compile(path: string): { pattern: RegExp; keys: string[] } {
  const keys: string[] = [];
  const source = path
    .split('/')
    .map((segment) => {
      if (segment === '*') {
        keys.push('rest');
        return '(.*)';
      }
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { pattern: new RegExp(`^${source}$`), keys };
}

export class Router {
  private readonly routes: Route[] = [];

  on(methods: string | string[], path: string, handler: Handler): this {
    const { pattern, keys } = compile(path);
    for (const method of [methods].flat()) this.routes.push({ method, pattern, keys, handler });
    return this;
  }

  get(path: string, handler: Handler): this {
    return this.on(['GET', 'HEAD'], path, handler);
  }

  post(path: string, handler: Handler): this {
    return this.on('POST', path, handler);
  }

  put(path: string, handler: Handler): this {
    return this.on('PUT', path, handler);
  }

  patch(path: string, handler: Handler): this {
    return this.on('PATCH', path, handler);
  }

  delete(path: string, handler: Handler): this {
    return this.on('DELETE', path, handler);
  }

  match(method: string, pathname: string): Match {
    const allow = new Set<string>();
    for (const route of this.routes) {
      const m = route.pattern.exec(pathname);
      if (!m) continue;
      if (route.method !== method) {
        allow.add(route.method);
        continue;
      }
      const params: Record<string, string> = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(m[i + 1] ?? '');
      });
      return { kind: 'found', handler: route.handler, params };
    }
    return allow.size ? { kind: 'method', allow: [...allow] } : { kind: 'none' };
  }
}
