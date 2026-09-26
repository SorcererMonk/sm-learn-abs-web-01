import { describe, expect, it } from 'vitest';
import { fluidClamp, resolveAt, typeStep, type FluidConfig } from '../lib/fluid.ts';
import {
  cubicBezierAt,
  dampingRatio,
  projectDistance,
  rubberBand,
  springFromDurationBounce,
  springSamples,
  springToLinear,
} from '../lib/motion.ts';

const config: FluidConfig = {
  minViewport: 360,
  maxViewport: 1440,
  minBase: 16,
  maxBase: 19,
  minRatio: 1.2,
  maxRatio: 1.25,
};

describe('fluid scales', () => {
  it('mixes rem and vi so zoom still scales text', () => {
    const value = typeStep(config, 0);
    expect(value).toMatch(/^clamp\(1rem, [\d.]+rem \+ [\d.]+vi, 1\.1875rem\)$/);
  });
  it('interpolates linearly between the two viewports', () => {
    expect(resolveAt(16, 19, config, 360)).toBe(16);
    expect(resolveAt(16, 19, config, 1440)).toBe(19);
    expect(resolveAt(16, 19, config, 900)).toBeCloseTo(17.5, 5);
    expect(resolveAt(16, 19, config, 3000)).toBe(19);
  });
  it('collapses to a fixed value when min equals max', () => {
    expect(fluidClamp(16, 16, 360, 1440)).toBe('1rem');
  });
});

describe('easing and springs', () => {
  it('evaluates cubic-bezier endpoints and linear', () => {
    expect(cubicBezierAt([0.2, 0, 0, 1], 0)).toBe(0);
    expect(cubicBezierAt([0.2, 0, 0, 1], 1)).toBe(1);
    expect(cubicBezierAt([0.25, 0.25, 0.75, 0.75], 0.3)).toBeCloseTo(0.3, 3);
  });
  it('ease-out is ahead of linear early on', () => {
    expect(cubicBezierAt([0, 0, 0.58, 1], 0.25)).toBeGreaterThan(0.25);
  });
  it('maps bounce 0 to a critically damped spring that never overshoots', () => {
    const spring = springFromDurationBounce(0.4, 0);
    expect(dampingRatio(spring)).toBeCloseTo(1, 5);
    expect(Math.max(...springSamples(spring, 2))).toBeLessThanOrEqual(1.0001);
  });
  it('overshoots with bounce > 0', () => {
    expect(Math.max(...springSamples(springFromDurationBounce(0.4, 0.3), 2))).toBeGreaterThan(1.01);
  });
  it('compiles to a CSS linear() that starts at 0 and ends at 1', () => {
    const { easing, duration } = springToLinear(springFromDurationBounce(0.45, 0.2));
    expect(easing.startsWith('linear(0,')).toBe(true);
    expect(easing.endsWith(', 1)')).toBe(true);
    expect(duration).toBeGreaterThan(200);
  });
  it('projects a flick further than it was dragged', () => {
    expect(projectDistance(1000)).toBeCloseTo(499, 0);
    expect(projectDistance(-500)).toBeLessThan(0);
  });
  it('rubber-bands with growing resistance, never exceeding the dimension', () => {
    const a = rubberBand(100, 800);
    const b = rubberBand(200, 800);
    expect(b).toBeGreaterThan(a);
    expect(b - a).toBeLessThan(a);
    expect(rubberBand(100000, 800)).toBeLessThan(800);
  });
});
