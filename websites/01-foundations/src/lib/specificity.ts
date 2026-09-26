/**
 * Selector specificity per Selectors Level 4, with an explanation of every part:
 * IDs (a), classes/attributes/pseudo-classes (b), types/pseudo-elements (c).
 * :is()/:not()/:has() take their most specific argument, :where() is always zero,
 * :nth-child(An+B of S) adds S, and nesting (&) behaves like :is(parent list).
 */

export type Spec = [a: number, b: number, c: number];

export interface SpecPart {
  text: string;
  kind: string;
  spec: Spec;
}

export interface SpecResult {
  selector: string;
  spec: Spec;
  parts: SpecPart[];
}

const ZERO: Spec = [0, 0, 0];
const add = (x: Spec, y: Spec): Spec => [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
export const compareSpec = (x: Spec, y: Spec): number => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
export const maxSpec = (specs: Spec[]): Spec =>
  specs.reduce<Spec>((best, s) => (compareSpec(s, best) > 0 ? s : best), ZERO);
export const formatSpec = ([a, b, c]: Spec): string => `(${a}, ${b}, ${c})`;

const LEGACY_PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);
const IDENT = /^-?[_a-zA-Z\u00A0-\uFFFF][-_a-zA-Z0-9\u00A0-\uFFFF]*/;

/** Splits a selector list at top-level commas (not inside parentheses, brackets or quotes). */
export function splitList(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = '';
  let current = '';
  for (const ch of list) {
    if (quote) {
      if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth -= 1;
    else if (ch === ',' && depth === 0) {
      out.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function readBalanced(input: string, start: number, open: string, close: string): [string, number] {
  let depth = 0;
  let quote = '';
  for (let i = start; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return [input.slice(start + 1, i), i + 1];
    }
  }
  throw new Error(`Unbalanced ${open}${close} in "${input}"`);
}

const listMax = (list: string): Spec => maxSpec(splitList(list).map((s) => specificity(s).spec));

/** Specificity of one complex selector (use splitList first for a selector list). */
export function specificity(selector: string): SpecResult {
  const parts: SpecPart[] = [];
  let i = 0;
  const s = selector.trim();
  while (i < s.length) {
    const ch = s[i] ?? '';
    if (/\s|>|\+|~|\|/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === '*' || ch === '&') {
      parts.push({
        text: ch,
        kind: ch === '*' ? 'universal (counts zero)' : 'nesting & (see nested)',
        spec: ZERO,
      });
      i += 1;
      continue;
    }
    if (ch === '#' || ch === '.') {
      const name = IDENT.exec(s.slice(i + 1))?.[0] ?? '';
      parts.push({
        text: ch + name,
        kind: ch === '#' ? 'ID' : 'class',
        spec: ch === '#' ? [1, 0, 0] : [0, 1, 0],
      });
      i += 1 + name.length;
      continue;
    }
    if (ch === '[') {
      const [inner, end] = readBalanced(s, i, '[', ']');
      parts.push({ text: `[${inner}]`, kind: 'attribute', spec: [0, 1, 0] });
      i = end;
      continue;
    }
    if (ch === ':') {
      const element = s[i + 1] === ':';
      const nameStart = i + (element ? 2 : 1);
      const name = IDENT.exec(s.slice(nameStart))?.[0] ?? '';
      let end = nameStart + name.length;
      let arg: string | undefined;
      if (s[end] === '(') [arg, end] = readBalanced(s, end, '(', ')');
      const text = s.slice(i, end);
      const lower = name.toLowerCase();
      if (element || LEGACY_PSEUDO_ELEMENTS.has(lower)) {
        const extra = lower === 'slotted' && arg ? listMax(arg) : ZERO; // ::slotted(S) adds S
        parts.push({ text, kind: 'pseudo-element', spec: add([0, 0, 1], extra) });
      } else if (lower === 'where') {
        parts.push({ text, kind: ':where() is always zero', spec: ZERO });
      } else if (['is', 'not', 'has', 'matches', '-webkit-any'].includes(lower)) {
        parts.push({
          text,
          kind: `:${lower}() takes its most specific argument`,
          spec: arg ? listMax(arg) : ZERO,
        });
      } else if ((lower === 'nth-child' || lower === 'nth-last-child') && arg && / of /.test(arg)) {
        parts.push({
          text,
          kind: 'pseudo-class + "of S" argument',
          spec: add([0, 1, 0], listMax(arg.split(/ of /)[1] ?? '')),
        });
      } else if ((lower === 'host' || lower === 'host-context') && arg) {
        parts.push({ text, kind: 'pseudo-class + argument', spec: add([0, 1, 0], listMax(arg)) });
      } else {
        parts.push({ text, kind: 'pseudo-class', spec: [0, 1, 0] });
      }
      i = end;
      continue;
    }
    const ident = IDENT.exec(s.slice(i))?.[0];
    if (ident) {
      parts.push({ text: ident, kind: 'type', spec: [0, 0, 1] });
      i += ident.length;
      continue;
    }
    i += 1; // anything else (namespace bars, stray characters) counts zero
  }
  return { selector: s, spec: parts.reduce<Spec>((acc, p) => add(acc, p.spec), ZERO), parts };
}

/** A nested rule's specificity: `&` means :is(parent list), so it contributes the parent's maximum. */
export function nestedSpecificity(parentList: string, nested: string): Spec {
  const withParent = nested.includes('&') ? nested : `& ${nested}`;
  return specificity(withParent.replace(/&/g, `:is(${parentList})`)).spec;
}
