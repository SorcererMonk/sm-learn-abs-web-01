/**
 * Per-viewer persistence in localStorage, namespaced per site. Storage can be unavailable
 * (private mode, blocked site data), so every access is guarded and the UI works without it.
 */

const PREFIX = 'learn:';

export function siteKey(): string {
  return document.documentElement.dataset.site ?? 'site';
}

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}${siteKey()}:${key}`);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(`${PREFIX}${siteKey()}:${key}`, JSON.stringify(value));
  } catch {
    // Storage full or blocked: progress simply isn't remembered.
  }
  document.dispatchEvent(new CustomEvent('learn:store', { detail: { key } }));
}

/** A boolean map stored under one key, e.g. completed lessons or ticked checklist items. */
export function flagSet(key: string): {
  has: (id: string) => boolean;
  set: (id: string, on: boolean) => void;
  size: () => number;
} {
  return {
    has: (id) => Boolean(read<Record<string, boolean>>(key, {})[id]),
    set: (id, on) => {
      const all = read<Record<string, boolean>>(key, {});
      if (on) all[id] = true;
      else delete all[id];
      write(key, all);
    },
    size: () => Object.keys(read<Record<string, boolean>>(key, {})).length,
  };
}

/** Everything this site stored, for the export/import panel. */
export function exportAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try {
    const prefix = `${PREFIX}${siteKey()}:`;
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) out[key.slice(prefix.length)] = JSON.parse(localStorage.getItem(key) ?? 'null');
    }
  } catch {
    // ignore
  }
  return out;
}

export function importAll(data: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(data)) write(key, value);
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
