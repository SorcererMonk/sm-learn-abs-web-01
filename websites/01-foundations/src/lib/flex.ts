/**
 * "Resolve flexible lengths" (CSS Flexbox 1, §9.7) for one line, by hand:
 * distribute positive free space by flex-grow, or negative free space by
 * flex-shrink × flex-base-size, clamp by min/max, freeze violators, repeat.
 */

export interface FlexItem {
  basis: number;
  grow: number;
  shrink: number;
  min?: number;
  max?: number;
}

export interface FlexResult {
  sizes: number[];
  freeSpace: number;
  mode: 'grow' | 'shrink' | 'none';
  log: string[];
}

const round = (n: number): number => Math.round(n * 100) / 100;

export function resolveFlexibleLengths(container: number, items: FlexItem[], gap = 0): FlexResult {
  const log: string[] = [];
  const gaps = gap * Math.max(0, items.length - 1);
  const initialFree = container - gaps - items.reduce((sum, item) => sum + item.basis, 0);
  const mode: FlexResult['mode'] = initialFree > 0 ? 'grow' : initialFree < 0 ? 'shrink' : 'none';
  log.push(
    `Free space = ${container} − gaps ${gaps} − bases ${items.map((i) => i.basis).join(' + ')} = ${round(initialFree)}px → ${mode === 'none' ? 'nothing to distribute' : `use flex-${mode}`}`,
  );

  const clamp = (item: FlexItem, size: number): number =>
    Math.max(item.min ?? 0, Math.min(item.max ?? Infinity, size));
  const sizes = items.map((item) => clamp(item, item.basis));
  const frozen = items.map(
    (item) => mode === 'none' || (mode === 'grow' ? item.grow === 0 : item.shrink === 0),
  );

  for (let round_ = 1; round_ <= items.length + 1 && frozen.includes(false); round_ += 1) {
    const used = items.reduce(
      (sum, item, i) => sum + (frozen[i] ? (sizes[i] ?? 0) : item.basis),
      0,
    );
    let free = container - gaps - used;
    const unfrozen = items.map((_, i) => i).filter((i) => !frozen[i]);
    const factorSum = unfrozen.reduce(
      (s, i) => s + (mode === 'grow' ? (items[i]?.grow ?? 0) : (items[i]?.shrink ?? 0)),
      0,
    );
    if (factorSum < 1) free *= factorSum; // fewer than 1 in total: only that fraction is distributed
    const targets = new Map<number, number>();
    if (mode === 'grow') {
      unfrozen.forEach((i) =>
        targets.set(i, (items[i]?.basis ?? 0) + (free * (items[i]?.grow ?? 0)) / factorSum),
      );
    } else {
      const scaled = unfrozen.map((i) => (items[i]?.shrink ?? 0) * (items[i]?.basis ?? 0));
      const scaledSum = scaled.reduce((a, b) => a + b, 0);
      unfrozen.forEach((i, k) =>
        targets.set(
          i,
          (items[i]?.basis ?? 0) -
            (scaledSum ? (Math.abs(free) * (scaled[k] ?? 0)) / scaledSum : 0),
        ),
      );
    }
    let violation = 0;
    const clamped = new Map<number, number>();
    targets.forEach((target, i) => {
      const item = items[i];
      if (!item) return;
      const c = clamp(item, target);
      clamped.set(i, c);
      violation += c - target;
    });
    log.push(
      `Round ${round_}: free ${round(free)}px shared by ${mode === 'grow' ? 'grow factors' : 'shrink × basis'} → ${[...targets].map(([i, t]) => `item ${i + 1}: ${round(t)}`).join(', ')}`,
    );
    clamped.forEach((c, i) => {
      sizes[i] = c;
      const target = targets.get(i) ?? c;
      if (violation === 0 || (violation > 0 && c > target) || (violation < 0 && c < target))
        frozen[i] = true;
    });
    if (violation !== 0)
      log.push(
        `Min/max violation ${round(violation)}px: freeze the clamped items and redistribute.`,
      );
  }

  return { sizes: sizes.map(round), freeSpace: round(initialFree), mode, log };
}
