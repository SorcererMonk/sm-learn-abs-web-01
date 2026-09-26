/**
 * Motion maths shared by the sites: cubic-bezier evaluation, damped springs,
 * and a generator for CSS linear() easings that approximate a spring.
 */

export type Bezier = [x1: number, y1: number, x2: number, y2: number];

/** y at progress x for a CSS cubic-bezier(x1, y1, x2, y2), solved by bisection on x. */
export function cubicBezierAt([x1, y1, x2, y2]: Bezier, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const coord = (t: number, p1: number, p2: number): number =>
    3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3;
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 40; i += 1) {
    t = (lo + hi) / 2;
    if (coord(t, x1, x2) < x) lo = t;
    else hi = t;
  }
  return coord(t, y1, y2);
}

export interface Spring {
  stiffness: number; // k
  damping: number; // c
  mass: number; // m
}

/** Damping ratio ζ = c / (2√(k·m)). 1 = critically damped, < 1 overshoots. */
export const dampingRatio = ({ stiffness, damping, mass }: Spring): number =>
  damping / (2 * Math.sqrt(stiffness * mass));

/**
 * SwiftUI-style designer parameters → physical spring (mass 1).
 * duration is perceptual (seconds); bounce 0 = critically damped, 0.3 = lively.
 */
export function springFromDurationBounce(duration: number, bounce: number): Spring {
  const stiffness = ((2 * Math.PI) / duration) ** 2;
  const zeta = 1 - bounce;
  return { stiffness, damping: 2 * zeta * Math.sqrt(stiffness), mass: 1 };
}

/**
 * Position of a spring released at 0 heading to 1, optionally with an initial velocity
 * (units of distance per second), integrated with small semi-implicit Euler steps.
 */
export function springSamples(spring: Spring, seconds: number, fps = 240, v0 = 0): number[] {
  const dt = 1 / fps;
  let x = 0;
  let v = v0;
  const out: number[] = [];
  for (let t = 0; t <= seconds + 1e-9; t += dt) {
    out.push(x);
    const force = -spring.stiffness * (x - 1) - spring.damping * v;
    v += (force / spring.mass) * dt;
    x += v * dt;
  }
  return out;
}

/** Seconds until the spring stays within `epsilon` of its target. */
export function settleTime(spring: Spring, epsilon = 0.001, maxSeconds = 10): number {
  const fps = 240;
  const samples = springSamples(spring, maxSeconds, fps);
  let last = samples.length - 1;
  while (last > 0 && Math.abs((samples[last] ?? 1) - 1) < epsilon) last -= 1;
  return Math.min(maxSeconds, (last + 1) / fps);
}

/**
 * CSS linear() approximation of a spring: the settle time becomes the animation
 * duration and the curve is sampled at `points` evenly spaced stops.
 */
export function springToLinear(spring: Spring, points = 32): { easing: string; duration: number } {
  const duration = settleTime(spring);
  const fps = 240;
  const samples = springSamples(spring, duration, fps);
  const stops: string[] = [];
  for (let i = 0; i < points; i += 1) {
    const index = Math.round((i / (points - 1)) * (samples.length - 1));
    const value = i === points - 1 ? 1 : (samples[index] ?? 1);
    stops.push(String(Number(value.toFixed(3))));
  }
  return { easing: `linear(${stops.join(', ')})`, duration: Math.round(duration * 1000) };
}

/**
 * Apple's projection (WWDC 2018 "Designing Fluid Interfaces"): where a flicked object
 * would come to rest under scroll-view deceleration. velocity in px/s.
 */
export const projectDistance = (velocity: number, decelerationRate = 0.998): number =>
  ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);

/** iOS-like rubber-band offset: resistance grows smoothly, never hits a wall. */
export const rubberBand = (distance: number, dimension: number, constant = 0.55): number =>
  (1 - 1 / ((distance * constant) / dimension + 1)) * dimension;
