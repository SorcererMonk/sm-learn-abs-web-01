/**
 * Real-user monitoring, opt-in per site (SiteConfig.rum): observes LCP, CLS, INP, FCP and TTFB
 * for this page view and sends them once, when the page is hidden, with navigator.sendBeacon
 * (which survives the page unloading). No identifiers: route, device class and connection only.
 */
import { clsFromShifts, inpFromEvents, type Metric, type ShiftEntry } from '../lib/vitals.ts';

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
interface EventTiming extends PerformanceEntry {
  interactionId: number;
}

export function initRum(endpoint: string): void {
  const values = new Map<Metric, number>();
  const shifts: ShiftEntry[] = [];
  const events: { interactionId: number; duration: number }[] = [];

  const observe = (type: string, onEntries: (entries: PerformanceEntry[]) => void): void => {
    try {
      new PerformanceObserver((list) => onEntries(list.getEntries())).observe({
        type,
        buffered: true,
        ...(type === 'event' ? { durationThreshold: 16 } : {}),
      } as PerformanceObserverInit);
    } catch {
      // Entry type unsupported in this browser: that metric is simply not reported.
    }
  };

  observe('largest-contentful-paint', (entries) => {
    const last = entries.at(-1);
    if (last) values.set('LCP', last.startTime);
  });
  observe('paint', (entries) => {
    const fcp = entries.find((e) => e.name === 'first-contentful-paint');
    if (fcp) values.set('FCP', fcp.startTime);
  });
  observe('layout-shift', (entries) => {
    for (const e of entries as LayoutShift[])
      shifts.push({ value: e.value, startTime: e.startTime, hadRecentInput: e.hadRecentInput });
  });
  observe('event', (entries) => {
    for (const e of entries as EventTiming[])
      events.push({ interactionId: e.interactionId, duration: e.duration });
  });
  const nav = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  if (nav) values.set('TTFB', Math.max(0, nav.responseStart - nav.startTime));

  let sent = false;
  const flush = (): void => {
    if (sent) return;
    sent = true;
    values.set('CLS', clsFromShifts(shifts));
    const inp = inpFromEvents(events);
    if (inp !== undefined) values.set('INP', inp);
    const connection =
      (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
        ?.effectiveType ?? 'unknown';
    const device = matchMedia('(max-width: 40rem)').matches ? 'mobile' : 'desktop';
    const route = location.pathname;
    const body = JSON.stringify(
      [...values].map(([metric, value]) => ({ route, metric, value, device, connection })),
    );
    navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
  };
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  addEventListener('pagehide', flush);
}
