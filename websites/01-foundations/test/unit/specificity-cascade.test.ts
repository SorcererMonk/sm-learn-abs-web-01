import { describe, expect, it } from 'vitest';
import {
  formatSpec,
  nestedSpecificity,
  specificity,
  splitList,
} from '../../src/lib/specificity.ts';
import { cascade, type Declaration } from '../../src/lib/cascade.ts';

const spec = (s: string): string => formatSpec(specificity(s).spec);

describe('specificity', () => {
  it.each([
    ['*', '(0, 0, 0)'],
    ['li', '(0, 0, 1)'],
    ['ul li::marker', '(0, 0, 3)'],
    ['.card', '(0, 1, 0)'],
    ['a[href^="http"]:hover', '(0, 2, 1)'],
    ['#main .nav > a', '(1, 1, 1)'],
    [':is(#a, .b) p', '(1, 0, 1)'],
    [':where(.x) .y', '(0, 1, 0)'],
    ['a:not(.c, #d)', '(1, 0, 1)'],
    ['form:has(:user-invalid)', '(0, 1, 1)'],
    ['li:nth-child(2n of .done)', '(0, 2, 1)'],
    ['p::first-line', '(0, 0, 2)'],
    ['p:first-line', '(0, 0, 2)'],
    ['input[type="checkbox" i]:checked + label', '(0, 2, 2)'],
  ])('%s → %s', (selector, expected) => expect(spec(selector)).toBe(expected));

  it('splits selector lists at top-level commas only', () => {
    expect(splitList('a, :is(b, c), [data-x="1,2"]')).toEqual(['a', ':is(b, c)', '[data-x="1,2"]']);
  });

  it('treats nesting like :is(), which is why an ID in the parent list leaks into every nested rule', () => {
    expect(formatSpec(nestedSpecificity('#hero, .card', '& p'))).toBe('(1, 0, 1)');
    expect(formatSpec(nestedSpecificity('.card', 'p'))).toBe('(0, 1, 1)');
  });
});

const base = (d: Partial<Declaration> & { label: string }): Declaration => ({
  value: d.label,
  origin: 'author',
  specificity: [0, 1, 0],
  order: 0,
  ...d,
});

describe('cascade', () => {
  it('lets an unlayered rule beat a more specific layered rule', () => {
    const result = cascade([
      base({ label: 'layered #id', layer: 0, specificity: [1, 0, 0], order: 1 }),
      base({ label: 'unlayered .class', order: 0 }),
    ]);
    expect(result.ranked[0]?.label).toBe('unlayered .class');
    expect(result.decidedBy).toBe('cascade layers');
  });

  it('reverses layer order for !important (earlier layer wins)', () => {
    const result = cascade([
      base({ label: 'reset !important', layer: 0, important: true }),
      base({ label: 'utilities !important', layer: 3, important: true, order: 5 }),
    ]);
    expect(result.ranked[0]?.label).toBe('reset !important');
  });

  it('puts !important user-agent styles above author !important', () => {
    const result = cascade([
      base({ label: 'author important', important: true }),
      base({ label: 'ua important', origin: 'user-agent', important: true }),
    ]);
    expect(result.ranked[0]?.label).toBe('ua important');
    expect(result.decidedBy).toBe('origin & importance');
  });

  it('prefers the style attribute over any selector within the same origin', () => {
    const result = cascade([
      base({ label: '#id', specificity: [1, 0, 0] }),
      base({ label: 'inline', inline: true }),
    ]);
    expect(result.ranked[0]?.label).toBe('inline');
    expect(result.decidedBy).toBe('element-attached (style attribute)');
  });

  it('uses scope proximity before order of appearance', () => {
    const result = cascade([
      base({ label: 'far scope', proximity: 3, order: 9 }),
      base({ label: 'near scope', proximity: 1, order: 1 }),
    ]);
    expect(result.ranked[0]?.label).toBe('near scope');
    expect(result.decidedBy).toBe('scope proximity');
  });

  it('falls back to order of appearance for otherwise equal declarations', () => {
    const result = cascade([
      base({ label: 'first', order: 1 }),
      base({ label: 'second', order: 2 }),
    ]);
    expect(result.ranked[0]?.label).toBe('second');
    expect(result.decidedBy).toBe('order of appearance');
  });

  it('lets transitions beat everything', () => {
    const result = cascade([
      base({ label: 'author important', important: true }),
      base({ label: 'transition', origin: 'transition' }),
    ]);
    expect(result.ranked[0]?.label).toBe('transition');
  });
});
