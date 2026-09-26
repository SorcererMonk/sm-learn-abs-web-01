import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTokensCss, readTokens, TOKENS_CSS } from '../tools/build-tokens.ts';
import { brokenAliases, tokenDeclarations, type Tree } from '../lib/tokens.ts';

describe('design token pipeline', () => {
  it('committed tokens.css matches tokens.json (run `npm run tokens` after editing)', () => {
    expect(readFileSync(TOKENS_CSS, 'utf8')).toBe(buildTokensCss(readTokens()));
  });
  it('defines the three motion durations the sites use', () => {
    const css = buildTokensCss(readTokens());
    expect(css).toContain('--duration-fast: 150ms;');
    expect(css).toContain('--duration-base: 250ms;');
    expect(css).toContain('--duration-slow: 400ms;');
  });
  it('compiles dark mode with light-dark() and aliases to var()', () => {
    const css = buildTokensCss(readTokens());
    expect(css).toMatch(/--color-text: light-dark\(oklch\(/);
    expect(css).toContain('var(--color-shadow)');
  });
});

describe('pure token helpers', () => {
  const tree: Tree = {
    color: {
      blue: { 600: { $type: 'color', $value: 'oklch(0.5 0.2 260)' } },
      action: {
        $type: 'color',
        $value: '{color.blue.600}',
        $extensions: { 'learn.dark': '{color.blue.300}' },
      },
    },
    space: { m: { $type: 'dimension', $value: '1rem' } },
  };

  it('builds declarations without a fluid group', () => {
    expect(tokenDeclarations(tree)).toEqual([
      '  --color-blue-600: oklch(0.5 0.2 260);',
      '  --color-action: light-dark(var(--color-blue-600), var(--color-blue-300));',
      '  --space-m: 1rem;',
    ]);
  });

  it('reports aliases that point nowhere, including in dark-mode extensions', () => {
    expect(brokenAliases(tree)).toEqual(['color.action → {color.blue.300} does not exist']);
    expect(brokenAliases(readTokens())).toEqual([]);
  });
});
