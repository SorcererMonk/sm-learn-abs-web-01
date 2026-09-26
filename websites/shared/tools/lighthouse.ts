/**
 * Lighthouse on a built site with the default mobile profile (Moto G Power emulation,
 * simulated slow 4G, 4× CPU slowdown). Serves dist/ with the static server, audits a set of
 * routes, prints the four category scores and fails if any score is below the threshold.
 *
 * Run: node shared/tools/lighthouse.ts --site 01-foundations [--min 90] [/route/ …]
 */
import { chromium } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.ts';

const DEFAULT_ROUTES = ['/', '/learn/', '/dojo/'];
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'] as const;

const args = process.argv.slice(2);
const flag = (name: string, fallback: string): string =>
  args.includes(name) ? (args[args.indexOf(name) + 1] ?? fallback) : fallback;
const site = flag('--site', '');
const min = Number(flag('--min', '90'));
const extra = args.filter((a) => a.startsWith('/'));
const routes = extra.length ? extra : DEFAULT_ROUTES;

const port = 4390;
const root = resolve(fileURLToPath(new URL('../..', import.meta.url)), site, 'dist');
const server = serve(root, port);
const chrome = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

let failed = false;
try {
  for (const route of routes) {
    const result = await lighthouse(`http://localhost:${port}${route}`, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: [...CATEGORIES],
    });
    const scores = CATEGORIES.map(
      (c) => [c, Math.round((result?.lhr.categories[c]?.score ?? 0) * 100)] as const,
    );
    const low = scores.filter(([, s]) => s < min);
    if (low.length) failed = true;
    const audits = result?.lhr.audits ?? {};
    const metric = (id: string): string => audits[id]?.displayValue ?? '–';
    console.info(
      `${route.padEnd(44)} ${scores.map(([c, s]) => `${c} ${s}`).join(' · ')}  ` +
        `(LCP ${metric('largest-contentful-paint')}, CLS ${metric('cumulative-layout-shift')}, TBT ${metric('total-blocking-time')})`,
    );
    const verbose = args.includes('--verbose');
    for (const [c] of verbose ? scores.filter(([, s]) => s < 100) : low) {
      const refs = result?.lhr.categories[c]?.auditRefs ?? [];
      const failing = refs
        .map((r) => audits[r.id])
        .filter(
          (a) => a && a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative',
        )
        .map((a) => `   - ${a?.id}: ${a?.displayValue ?? a?.title}`);
      console.info(`  ${c}:\n${failing.slice(0, 8).join('\n')}`);
    }
  }
} finally {
  await chrome.kill();
  server.close();
}
if (failed) process.exit(1);
