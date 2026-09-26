/**
 * Token-bucket rate limiting: each key has a bucket of `capacity` tokens refilled continuously at
 * `refillPerSecond`. A request takes a token; an empty bucket means 429 with Retry-After. Bursts up
 * to the capacity are allowed, the long-run rate is the refill rate.
 */
export interface Decision {
  allowed: boolean;
  remaining: number;
  /** Seconds until the bucket is full again. */
  resetSeconds: number;
  /** Seconds until one token is available (0 when allowed). */
  retryAfterSeconds: number;
}

export class TokenBucket {
  private readonly buckets = new Map<string, { tokens: number; at: number }>();
  readonly capacity: number;
  private readonly rate: number;
  private readonly now: () => number;

  constructor(options: { capacity: number; refillPerSecond: number; now?: () => number }) {
    this.capacity = options.capacity;
    this.rate = options.refillPerSecond;
    this.now = options.now ?? Date.now;
  }

  private refill(key: string): { tokens: number; at: number } {
    const now = this.now();
    const bucket = this.buckets.get(key) ?? { tokens: this.capacity, at: now };
    bucket.tokens = Math.min(this.capacity, bucket.tokens + ((now - bucket.at) / 1000) * this.rate);
    bucket.at = now;
    this.buckets.set(key, bucket);
    return bucket;
  }

  private decision(tokens: number, allowed: boolean): Decision {
    return {
      allowed,
      remaining: Math.floor(tokens),
      resetSeconds: Math.ceil((this.capacity - tokens) / this.rate),
      retryAfterSeconds: allowed ? 0 : Math.ceil((1 - tokens) / this.rate),
    };
  }

  /** Looks without spending (e.g. "is this account locked?"). */
  peek(key: string): Decision {
    const bucket = this.refill(key);
    return this.decision(bucket.tokens, bucket.tokens >= 1);
  }

  take(key: string, cost = 1): Decision {
    const bucket = this.refill(key);
    if (bucket.tokens < cost) return this.decision(bucket.tokens, false);
    bucket.tokens -= cost;
    return this.decision(bucket.tokens, true);
  }

  reset(key?: string): void {
    if (key) this.buckets.delete(key);
    else this.buckets.clear();
  }
}

/** The IETF RateLimit header fields (draft-ietf-httpapi-ratelimit-headers) plus Retry-After. */
export function rateLimitHeaders(decision: Decision, capacity: number): Record<string, string> {
  const headers: Record<string, string> = {
    'RateLimit-Limit': String(capacity),
    'RateLimit-Remaining': String(decision.remaining),
    'RateLimit-Reset': String(decision.resetSeconds),
  };
  if (!decision.allowed) headers['Retry-After'] = String(Math.max(1, decision.retryAfterSeconds));
  return headers;
}
