/**
 * Colour maths shared by every site: OKLCH <-> sRGB, gamut mapping,
 * WCAG 2 contrast and APCA (the perceptual algorithm proposed for WCAG 3).
 * Pure functions, no DOM, so they run in Node (tests, token build) and the browser (demos).
 */

export interface Oklch {
  l: number; // 0..1 perceptual lightness
  c: number; // chroma, ~0..0.37 for sRGB
  h: number; // hue in degrees
}

export type Rgb = [r: number, g: number, b: number]; // gamma-encoded sRGB, 0..1

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** OKLCH -> linear-light sRGB (may fall outside 0..1 when out of gamut). */
export function oklchToLinearSrgb({ l, c, h }: Oklch): Rgb {
  const a = c * Math.cos(toRad(h));
  const b = c * Math.sin(toRad(h));
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const encode = (x: number): number =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * Math.sign(x) * Math.abs(x) ** (1 / 2.4) - 0.055;

const decode = (x: number): number => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);

const inGamut = (rgb: Rgb, eps = 1e-6): boolean => rgb.every((v) => v >= -eps && v <= 1 + eps);

/**
 * Map an OKLCH colour into sRGB the way CSS Color 4 recommends: keep lightness and hue,
 * reduce chroma (binary search) until the colour fits. Returns gamma-encoded sRGB.
 */
export function oklchToSrgb(color: Oklch): Rgb {
  let linear = oklchToLinearSrgb(color);
  if (!inGamut(linear)) {
    let lo = 0;
    let hi = color.c;
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinearSrgb({ ...color, c: mid }))) lo = mid;
      else hi = mid;
    }
    linear = oklchToLinearSrgb({ ...color, c: lo });
  }
  return linear.map((v) => Math.min(1, Math.max(0, encode(v)))) as Rgb;
}

/** Gamma-encoded sRGB -> OKLCH. */
export function srgbToOklch(rgb: Rgb): Oklch {
  const [r, g, b] = rgb.map(decode) as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.hypot(A, B);
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Not a hex colour: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as Rgb;
}

export function rgbToHex(rgb: Rgb): string {
  return `#${rgb
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** Parses the subset of CSS colour syntax the tokens use: `oklch(L C H [/ A])` and hex. */
export function parseCssColor(input: string): Oklch {
  const value = input.trim();
  if (value.startsWith('#')) return srgbToOklch(hexToRgb(value));
  const match = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/i.exec(value);
  if (!match) throw new Error(`Unsupported colour: ${input}`);
  const [, l = '0', pct, c = '0', h = '0'] = match;
  return { l: pct ? Number(l) / 100 : Number(l), c: Number(c), h: Number(h) };
}

export const formatOklch = ({ l, c, h }: Oklch): string =>
  `oklch(${+l.toFixed(3)} ${+c.toFixed(3)} ${+h.toFixed(1)})`;

/** WCAG 2.x relative luminance of a gamma-encoded sRGB colour. */
export function relativeLuminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map(decode) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1..21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * APCA-W3 0.1.9 lightness contrast (Lc). Positive = dark text on light background.
 * A design aid only: WCAG 2 remains the compliance bar.
 */
export function apcaContrast(text: Rgb, background: Rgb): number {
  const y = ([r, g, b]: Rgb): number => {
    const raw = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
    return raw < 0.022 ? raw + (0.022 - raw) ** 1.414 : raw;
  };
  const yText = y(text);
  const yBg = y(background);
  if (Math.abs(yBg - yText) < 0.0005) return 0;
  if (yBg > yText) {
    const sapc = (yBg ** 0.56 - yText ** 0.57) * 1.14;
    return sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  }
  const sapc = (yBg ** 0.65 - yText ** 0.62) * 1.14;
  return sapc > -0.1 ? 0 : (sapc + 0.027) * 100;
}

export interface ContrastVerdict {
  ratio: number;
  aaText: boolean; // 4.5:1 body text
  aaLarge: boolean; // 3:1 large text, UI components, focus indicators
  aaaText: boolean; // 7:1
}

export function judgeContrast(fg: Rgb, bg: Rgb): ContrastVerdict {
  const ratio = contrastRatio(fg, bg);
  return { ratio, aaText: ratio >= 4.5, aaLarge: ratio >= 3, aaaText: ratio >= 7 };
}

/**
 * Tonal scale with even lightness steps (the OKLCH way): hue held,
 * chroma eased towards the light and dark extremes so ends stay in gamut.
 */
export function tonalScale(hue: number, peakChroma: number, steps = 11): Oklch[] {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const l = 0.97 - t * (0.97 - 0.2);
    const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, 0.15 + t * 0.85)));
    return { l, c: peakChroma * taper, h: hue };
  });
}
