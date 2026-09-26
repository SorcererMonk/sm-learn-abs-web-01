/**
 * An auto-escaping HTML tagged template, the core safety feature of every server template
 * language: interpolated values are escaped for HTML text and quoted attributes unless they
 * were produced by `html` itself or explicitly marked with `raw()`.
 */
import { escapeHtml } from '@learn/shared/lib/escape.ts';

const SAFE = Symbol('safe-html');

export interface SafeHtml {
  readonly [SAFE]: true;
  readonly value: string;
}

const isSafe = (v: unknown): v is SafeHtml => typeof v === 'object' && v !== null && SAFE in v;

/** Marks trusted markup as already safe. Every call to raw() is a hole you cut on purpose. */
export const raw = (value: string): SafeHtml => ({ [SAFE]: true, value });

function interpolate(value: unknown): string {
  if (value === null || value === undefined || value === false) return '';
  if (isSafe(value)) return value.value;
  if (Array.isArray(value)) return value.map(interpolate).join('');
  return escapeHtml(String(value));
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
  let out = strings[0] ?? '';
  values.forEach((value, i) => {
    out += interpolate(value) + (strings[i + 1] ?? '');
  });
  return raw(out);
}

export const render = (fragment: SafeHtml): string => fragment.value;
