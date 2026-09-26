/**
 * The data layer's backend:
 * - the same blog data as REST resources (cacheable, ETags), a GraphQL-shaped endpoint and RPC;
 * - todos with ETags and If-Match preconditions (optimistic concurrency) for the query-cache lab;
 * - likes with injectable latency and failure, for optimistic updates;
 * - a flaky endpoint for retry policies, and streamed versus buffered payloads.
 */
import type { ServerResponse } from 'node:http';
import type { Deps } from '../app.ts';
import {
  HttpError,
  etagFor,
  isNotModified,
  json,
  matchesIfMatch,
  readJson,
  send,
} from '../core/http.ts';
import { execute, parse, type Schema } from '../core/mini-graphql.ts';
import type { Ctx, Router } from '../core/router.ts';

export const USERS = [
  { id: 1, name: 'Asha Rao', bio: 'Writes about the platform.' },
  { id: 2, name: 'Tomás Silva', bio: 'Performance nerd.' },
  { id: 3, name: 'Mei Lin', bio: 'Accessibility specialist.' },
];
export const POSTS = [
  {
    id: 1,
    title: 'Ship less JavaScript',
    body: 'Every kilobyte is main-thread time on a phone.',
    authorId: 1,
  },
  {
    id: 2,
    title: 'Cache headers, explained',
    body: 'no-cache means revalidate, not do not cache.',
    authorId: 2,
  },
];
export const COMMENTS = [
  { id: 1, postId: 1, authorId: 2, body: 'Measured it: 40% faster INP.' },
  { id: 2, postId: 1, authorId: 3, body: 'And fewer focus bugs.' },
  { id: 3, postId: 2, authorId: 1, body: 'The immutable directive is underrated.' },
];

const typed = <T extends object>(typename: string, value: T): T & { __typename: string } => ({
  __typename: typename,
  ...value,
});

export const BLOG_SCHEMA: Schema = {
  Query: {
    post: ({ id }) => {
      const post = POSTS.find((p) => p.id === Number(id));
      return post ? typed('Post', post) : null;
    },
    posts: () => POSTS.map((p) => typed('Post', p)),
    user: ({ id }) => {
      const user = USERS.find((u) => u.id === Number(id));
      return user ? typed('User', user) : null;
    },
  },
  Post: {
    author: (_, parent) =>
      typed('User', USERS.find((u) => u.id === (parent as { authorId: number }).authorId) ?? {}),
    comments: (_, parent) =>
      COMMENTS.filter((c) => c.postId === (parent as { id: number }).id).map((c) =>
        typed('Comment', c),
      ),
  },
  Comment: {
    author: (_, parent) =>
      typed('User', USERS.find((u) => u.id === (parent as { authorId: number }).authorId) ?? {}),
  },
};

/** JSON with a strong ETag; answers 304 when the client already has this exact representation. */
export function sendCacheable(ctx: Ctx, data: unknown, cacheControl: string): void {
  const body = JSON.stringify(data, null, 2);
  const etag = etagFor(body);
  const headers = { ETag: etag, 'Cache-Control': cacheControl, Vary: 'Accept-Encoding' };
  if (isNotModified(ctx.req.headers, etag)) {
    ctx.res.writeHead(304, headers);
    ctx.res.end();
    return;
  }
  send(ctx.res, 200, body, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
}

interface Todo {
  id: number;
  title: string;
  done: boolean;
  version: number;
}
const todoEtag = (todo: Todo): string => `"todo-${todo.id}-v${todo.version}"`;

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
  // ---- REST: resources with URLs, HTTP caching and validators
  router.get('/api/rest/posts/:id', (ctx) => {
    const post = POSTS.find((p) => p.id === Number(ctx.params.id));
    if (!post) throw new HttpError(404, 'No such post');
    sendCacheable(
      ctx,
      {
        ...post,
        links: {
          author: `/api/rest/users/${post.authorId}`,
          comments: `/api/rest/posts/${post.id}/comments`,
        },
      },
      'public, max-age=60',
    );
  });
  router.get('/api/rest/posts/:id/comments', (ctx) => {
    sendCacheable(
      ctx,
      COMMENTS.filter((c) => c.postId === Number(ctx.params.id)),
      'public, max-age=60',
    );
  });
  router.get('/api/rest/users/:id', (ctx) => {
    const user = USERS.find((u) => u.id === Number(ctx.params.id));
    if (!user) throw new HttpError(404, 'No such user');
    sendCacheable(ctx, user, 'public, max-age=300');
  });

  // ---- GraphQL-shaped: one POST, exactly the fields asked for, not HTTP-cacheable by default
  const graphql = (ctx: Ctx, query: string): void => {
    const counters = { resolverCalls: 0 };
    try {
      const data = execute(parse(query), BLOG_SCHEMA, counters);
      json(ctx.res, 200, { data }, { 'X-Resolver-Calls': String(counters.resolverCalls) });
    } catch (error) {
      json(ctx.res, 400, {
        errors: [{ message: error instanceof Error ? error.message : String(error) }],
      });
    }
  };
  router.post('/api/graphql', async (ctx) => {
    const { query } = await readJson<{ query?: string }>(ctx.req, 10_000);
    graphql(ctx, String(query ?? ''));
  });
  router.get('/api/graphql', (ctx) => {
    graphql(ctx, ctx.url.searchParams.get('query') ?? '');
  });

  // ---- RPC: named procedures with typed arguments
  const procedures: Record<string, (args: Record<string, unknown>) => unknown> = {
    getPost: ({ id }) => POSTS.find((p) => p.id === Number(id)) ?? null,
    getPostWithComments: ({ id }) => {
      const post = POSTS.find((p) => p.id === Number(id));
      if (!post) return null;
      const author = USERS.find((u) => u.id === post.authorId);
      return {
        ...post,
        author: author?.name,
        comments: COMMENTS.filter((c) => c.postId === post.id).map((c) => ({
          body: c.body,
          author: USERS.find((u) => u.id === c.authorId)?.name,
        })),
      };
    },
  };
  router.post('/api/rpc/:method', async (ctx) => {
    const procedure = procedures[ctx.params.method ?? ''];
    if (!procedure) throw new HttpError(404, `No procedure ${ctx.params.method}`);
    json(ctx.res, 200, {
      result: procedure(await readJson<Record<string, unknown>>(ctx.req, 10_000)),
    });
  });

  // ---- Todos: a collection with per-item versions (ETag / If-Match)
  let nextId = 4;
  let todos: Todo[] = [
    { id: 1, title: 'Read the Fetch standard', done: false, version: 1 },
    { id: 2, title: 'Throttle to Slow 4G', done: true, version: 1 },
    { id: 3, title: 'Write a service worker', done: false, version: 1 },
  ];
  const latency = async (ctx: Ctx): Promise<void> => {
    const ms = Math.min(3000, Number(ctx.url.searchParams.get('delay') ?? 0));
    if (ms > 0) await ctx.timing.measure('db', () => deps.sleep(ms), 'simulated latency');
  };
  router.get('/api/todos', async (ctx) => {
    await latency(ctx);
    sendCacheable(ctx, todos, 'no-cache');
  });
  router.post('/api/todos', async (ctx) => {
    await latency(ctx);
    const { title } = await readJson<{ title?: string }>(ctx.req, 5_000);
    if (!title?.trim()) throw new HttpError(422, 'A todo needs a title');
    const todo = { id: nextId++, title: title.trim().slice(0, 120), done: false, version: 1 };
    todos.push(todo);
    json(ctx.res, 201, todo, { ETag: todoEtag(todo), Location: `/api/todos/${todo.id}` });
  });
  router.patch('/api/todos/:id', async (ctx) => {
    await latency(ctx);
    const todo = todos.find((t) => t.id === Number(ctx.params.id));
    if (!todo) throw new HttpError(404, 'No such todo');
    // Optimistic concurrency: refuse to overwrite a version the client hasn't seen.
    if (!matchesIfMatch(ctx.req.headers, todoEtag(todo)))
      throw new HttpError(412, 'Someone else changed this todo; reload it and try again', {
        ETag: todoEtag(todo),
      });
    const patch = await readJson<Partial<Todo>>(ctx.req, 5_000);
    if (typeof patch.done === 'boolean') todo.done = patch.done;
    if (typeof patch.title === 'string' && patch.title.trim())
      todo.title = patch.title.trim().slice(0, 120);
    todo.version += 1;
    json(ctx.res, 200, todo, { ETag: todoEtag(todo) });
  });
  router.delete('/api/todos/:id', async (ctx) => {
    await latency(ctx);
    todos = todos.filter((t) => t.id !== Number(ctx.params.id));
    send(ctx.res, 204, '');
  });

  // ---- Likes: set-state (idempotent) rather than toggle, with injectable latency and failure
  const likes = new Map<number, { count: number; liked: boolean }>();
  router.put('/api/likes/:id', async (ctx) => {
    await latency(ctx);
    const failRate = Number(ctx.url.searchParams.get('fail') ?? 0);
    if (Math.random() < failRate)
      throw new HttpError(503, 'The likes service is overloaded', { 'Retry-After': '2' });
    const { liked } = await readJson<{ liked?: boolean }>(ctx.req, 1_000);
    if (typeof liked !== 'boolean') throw new HttpError(422, 'Send {"liked": true|false}');
    const id = Number(ctx.params.id);
    const current = likes.get(id) ?? { count: 41, liked: false };
    if (current.liked !== liked) current.count += liked ? 1 : -1;
    current.liked = liked;
    likes.set(id, current);
    json(ctx.res, 200, current);
  });

  // ---- A deliberately unreliable endpoint for retry policies and error classification
  router.get('/api/flaky', async (ctx) => {
    const rate = Math.min(1, Math.max(0, Number(ctx.url.searchParams.get('failRate') ?? 0.5)));
    const kind = ctx.url.searchParams.get('kind') ?? '503';
    await latency(ctx);
    if (Math.random() >= rate) {
      json(ctx.res, 200, { ok: true, at: new Date(deps.now()).toISOString() });
      return;
    }
    if (kind === 'timeout') {
      await deps.sleep(8000);
      json(ctx.res, 200, { ok: true, late: true });
      return;
    }
    if (kind === '422') throw new HttpError(422, 'Validation failed: retrying will not help');
    if (kind === '429') throw new HttpError(429, 'Slow down', { 'Retry-After': '1' });
    throw new HttpError(
      kind === '500' ? 500 : 503,
      'Temporary failure',
      kind === '500' ? {} : { 'Retry-After': '1' },
    );
  });

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
