import { describe, expect, it } from 'vitest';
import { resolveFlexibleLengths } from '../../src/lib/flex.ts';
import { chooseCandidate, evaluateSizes, parseSrcset } from '../../src/lib/srcset.ts';

describe('flex: resolve flexible lengths', () => {
  it('shrinks by shrink × basis: 100/200/300 into 400 → 66.67/133.33/200', () => {
    const r = resolveFlexibleLengths(400, [
      { basis: 100, grow: 0, shrink: 1 },
      { basis: 200, grow: 0, shrink: 1 },
      { basis: 300, grow: 0, shrink: 1 },
    ]);
    expect(r.mode).toBe('shrink');
    expect(r.sizes).toEqual([66.67, 133.33, 200]);
  });

  it('grows by grow factor: flex: 1 1 0% items split space equally', () => {
    const r = resolveFlexibleLengths(600, [
      { basis: 0, grow: 1, shrink: 1 },
      { basis: 0, grow: 2, shrink: 1 },
    ]);
    expect(r.sizes).toEqual([200, 400]);
  });

  it('distributes only the fraction of free space when factors sum below 1', () => {
    const r = resolveFlexibleLengths(500, [{ basis: 100, grow: 0.5, shrink: 1 }]);
    expect(r.sizes).toEqual([300]);
  });

  it('freezes an item at its max and gives the rest to others', () => {
    const r = resolveFlexibleLengths(600, [
      { basis: 0, grow: 1, shrink: 1, max: 100 },
      { basis: 0, grow: 1, shrink: 1 },
    ]);
    expect(r.sizes).toEqual([100, 500]);
  });

  it('respects a min-content floor (the min-width: auto trap)', () => {
    const r = resolveFlexibleLengths(300, [
      { basis: 400, grow: 0, shrink: 1, min: 350 },
      { basis: 100, grow: 0, shrink: 1 },
    ]);
    expect(r.sizes[0]).toBe(350);
  });

  it('accounts for gaps', () => {
    const r = resolveFlexibleLengths(
      620,
      [
        { basis: 0, grow: 1, shrink: 1 },
        { basis: 0, grow: 1, shrink: 1 },
      ],
      20,
    );
    expect(r.sizes).toEqual([300, 300]);
  });
});

describe('responsive image selection', () => {
  const srcset = 'a-480.avif 480w, a-800.avif 800w, a-1200.avif 1200w, a-1600.avif 1600w';
  it('parses w and x descriptors', () => {
    expect(parseSrcset('a.jpg, b.jpg 2x')).toEqual([
      { url: 'a.jpg', density: 1 },
      { url: 'b.jpg', density: 2 },
    ]);
    expect(parseSrcset(srcset)[1]).toEqual({ url: 'a-800.avif', width: 800 });
  });
  it('evaluates sizes media conditions in order', () => {
    const sizes = '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 600px';
    expect(evaluateSizes(sizes, 400)).toBe(400);
    expect(evaluateSizes(sizes, 1000)).toBe(500);
    expect(evaluateSizes(sizes, 1600)).toBe(600);
  });
  it('picks the smallest candidate covering slot × DPR', () => {
    expect(chooseCandidate(srcset, '100vw', 400, 2)?.candidate.url).toBe('a-800.avif');
    expect(chooseCandidate(srcset, '100vw', 400, 1)?.candidate.url).toBe('a-480.avif');
    expect(chooseCandidate(srcset, '100vw', 2000, 2)?.candidate.url).toBe('a-1600.avif');
  });
  it('shows why a lying sizes attribute downloads the wrong file', () => {
    // Layout is really 300px wide, but sizes claims 100vw on a 1400px screen.
    expect(chooseCandidate(srcset, '100vw', 1400, 1)?.candidate.url).toBe('a-1600.avif');
    expect(chooseCandidate(srcset, '300px', 1400, 1)?.candidate.url).toBe('a-480.avif');
  });
});
