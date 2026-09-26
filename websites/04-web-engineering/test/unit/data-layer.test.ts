import { describe, expect, it } from 'vitest';
import { QueryCache } from '../../src/lib/query-cache.ts';
import {
  DEFAULT_POLICY,
  backoff,
  classify,
  retryAfterMs,
  shouldRetry,
} from '../../src/lib/retry.ts';
import { DASHBOARD_STATE, score } from '../../src/lib/state-taxonomy.ts';
import { fromBase64url, toBase64url } from '../../src/lib/base64url.ts';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('query cache', () => {
  it('deduplicates in-flight fetches and shares the result', async () => {
    const cache = new QueryCache(() => 0);
    const fetched: string[] = [];
    cache.onFetch = (key) => fetched.push(key);
    const d = deferred<number[]>();
    const query = { key: 'todos', fn: () => d.promise };
    const a = cache.fetch(query);
    const b = cache.fetch(query);
    expect(cache.get('todos')).toMatchObject({ status: 'loading', fetching: true });
    d.resolve([1, 2]);
    expect(await a).toEqual([1, 2]);
    expect(await b).toEqual([1, 2]);
    expect(fetched).toEqual(['todos']);
    expect(cache.get('todos')).toMatchObject({ status: 'success', data: [1, 2], fetching: false });
  });

  it('serves fresh data from cache and refetches stale data in the background', async () => {
    let now = 0;
    let calls = 0;
    const cache = new QueryCache(() => now);
    const query = { key: 'todos', staleTime: 5000, fn: async () => ++calls };
    await cache.fetch(query);
    now = 1000;
    expect(cache.ensure(query)).toMatchObject({ data: 1, fetching: false });
    expect(calls).toBe(1);
    now = 6000;
    const state = cache.ensure(query);
    expect(state).toMatchObject({ data: 1, fetching: true });
    await Promise.resolve();
    await Promise.resolve();
    expect(cache.get('todos').data).toBe(2);
  });

  it('invalidates by prefix and refetches only watched queries', async () => {
    let calls = 0;
    const cache = new QueryCache(() => 0);
    const watched = { key: 'todos:open', fn: async () => ++calls };
    const unwatched = { key: 'todos:done', fn: async () => ++calls };
    await cache.fetch(watched);
    await cache.fetch(unwatched);
    const seen: unknown[] = [];
    cache.subscribe('todos:open', (s) => seen.push(s.data));
    expect(cache.invalidate('todos')).toBe(1);
    await Promise.resolve();
    await Promise.resolve();
    expect(seen.at(-1)).toBe(3);
    expect(cache.isStale('todos:done', 10_000)).toBe(true);
  });

  it('supports optimistic writes with rollback and keeps data on refetch errors', async () => {
    const cache = new QueryCache(() => 0);
    await cache.fetch({ key: 'likes', fn: async () => 41 });
    const previous = cache.setData<number>('likes', (n = 0) => n + 1);
    expect(cache.get('likes').data).toBe(42);
    cache.setData('likes', () => previous as number);
    expect(cache.get('likes').data).toBe(41);
    await expect(
      cache.fetch({ key: 'likes', fn: () => Promise.reject(new Error('503')) }),
    ).rejects.toThrow('503');
    expect(cache.get('likes')).toMatchObject({ status: 'success', data: 41 });
  });
});

describe('retry policy', () => {
  it('backs off exponentially up to the cap, with full jitter', () => {
    const policy = { ...DEFAULT_POLICY, jitter: false };
    expect([0, 1, 2, 3, 4, 5].map((n) => backoff(n, policy))).toEqual([
      250, 500, 1000, 2000, 4000, 4000,
    ]);
    expect(backoff(3, DEFAULT_POLICY, () => 0.5)).toBe(1000);
    expect(backoff(3, DEFAULT_POLICY, () => 0)).toBe(0);
  });

  it('classifies failures and retries only what can succeed', () => {
    expect(classify({ status: 503 })).toBe('server');
    expect(classify({ status: 429 })).toBe('rate-limited');
    expect(classify({ status: 422 })).toBe('client');
    expect(classify({ error: new TypeError('Failed to fetch') })).toBe('offline');
    expect(classify({ error: new DOMException('t', 'TimeoutError') })).toBe('timeout');
    expect(classify({ online: false, status: 200 })).toBe('offline');
    expect(shouldRetry('server', 'GET')).toBe(true);
    expect(shouldRetry('server', 'POST')).toBe(false);
    expect(shouldRetry('server', 'POST', true)).toBe(true);
    expect(shouldRetry('client', 'GET')).toBe(false);
  });

  it('reads Retry-After as seconds or a date', () => {
    expect(retryAfterMs('2')).toBe(2000);
    expect(retryAfterMs('Thu, 01 Jan 1970 00:00:10 GMT', 4000)).toBe(6000);
    expect(retryAfterMs('soon')).toBeUndefined();
    expect(retryAfterMs(null)).toBeUndefined();
  });
});

describe('state taxonomy exercise and base64url', () => {
  it('scores answers', () => {
    const perfect = Object.fromEntries(DASHBOARD_STATE.map((i) => [i.id, i.kind]));
    expect(score(perfect)).toBe(DASHBOARD_STATE.length);
    expect(score({})).toBe(0);
  });

  it('round-trips base64url without padding', () => {
    const bytes = new Uint8Array([0, 251, 255, 62, 63]);
    const text = toBase64url(bytes);
    expect(text).not.toMatch(/[+/=]/);
    expect([...fromBase64url(text)]).toEqual([...bytes]);
    expect(Buffer.from(bytes).toString('base64url')).toBe(text);
  });
});
