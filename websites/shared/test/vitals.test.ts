import { describe, expect, it } from 'vitest';
import { clsFromShifts, inpFromEvents, parseBeacon, percentile, rate } from '../lib/vitals.ts';

describe('vitals', () => {
  it('rates values against the web.dev thresholds', () => {
    expect(rate('LCP', 2500)).toBe('good');
    expect(rate('LCP', 2501)).toBe('needs-improvement');
    expect(rate('INP', 501)).toBe('poor');
    expect(rate('CLS', 0.1)).toBe('good');
  });

  it('computes CLS as the largest session window, ignoring shifts after input', () => {
    const shift = (value: number, startTime: number, hadRecentInput = false) => ({
      value,
      startTime,
      hadRecentInput,
    });
    // Window 1: 0.1 + 0.1 (500 ms apart). Gap of 2 s starts window 2: 0.15.
    expect(clsFromShifts([shift(0.1, 0), shift(0.1, 500), shift(0.15, 2500)])).toBeCloseTo(0.2);
    // A window is capped at 5 s even when shifts keep coming every 900 ms.
    const steady = Array.from({ length: 10 }, (_, i) => shift(0.01, i * 900));
    expect(clsFromShifts(steady)).toBeCloseTo(0.06);
    expect(clsFromShifts([shift(0.5, 0, true)])).toBe(0);
  });

  it('computes INP from the worst interaction, skipping one outlier per 50', () => {
    expect(inpFromEvents([])).toBeUndefined();
    expect(
      inpFromEvents([
        { interactionId: 1, duration: 40 },
        { interactionId: 1, duration: 120 },
        { interactionId: 2, duration: 80 },
        { interactionId: 0, duration: 900 },
      ]),
    ).toBe(120);
    const many = Array.from({ length: 60 }, (_, i) => ({ interactionId: i + 1, duration: i }));
    expect(inpFromEvents(many)).toBe(58);
  });

  it('takes nearest-rank percentiles', () => {
    expect(percentile([], 75)).toBeUndefined();
    expect(percentile([4, 1, 3, 2], 75)).toBe(3);
    expect(percentile([10], 99)).toBe(10);
  });

  it('accepts only well-formed beacons', () => {
    expect(parseBeacon({ route: '/learn/', metric: 'LCP', value: 1200, device: 'mobile' })).toEqual(
      { route: '/learn/', metric: 'LCP', value: 1200, device: 'mobile', connection: 'unknown' },
    );
    expect(parseBeacon({ route: '/x', metric: 'FID', value: 1 })).toBeUndefined();
    expect(parseBeacon({ route: 'javascript:1', metric: 'LCP', value: 1 })).toBeUndefined();
    expect(parseBeacon({ route: '/x', metric: 'CLS', value: -1 })).toBeUndefined();
    expect(parseBeacon(null)).toBeUndefined();
  });
});
