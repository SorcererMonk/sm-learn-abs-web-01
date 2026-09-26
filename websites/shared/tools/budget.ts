/**
 * JavaScript budget per page: inline scripts + external module scripts + everything they
 * import statically (the JS that must load before a page is interactive), gzipped. Dynamic
 * import() chunks are reported separately as lazy. Fails if any page exceeds the budget.
 *
 * Run: node shared/tools/budget.ts --site 01-foundations [--max 150]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

/** Specifiers of static `import … from`, bare `import "…"` and `export … from` statements. */
export function staticImports(code: string): string[] {
  const out = new Set<string>();
  const re = /(?:^|[;\s}])(?:import|export)\s*(?:[\w*{}\s,$]+?\s*from\s*)?["'`]([^"'`]+)["'`]/g;
  for (const m of code.matchAll(re)) if (m[1]) out.add(m[1]);
  return [...out];
}

/** Specifiers of dynamic `import("…")` calls. */
export function dynamicImports(code: string): string[] {
  return [...code.matchAll(/import\(\s*["'`]([^"'`]+)["'`]\s*\)/g)].map((m) => m[1] ?? '');
}

export interface PageBudget {
  page: string;
  initialGzip: number;
  lazyGzip: number;
  files: string[];
}

const gz = (text: string): number => gzipSync(text).length;

export function measurePage(htmlFile: string, distDir: string): PageBudget {
  const html = readFileSync(htmlFile, 'utf8');
  const files = new Set<string>();
  let initial = 0;
  // inline scripts (skip JSON/LD and other non-JS types)
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1] ?? '';
    if (/type=["'](?!module|text\/javascript)[^"']+["']/.test(attrs)) continue;
    initial += gz(m[2] ?? '');
  }
  const lazy = new Set<string>();
  const visit = (file: string): void => {
    if (files.has(file)) return;
    files.add(file);
    const code = readFileSync(file, 'utf8');
    initial += gz(code);
    for (const spec of staticImports(code)) visit(resolve(dirname(file), spec));
    for (const spec of dynamicImports(code)) lazy.add(resolve(dirname(file), spec));
  };
  for (const m of html.matchAll(/<script[^>]*\bsrc=["']([^"']+\.js)["'][^>]*>/g)) {
    visit(join(distDir, (m[1] ?? '').replace(/^\//, '')));
  }
  let lazyGzip = 0;
  for (const file of lazy) if (!files.has(file)) lazyGzip += gz(readFileSync(file, 'utf8'));
  return {
    page: relative(distDir, htmlFile),
    initialGzip: initial,
    lazyGzip,
    files: [...files].map((f) => relative(distDir, f)),
  };
}

export function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const site = args[args.indexOf('--site') + 1] ?? '';
  const max = Number(args.includes('--max') ? args[args.indexOf('--max') + 1] : 150) * 1024;
  const dist = resolve(fileURLToPath(new URL('../..', import.meta.url)), site, 'dist');
  const results = htmlFiles(dist)
    .map((f) => measurePage(f, dist))
    .sort((a, b) => b.initialGzip - a.initialGzip);
  const kb = (n: number): string => `${(n / 1024).toFixed(1)} KB`;
  for (const r of results.slice(0, 8))
    console.info(
      `${kb(r.initialGzip).padStart(9)} initial · ${kb(r.lazyGzip).padStart(8)} lazy · ${r.page}`,
    );
  const over = results.filter((r) => r.initialGzip > max);
  console.info(
    `${results.length} pages; largest ${kb(results[0]?.initialGzip ?? 0)} of ${kb(max)} budget.`,
  );
  if (over.length) {
    console.error(`Over budget: ${over.map((r) => r.page).join(', ')}`);
    process.exit(1);
  }
}
