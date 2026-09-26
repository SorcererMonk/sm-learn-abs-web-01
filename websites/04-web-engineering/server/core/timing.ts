/**
 * Server-Timing (W3C): named durations the browser shows in DevTools and exposes to scripts as
 * PerformanceResourceTiming.serverTiming, so a page can see where the server spent its time.
 */
export class Timing {
  private readonly marks = new Map<string, { start: number; dur?: number; desc?: string }>();
  private readonly clock: () => number;

  constructor(clock: () => number = () => performance.now()) {
    this.clock = clock;
  }

  start(name: string, desc?: string): void {
    this.marks.set(name, { start: this.clock(), desc });
  }

  end(name: string): number {
    const mark = this.marks.get(name);
    if (!mark) return 0;
    mark.dur = this.clock() - mark.start;
    return mark.dur;
  }

  /** Records a duration that was measured elsewhere (e.g. a simulated database call). */
  add(name: string, dur: number, desc?: string): void {
    this.marks.set(name, { start: 0, dur, desc });
  }

  async measure<T>(name: string, fn: () => Promise<T> | T, desc?: string): Promise<T> {
    this.start(name, desc);
    try {
      return await fn();
    } finally {
      this.end(name);
    }
  }

  /** Headers leave while handlers still run, so open marks report their elapsed time so far. */
  header(): string {
    const now = this.clock();
    return [...this.marks]
      .map(([name, m]) => {
        const desc = m.desc ? `;desc="${m.desc.replace(/["\\]/g, '')}"` : '';
        return `${name};dur=${(m.dur ?? now - m.start).toFixed(1)}${desc}`;
      })
      .join(', ');
  }
}
