/**
 * Utopia-style fluid scales: one size at a small viewport, another at a large one,
 * interpolated with clamp(). The preferred value mixes rem and vi, so it still grows
 * with the user's font-size setting and browser zoom (WCAG 1.4.4); pure vw type does not.
 */

export interface FluidConfig {
  minViewport: number; // px
  maxViewport: number; // px
  minBase: number; // px, body size at minViewport
  maxBase: number; // px, body size at maxViewport
  minRatio: number; // modular ratio at minViewport (e.g. 1.2 minor third)
  maxRatio: number; // modular ratio at maxViewport (e.g. 1.25 major third)
}

const round = (n: number, places = 4): number => Number(n.toFixed(places));
const rem = (px: number): string => `${round(px / 16)}rem`;

/** clamp() between two pixel sizes across the configured viewport range. */
export function fluidClamp(minPx: number, maxPx: number, minVw: number, maxVw: number): string {
  if (minPx === maxPx) return rem(minPx);
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const intercept = minPx - slope * minVw;
  const lower = Math.min(minPx, maxPx);
  const upper = Math.max(minPx, maxPx);
  return `clamp(${rem(lower)}, ${rem(intercept)} + ${round(slope * 100)}vi, ${rem(upper)})`;
}

/** Type step n of the modular scale (n = 0 is body text). */
export function typeStep(config: FluidConfig, step: number): string {
  const min = config.minBase * config.minRatio ** step;
  const max = config.maxBase * config.maxRatio ** step;
  return fluidClamp(min, max, config.minViewport, config.maxViewport);
}

/** Space tokens are multiples of the base size, fluid in the same way. */
export function spaceStep(config: FluidConfig, multiplier: number): string {
  return fluidClamp(
    config.minBase * multiplier,
    config.maxBase * multiplier,
    config.minViewport,
    config.maxViewport,
  );
}

/** Resolves a clamp() produced above at a given viewport width (px), for demos and tests. */
export function resolveAt(minPx: number, maxPx: number, config: FluidConfig, viewport: number): number {
  const t = (viewport - config.minViewport) / (config.maxViewport - config.minViewport);
  const raw = minPx + (maxPx - minPx) * t;
  return Math.min(Math.max(raw, Math.min(minPx, maxPx)), Math.max(minPx, maxPx));
}
