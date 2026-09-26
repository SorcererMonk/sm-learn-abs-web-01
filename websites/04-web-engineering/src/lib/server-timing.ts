/** Parses a Server-Timing header (or PerformanceServerTiming entries) into named durations. */
export interface ServerTimingEntry {
  name: string;
  dur: number;
  desc: string;
}

export function parseServerTiming(header: string | null): ServerTimingEntry[] {
  if (!header) return [];
  return header
    .split(',')
    .map((metric) => {
      const [name = '', ...params] = metric.trim().split(';');
      const get = (key: string): string | undefined =>
        params
          .map((p) => p.trim())
          .find((p) => p.startsWith(`${key}=`))
          ?.slice(key.length + 1)
          .replace(/^"|"$/g, '');
      return { name: name.trim(), dur: Number(get('dur') ?? 0), desc: get('desc') ?? '' };
    })
    .filter((entry) => entry.name);
}
