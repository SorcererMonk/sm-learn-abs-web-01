import { describe, expect, it } from 'vitest';
import {
  apcaContrast,
  contrastRatio,
  fixContrast,
  hexToRgb,
  hslToRgb,
  oklchToSrgb,
  parseCssColor,
  rgbToHex,
  srgbToOklch,
  tonalScale,
  type Rgb,
} from '../lib/color.ts';
import { readTokens, flatten } from '../tools/build-tokens.ts';

describe('colour maths', () => {
  it('computes the WCAG extremes', () => {
    expect(contrastRatio([0, 0, 0], [1, 1, 1])).toBeCloseTo(21, 5);
    expect(contrastRatio([1, 1, 1], [1, 1, 1])).toBeCloseTo(1, 5);
  });

  it('matches a known WCAG pair (#767676 on white ≈ 4.54)', () => {
    expect(contrastRatio(hexToRgb('#767676'), hexToRgb('#ffffff'))).toBeCloseTo(4.54, 2);
  });

  it('round-trips sRGB through OKLCH', () => {
    for (const hex of ['#c2410c', '#1d4ed8', '#16a34a', '#777777']) {
      expect(rgbToHex(oklchToSrgb(srgbToOklch(hexToRgb(hex))))).toBe(hex);
    }
  });

  it('knows pure red in OKLCH', () => {
    const red = srgbToOklch([1, 0, 0]);
    expect(red.l).toBeCloseTo(0.628, 2);
    expect(red.c).toBeCloseTo(0.2577, 2);
    expect(red.h).toBeCloseTo(29.23, 0);
  });

  it('gamut-maps out-of-range chroma instead of clipping channels independently', () => {
    const rgb = oklchToSrgb({ l: 0.7, c: 0.4, h: 145 });
    rgb.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  });

  it('gives APCA ~106 for black on white and a negative value for reverse polarity', () => {
    expect(apcaContrast([0, 0, 0], [1, 1, 1])).toBeCloseTo(106, 0);
    expect(apcaContrast([1, 1, 1], [0, 0, 0])).toBeLessThan(-100);
  });

  it('builds tonal scales with monotonically decreasing lightness', () => {
    const scale = tonalScale(250, 0.15);
    for (let i = 1; i < scale.length; i += 1) expect(scale[i]!.l).toBeLessThan(scale[i - 1]!.l);
  });
});

/** Every text/UI pair the sites rely on, checked for each site's brand hue in both modes. */
describe('token contrast (WCAG AA) for every site', () => {
  const tokens = Object.fromEntries(
    flatten(readTokens())
      .filter(([, t]) => t.$type === 'color')
      .map(([path, t]) => [path.slice(1).join('-'), t]),
  );
  const resolve = (name: string, mode: 'light' | 'dark', hue: number) => {
    const token = tokens[name];
    if (!token) throw new Error(`missing token ${name}`);
    const raw = mode === 'dark' ? String(token.$extensions?.['learn.dark']) : String(token.$value);
    return oklchToSrgb(parseCssColor(raw.replace('var(--brand-hue)', String(hue))));
  };
  const pairs: [fg: string, bgs: string[], min: number][] = [
    ['text', ['canvas', 'surface', 'surface-2', 'accent-subtle'], 4.5],
    ['text-muted', ['canvas', 'surface', 'surface-2'], 4.5],
    ['accent', ['canvas', 'surface', 'surface-2'], 4.5],
    ['on-accent', ['accent-strong'], 4.5],
    ['text-inverse', ['surface-inverse'], 4.5],
    ['success', ['canvas', 'surface'], 4.5],
    ['warning', ['canvas', 'surface'], 4.5],
    ['danger', ['canvas', 'surface'], 4.5],
    ['info', ['canvas', 'surface'], 4.5],
    ['focus', ['canvas', 'surface', 'surface-2'], 3],
    ['border-strong', ['canvas', 'surface'], 3],
  ];
  for (const hue of [35, 285, 240, 155, 350]) {
    for (const mode of ['light', 'dark'] as const) {
      for (const [fg, bgs, min] of pairs) {
        for (const bg of bgs) {
          it(`hue ${hue} ${mode}: ${fg} on ${bg} ≥ ${min}:1`, () => {
            expect(
              contrastRatio(resolve(fg, mode, hue), resolve(bg, mode, hue)),
            ).toBeGreaterThanOrEqual(min);
          });
        }
      }
    }
  }
});

describe('hslToRgb and fixContrast', () => {
  it('converts HSL primaries and greys', () => {
    expect(hslToRgb(0, 1, 0.5).map((v) => Math.round(v * 255))).toEqual([255, 0, 0]);
    expect(hslToRgb(120, 1, 0.25).map((v) => Math.round(v * 255))).toEqual([0, 128, 0]);
    expect(hslToRgb(200, 0, 0.5).map((v) => Math.round(v * 255))).toEqual([128, 128, 128]);
  });

  it('shows HSL lightness is not perceptual: yellow and blue at l=50% differ hugely in OKLCH', () => {
    const yellow = srgbToOklch(hslToRgb(60, 1, 0.5));
    const blue = srgbToOklch(hslToRgb(240, 1, 0.5));
    expect(yellow.l - blue.l).toBeGreaterThan(0.4);
  });

  it('darkens text on light backgrounds just enough to pass AA', () => {
    const white: Rgb = [1, 1, 1];
    const fixed = fixContrast({ l: 0.75, c: 0.15, h: 35 }, white, 4.5);
    expect(fixed).toBeDefined();
    const ratio = contrastRatio(oklchToSrgb(fixed!), white);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratio).toBeLessThan(4.7);
  });

  it('lightens text on dark backgrounds, and leaves passing colours alone', () => {
    const dark: Rgb = [0.1, 0.1, 0.12];
    const fixed = fixContrast({ l: 0.35, c: 0.1, h: 250 }, dark, 7);
    expect(contrastRatio(oklchToSrgb(fixed!), dark)).toBeGreaterThanOrEqual(7);
    const fine = { l: 0.2, c: 0, h: 0 };
    expect(fixContrast(fine, [1, 1, 1])).toBe(fine);
  });
});
