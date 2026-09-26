/**
 * Core Web Vitals arithmetic, shared by the in-browser RUM collector and the server that
 * aggregates beacons. Thresholds are web.dev's "good" / "poor" boundaries, judged at p75.
 */
export type Metric = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
export type Rating = 'good' | 'needs-improvement' | 'poor';

export const THRESHOLDS: Record<Metric, [good: number, poor: number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

export function rate(metric: Metric, value: number): Rating {
  const [good, poor] = THRESHOLDS[metric];
  return value <= good ? 'good' : value <= poor ? 'needs-improvement' : 'poor';
}

export interface ShiftEntry {
  value: number;
  startTime: number;
  hadRecentInput: boolean;
}

/**
 * CLS is the largest *session window* of layout shifts: shifts less than 1 s apart, in a
 * window no longer than 5 s. Shifts within 500 ms of user input don't count.
 */
export function clsFromShifts(entries: ShiftEntry[]): number {
  let max = 0;
  let current = 0;
  let first = 0;
  let last = 0;
  for (const entry of entries) {
    if (entry.hadRecentInput) continue;
    if (current > 0 && entry.startTime - last < 1000 && entry.startTime - first < 5000) {
      current += entry.value;
    } else {
      current = entry.value;
      first = entry.startTime;
    }
    last = entry.startTime;
    max = Math.max(max, current);
  }
  return max;
}

export interface EventEntry {
  interactionId: number;
  duration: number;
}

/**
 * INP: group event timings by interaction, take each interaction's longest event, then report
 * the worst interaction, ignoring one outlier per 50 interactions (the 98th percentile).
 */
export function inpFromEvents(entries: EventEntry[]): number | undefined {
  const byInteraction = new Map<number, number>();
  for (const { interactionId, duration } of entries) {
    if (!interactionId) continue;
    byInteraction.set(interactionId, Math.max(byInteraction.get(interactionId) ?? 0, duration));
  }
  const worstFirst = [...byInteraction.values()].sort((a, b) => b - a);
  if (!worstFirst.length) return undefined;
  return worstFirst[Math.min(worstFirst.length - 1, Math.floor(worstFirst.length / 50))];
}

/** Nearest-rank percentile (p in 0–100) of a list of numbers. */
export function percentile(values: number[], p: number): number | undefined {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank - 1))];
}

export interface Beacon {
  route: string;
  metric: Metric;
  value: number;
  device: 'mobile' | 'desktop';
  connection: string;
}

/** Validates an untrusted beacon (it arrives from any browser) into a typed one, or undefined. */
export function parseBeacon(input: unknown): Beacon | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const b = input as Record<string, unknown>;
  const metric = b.metric;
  if (typeof metric !== 'string' || !(metric in THRESHOLDS)) return undefined;
  const value = Number(b.value);
  if (!Number.isFinite(value) || value < 0 || value > 120_000) return undefined;
  const route = typeof b.route === 'string' && /^\/[\w\-/.#]*$/.test(b.route) ? b.route : undefined;
  if (!route || route.length > 200) return undefined;
  return {
    route,
    metric: metric as Metric,
    value,
    device: b.device === 'mobile' ? 'mobile' : 'desktop',
    connection: typeof b.connection === 'string' ? b.connection.slice(0, 12) : 'unknown',
  };
}
