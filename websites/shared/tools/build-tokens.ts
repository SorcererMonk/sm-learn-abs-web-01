/**
 * Writes shared/styles/tokens.css from shared/tokens/tokens.json using the pure pipeline in
 * lib/tokens.ts. Run: node shared/tools/build-tokens.ts  (Node strips the types natively)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildTokensCss, type Tree } from '../lib/tokens.ts';

export { buildTokensCss, flatten } from '../lib/tokens.ts';

export const TOKENS_JSON = fileURLToPath(new URL('../tokens/tokens.json', import.meta.url));
export const TOKENS_CSS = fileURLToPath(new URL('../styles/tokens.css', import.meta.url));

export const readTokens = (): Tree => JSON.parse(readFileSync(TOKENS_JSON, 'utf8')) as Tree;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(TOKENS_CSS, buildTokensCss(readTokens()));
  console.info(`Wrote ${TOKENS_CSS}`);
}
