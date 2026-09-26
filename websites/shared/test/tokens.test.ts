import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTokensCss, readTokens, TOKENS_CSS } from '../tools/build-tokens.ts';

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
