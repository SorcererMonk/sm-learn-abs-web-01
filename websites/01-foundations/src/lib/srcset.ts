/**
 * How a browser picks a responsive image candidate: evaluate `sizes` against the viewport
 * to get the slot width, multiply by device pixel ratio, then choose the smallest `w`
 * candidate that covers it (browsers may reuse a larger cached file; this models a cold load).
 */

export interface Candidate {
  url: string;
  width?: number; // w descriptor
  density?: number; // x descriptor
}

export function parseSrcset(srcset: string): Candidate[] {
  return srcset
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [url = '', descriptor = '1x'] = part.split(/\s+/);
      if (descriptor.endsWith('w')) return { url, width: Number(descriptor.slice(0, -1)) };
      return { url, density: Number(descriptor.replace('x', '')) || 1 };
    });
}

function lengthToPx(value: string, viewport: number): number {
  const v = value.trim();
  const num = parseFloat(v);
  if (v.endsWith('vw')) return (num / 100) * viewport;
  if (v.endsWith('rem') || v.endsWith('em')) return num * 16;
  return num;
}

function mediaMatches(condition: string, viewport: number): boolean {
  const c = condition.replace(/[()]/g, '').trim();
  let m = /^max-width:\s*(\S+)$/.exec(c);
  if (m) return viewport <= lengthToPx(m[1] ?? '0', viewport);
  m = /^min-width:\s*(\S+)$/.exec(c);
  if (m) return viewport >= lengthToPx(m[1] ?? '0', viewport);
  m = /^width\s*(<=|>=|<|>)\s*(\S+)$/.exec(c);
  if (m) {
    const px = lengthToPx(m[2] ?? '0', viewport);
    return { '<=': viewport <= px, '>=': viewport >= px, '<': viewport < px, '>': viewport > px }[
      m[1] as '<=' | '>=' | '<' | '>'
    ];
  }
  return false;
}

/** Slot width in CSS px from a `sizes` attribute such as "(max-width: 600px) 100vw, 50vw". */
export function evaluateSizes(sizes: string, viewport: number): number {
  for (const entry of sizes.split(',').map((s) => s.trim())) {
    const match = /^(\(.+\))\s+(.+)$/.exec(entry);
    if (!match) return lengthToPx(entry, viewport);
    if (mediaMatches(match[1] ?? '', viewport)) return lengthToPx(match[2] ?? '0', viewport);
  }
  return viewport;
}

export interface Choice {
  candidate: Candidate;
  slot: number;
  needed: number;
}

export function chooseCandidate(
  srcset: string,
  sizes: string,
  viewport: number,
  dpr: number,
): Choice | undefined {
  const candidates = parseSrcset(srcset);
  const slot = evaluateSizes(sizes, viewport);
  const needed = slot * dpr;
  const widthed = candidates
    .filter((c) => c.width !== undefined)
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  if (widthed.length) {
    const candidate = widthed.find((c) => (c.width ?? 0) >= needed) ?? widthed.at(-1);
    return candidate && { candidate, slot, needed };
  }
  const densities = candidates.sort((a, b) => (a.density ?? 1) - (b.density ?? 1));
  const candidate = densities.find((c) => (c.density ?? 1) >= dpr) ?? densities.at(-1);
  return candidate && { candidate, slot, needed };
}
