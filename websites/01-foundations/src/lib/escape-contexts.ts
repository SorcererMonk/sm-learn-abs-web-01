/**
 * Output contexts in a template, and why HTML escaping alone isn't enough outside HTML text and
 * quoted attributes. For each context: the naive result (HTML-escape and hope), the correct
 * encoding, and whether the naive version is exploitable for a given value.
 */
import { escapeHtml, safeUrl } from '@learn/shared/lib/escape.ts';

export type ContextId = 'text' | 'attr' | 'unquoted' | 'href' | 'script' | 'style';

export interface ContextResult {
  id: ContextId;
  template: string;
  naive: string;
  correct: string;
  /** why the naive output is dangerous for this value, or undefined when it's safe */
  danger?: string;
  fix: string;
}

/** A JavaScript string literal that can't end the script element or break out of the string. */
export const jsString = (value: string): string =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

/** A CSS value accepted only if it's a plain colour keyword, hex or colour function. */
export function safeCssColor(value: string): string {
  const v = value.trim();
  const ok =
    /^#[0-9a-f]{3,8}$/i.test(v) ||
    /^[a-z]+$/i.test(v) ||
    /^(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\([\d\s.,%/+-]+\)$/i.test(v);
  return ok ? v : 'inherit';
}

const DANGEROUS_SCHEME = /^(javascript|data|vbscript):/i;
const stripUrlNoise = (v: string): string =>
  // eslint-disable-next-line no-control-regex
  v.replace(/[\t\n\r]/g, '').replace(/^[\u0000- ]+/, '');

export function analyse(value: string): ContextResult[] {
  const e = escapeHtml(value);
  return [
    {
      id: 'text',
      template: '<p>{{ value }}</p>',
      naive: `<p>${e}</p>`,
      correct: `<p>${e}</p>`,
      fix: 'HTML-escape (& < > " \'). This is the context auto-escaping was designed for.',
    },
    {
      id: 'attr',
      template: '<input value="{{ value }}">',
      naive: `<input value="${e}">`,
      correct: `<input value="${e}">`,
      fix: 'HTML-escape including quotes, and always quote the attribute.',
    },
    {
      id: 'unquoted',
      template: '<input value={{ value }}>',
      naive: `<input value=${e}>`,
      correct: `<input value="${e}">`,
      danger: /[\s/=`]/.test(value)
        ? 'A space ends an unquoted value, so the rest becomes new attributes (e.g. onfocus=…).'
        : undefined,
      fix: 'Quote every attribute. Escaping can’t fix an unquoted context.',
    },
    {
      id: 'href',
      template: '<a href="{{ value }}">link</a>',
      naive: `<a href="${e}">link</a>`,
      correct: `<a href="${escapeHtml(safeUrl(value))}">link</a>`,
      danger: DANGEROUS_SCHEME.test(stripUrlNoise(value))
        ? 'The value is a javascript:/data: URL: escaping keeps it intact, and clicking runs it.'
        : undefined,
      fix: 'Allow only http(s), mailto and relative URLs, then HTML-escape.',
    },
    {
      id: 'script',
      template: '<script>const q = "{{ value }}";</script>',
      naive: `<script>const q = "${e}";</script>`,
      correct: `<script>const q = ${jsString(value)};</script>`,
      danger: value.includes('\\')
        ? 'A backslash escapes the closing quote: the string runs on and the attacker controls code.'
        : /[&<>"']/.test(value)
          ? 'HTML entities are not decoded inside <script>: the data arrives corrupted (&quot; stays literal).'
          : undefined,
      fix: 'Serialise as JSON with < escaped (or better, put data in a data-* attribute or JSON island).',
    },
    {
      id: 'style',
      template: '<div style="color: {{ value }}">',
      naive: `<div style="color: ${e}">`,
      correct: `<div style="color: ${escapeHtml(safeCssColor(value))}">`,
      danger: /[;:{}]|url\(|expression|@import/i.test(value)
        ? 'A ; starts a new declaration: backgrounds with url() can leak data or overlay the page.'
        : undefined,
      fix: 'Validate against an allowlist (a colour, a length), never pass raw text into CSS.',
    },
  ];
}
