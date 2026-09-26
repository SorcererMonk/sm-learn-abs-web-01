import { describe, expect, it } from 'vitest';
import { dynamicImports, staticImports } from '../tools/budget.ts';

describe('JS budget import parsing', () => {
  const code =
    'import{t as e}from"./store.js";import"./side.js";export{x}from\'./re.js\';' +
    'const a=()=>import(`./lazy.js`);function f(){return import("./other.js")}';

  it('finds static imports and re-exports, but not dynamic ones', () => {
    expect(staticImports(code)).toEqual(['./store.js', './side.js', './re.js']);
  });

  it('finds dynamic imports with any quote style', () => {
    expect(dynamicImports(code)).toEqual(['./lazy.js', './other.js']);
  });
});
