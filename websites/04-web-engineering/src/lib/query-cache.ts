/**
 * A query cache in the spirit of TanStack Query and SWR, small enough to read in one sitting:
 * - one entry per key, shared by every subscriber (components never fetch the same key twice);
 * - in-flight requests are deduplicated;
 * - `staleTime` decides when cached data needs a background refetch (stale-while-revalidate:
 *   subscribers get the cached data immediately and the fresh data when it lands);
 * - `invalidate(prefix)` marks keys stale and refetches the ones someone is watching;
 * - `setData` supports optimistic updates and returns the previous value for rollback.
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface QueryState<T> {
  status: Status;
  data?: T;
  error?: unknown;
  fetching: boolean;
  updatedAt: number;
}

export interface Query<T> {
  key: string;
  fn: (signal: AbortSignal) => Promise<T>;
  staleTime?: number;
}

interface Entry {
  state: QueryState<unknown>;
  listeners: Set<(state: QueryState<unknown>) => void>;
  promise?: Promise<unknown>;
  query?: Query<unknown>;
}

export class QueryCache {
  private readonly entries = new Map<string, Entry>();
  private readonly now: () => number;
  /** Called for every real network fetch (not for cache hits or deduplicated calls). */
  onFetch?: (key: string) => void;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  private entry(key: string): Entry {
    let entry = this.entries.get(key);
    if (!entry) {
      entry = { state: { status: 'idle', fetching: false, updatedAt: 0 }, listeners: new Set() };
      this.entries.set(key, entry);
    }
    return entry;
  }

  private update(key: string, patch: Partial<QueryState<unknown>>): void {
    const entry = this.entry(key);
    entry.state = { ...entry.state, ...patch };
    for (const listener of entry.listeners) listener(entry.state);
  }

  get<T>(key: string): QueryState<T> {
    return this.entry(key).state as QueryState<T>;
  }

  isStale(key: string, staleTime = 0): boolean {
    const { updatedAt, status } = this.entry(key).state;
    return status !== 'success' || this.now() - updatedAt >= staleTime;
  }

  /** Fetches now, unless a fetch for this key is already in flight (then shares it). */
  fetch<T>(query: Query<T>): Promise<T> {
    const entry = this.entry(query.key);
    entry.query = query as Query<unknown>;
    if (entry.promise) return entry.promise as Promise<T>;
    const controller = new AbortController();
    this.update(query.key, {
      fetching: true,
      status: entry.state.status === 'success' ? 'success' : 'loading',
    });
    this.onFetch?.(query.key);
    const promise = query
      .fn(controller.signal)
      .then((data) => {
        this.update(query.key, {
          data,
          status: 'success',
          error: undefined,
          fetching: false,
          updatedAt: this.now(),
        });
        return data;
      })
      .catch((error: unknown) => {
        this.update(query.key, {
          error,
          status: entry.state.data === undefined ? 'error' : 'success',
          fetching: false,
        });
        throw error;
      })
      .finally(() => {
        entry.promise = undefined;
      });
    entry.promise = promise;
    return promise;
  }

  /** What a component calls on mount or focus: cached data now, a refetch only if stale. */
  ensure<T>(query: Query<T>): QueryState<T> {
    this.entry(query.key).query = query as Query<unknown>;
    if (this.isStale(query.key, query.staleTime)) void this.fetch(query).catch(() => undefined);
    return this.get<T>(query.key);
  }

  subscribe<T>(key: string, listener: (state: QueryState<T>) => void): () => void {
    const entry = this.entry(key);
    const wrapped = listener as (state: QueryState<unknown>) => void;
    entry.listeners.add(wrapped);
    return () => entry.listeners.delete(wrapped);
  }

  /** Marks matching keys stale; refetches those with subscribers. Returns how many refetched. */
  invalidate(prefix: string): number {
    let refetched = 0;
    for (const [key, entry] of this.entries) {
      if (!key.startsWith(prefix)) continue;
      entry.state = { ...entry.state, updatedAt: Number.NEGATIVE_INFINITY };
      if (entry.listeners.size && entry.query) {
        refetched += 1;
        void this.fetch(entry.query).catch(() => undefined);
      }
    }
    return refetched;
  }

  /** Writes data directly (optimistic update); returns the previous data for rollback. */
  setData<T>(key: string, updater: (old: T | undefined) => T): T | undefined {
    const previous = this.entry(key).state.data as T | undefined;
    this.update(key, { data: updater(previous), status: 'success' });
    return previous;
  }
}
