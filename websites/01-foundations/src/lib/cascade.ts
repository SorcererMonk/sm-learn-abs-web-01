/**
 * The cascade as a sort (CSS Cascade 5/6). For one property on one element, gather the
 * declarations, sort by: origin & importance → context (shadow) → element-attached (style="")
 * → cascade layers → specificity → scope proximity → order of appearance. First one wins.
 */
import { compareSpec, type Spec } from './specificity.ts';

export type Origin = 'user-agent' | 'user' | 'author' | 'animation' | 'transition';

export interface Declaration {
  label: string;
  value: string;
  origin: Origin;
  important?: boolean;
  /** true for declarations in the style attribute */
  inline?: boolean;
  /** layer position in declaration order (0 = first declared); undefined = unlayered */
  layer?: number;
  specificity: Spec;
  /** hops from the nearest @scope root; undefined = not scoped (treated as infinitely far) */
  proximity?: number;
  order: number;
}

/** Higher = wins. Important reverses the origin order (user-agent !important beats everything but transitions). */
function originRank(d: Declaration): number {
  if (d.origin === 'transition') return 8;
  if (d.origin === 'animation') return 4;
  const normal = { 'user-agent': 1, user: 2, author: 3 } as const;
  const important = { author: 5, user: 6, 'user-agent': 7 } as const;
  return d.important ? important[d.origin] : normal[d.origin];
}

/** Layer rank: normal → unlayered beats all, later layers beat earlier; !important reverses that. */
function layerRank(d: Declaration): number {
  const unlayered = Number.MAX_SAFE_INTEGER;
  if (!d.important) return d.layer === undefined ? unlayered : d.layer;
  return d.layer === undefined ? -1 : unlayered - d.layer;
}

export type Step =
  | 'origin & importance'
  | 'element-attached (style attribute)'
  | 'cascade layers'
  | 'specificity'
  | 'scope proximity'
  | 'order of appearance';

/** Compares two declarations; returns [winner-first sign, deciding step]. */
export function compareDeclarations(a: Declaration, b: Declaration): [number, Step] {
  const pa = a.proximity ?? Infinity;
  const pb = b.proximity ?? Infinity;
  const checks: [number, Step][] = [
    [originRank(a) - originRank(b), 'origin & importance'],
    [Number(Boolean(a.inline)) - Number(Boolean(b.inline)), 'element-attached (style attribute)'],
    [Math.sign(layerRank(a) - layerRank(b)), 'cascade layers'],
    [compareSpec(a.specificity, b.specificity), 'specificity'],
    [pa === pb ? 0 : pa < pb ? 1 : -1, 'scope proximity'],
    [a.order - b.order, 'order of appearance'],
  ];
  for (const [diff, step] of checks) if (diff !== 0) return [diff, step];
  return [0, 'order of appearance'];
}

export interface CascadeResult {
  ranked: Declaration[];
  /** which cascade step separated the winner from the runner-up */
  decidedBy?: Step;
}

export function cascade(declarations: Declaration[]): CascadeResult {
  const ranked = [...declarations].sort((a, b) => -compareDeclarations(a, b)[0]);
  const [winner, runner] = ranked;
  return {
    ranked,
    decidedBy: winner && runner ? compareDeclarations(winner, runner)[1] : undefined,
  };
}
