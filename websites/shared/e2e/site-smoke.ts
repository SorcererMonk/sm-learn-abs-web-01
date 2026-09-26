/**
 * The end-to-end smoke suite every site runs: each page loads with no console errors (in any
 * frame, after scrolling so lazy iframes render), passes axe (WCAG 2.2 A/AA), has no horizontal
 * overflow at 360px, and every internal link and same-page anchor resolves.
 */
import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Static pages from src/pages plus one route per lesson file. */
export function siteRoutes(siteDir: string): string[] {
  const pages = readdirSync(join(siteDir, 'src/pages'))
    .filter((f) => f.endsWith('.astro') && !f.startsWith('[') && f !== '404.astro')
    .map((f) => (f === 'index.astro' ? '/' : `/${basename(f, '.astro')}/`));
  const learnIndex = readdirSync(join(siteDir, 'src/pages')).includes('learn') ? ['/learn/'] : [];
  let lessons: string[] = [];
  try {
    lessons = readdirSync(join(siteDir, 'src/content/lessons'))
      .filter((f) => /\.mdx?$/.test(f))
      .map((f) => `/learn/${f.replace(/\.mdx?$/, '')}/`);
  } catch {
    // a site without lessons
  }
  return [...pages, ...learnIndex, ...lessons];
}

async function scrollThrough(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(600);
}

export function defineSiteSmokeTests(routes: string[]): void {
  const known = new Set(routes);

  for (const route of routes) {
    test(`${route} loads cleanly, is accessible and links resolve`, async ({ page }, info) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.status(), `HTTP status of ${route}`).toBe(200);
      await scrollThrough(page);
      expect(errors, `console errors on ${route}`).toEqual([]);

      if (info.project.name === 'mobile') {
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, `horizontal overflow at 360px on ${route}`).toBeLessThanOrEqual(0);
        return;
      }

      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .exclude('[inert]') // specimens rendered for inspection, removed from the a11y tree
        // learner-editable sandboxes that often show a mistake on purpose; the frame itself is checked
        .exclude('.playground__preview iframe')
        .analyze();
      const summary = axe.violations.map(
        (v) =>
          `${v.id}: ${v.nodes
            .map((n) => n.target.join(' '))
            .slice(0, 3)
            .join(' | ')}`,
      );
      expect(summary, `axe violations on ${route}`).toEqual([]);

      // document.querySelectorAll doesn't pierce shadow roots, so specimens inside demos are skipped
      const links = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? ''),
      );
      const ids = new Set(
        await page.evaluate(() => [...document.querySelectorAll('[id]')].map((el) => el.id)),
      );
      for (const href of links) {
        if (/^(https?:|mailto:|tel:|javascript:)/.test(href)) continue;
        const [path = '', hash] = href.split('#');
        if (path === '' && hash) {
          expect(ids.has(decodeURIComponent(hash)), `anchor #${hash} on ${route}`).toBe(true);
          continue;
        }
        const clean = path.split('?')[0] ?? '';
        if (clean.startsWith('/') && !/\.\w+$/.test(clean))
          expect(known.has(clean), `internal link ${href} on ${route}`).toBe(true);
      }
    });
  }

  test('keyboard users reach the skip link first and it moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const first = page.locator(':focus');
    await expect(first).toHaveAttribute('href', '#main');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('the theme toggle switches and remembers the colour scheme', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-theme-toggle]');
    await toggle.click();
    const theme = await page.evaluate(() => document.documentElement.dataset.theme ?? 'auto');
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.dataset.theme ?? 'auto')).toBe(theme);
  });
}
