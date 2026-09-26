/**
 * A teaching-sized <head> linter: the checks from Part 6 (charset first, a zoomable viewport,
 * title and description lengths, lang, canonical, colour scheme, Open Graph, JSON-LD, font
 * preloads). Works on any parsed Document, so it runs in the browser demo and in unit tests.
 */

export type Level = 'error' | 'warn' | 'ok';

export interface Finding {
  level: Level;
  message: string;
}

const meta = (doc: Document, name: string): Element | null =>
  doc.head.querySelector(`meta[name="${name}" i], meta[property="${name}" i]`);

const content = (el: Element | null): string => el?.getAttribute('content')?.trim() ?? '';

function lengthCheck(label: string, text: string, min: number, max: number): Finding {
  if (!text) return { level: 'error', message: `Missing ${label}.` };
  if (text.length < min)
    return {
      level: 'warn',
      message: `${label} is ${text.length} characters: say more (aim ${min}–${max}).`,
    };
  if (text.length > max)
    return {
      level: 'warn',
      message: `${label} is ${text.length} characters: it will be truncated (aim ${min}–${max}).`,
    };
  return { level: 'ok', message: `${label} is ${text.length} characters.` };
}

export function auditHead(doc: Document): Finding[] {
  const findings: Finding[] = [];
  const add = (level: Level, message: string): void => void findings.push({ level, message });
  const head = doc.head;
  const first = head.firstElementChild;

  const charset = head.querySelector('meta[charset]');
  if (!charset) add('error', 'Missing <meta charset="utf-8">.');
  else if (charset !== first)
    add(
      'warn',
      '<meta charset> should be the first element in <head> (within the first 1024 bytes).',
    );
  else add('ok', 'charset is declared first.');

  const viewport = content(meta(doc, 'viewport')).toLowerCase();
  if (!viewport)
    add('error', 'Missing viewport meta: mobile browsers will render at 980px and zoom out.');
  else {
    if (!viewport.includes('width=device-width'))
      add('warn', 'viewport should include width=device-width.');
    if (
      /user-scalable\s*=\s*(no|0)/.test(viewport) ||
      /maximum-scale\s*=\s*1(\.0*)?\b/.test(viewport)
    )
      add(
        'error',
        'viewport blocks zooming (user-scalable=no or maximum-scale=1): fails WCAG 1.4.4.',
      );
    else add('ok', 'viewport allows zooming.');
  }

  const lang = doc.documentElement.getAttribute('lang');
  if (!lang)
    add('error', 'Missing lang on <html>: affects pronunciation, hyphenation and translation.');
  else add('ok', `lang="${lang}".`);

  findings.push(lengthCheck('<title>', doc.title.trim(), 10, 60));
  findings.push(lengthCheck('meta description', content(meta(doc, 'description')), 50, 160));

  const canonical = head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
  if (!canonical)
    add(
      'warn',
      'No canonical link: duplicate URLs (tracking parameters, trailing slashes) split ranking.',
    );
  else if (!/^https?:\/\//.test(canonical)) add('warn', 'canonical should be an absolute URL.');
  else add('ok', 'canonical is absolute.');

  if (!meta(doc, 'color-scheme'))
    add(
      'warn',
      'No color-scheme meta: dark-mode users get a white flash and light form controls before CSS loads.',
    );
  else add('ok', `color-scheme: ${content(meta(doc, 'color-scheme'))}.`);

  if (!head.querySelector('link[rel~="icon"]')) add('warn', 'No icon link.');

  const og = ['og:title', 'og:description', 'og:image', 'og:url'].filter(
    (p) => !content(meta(doc, p)),
  );
  if (og.length) add('warn', `Missing Open Graph: ${og.join(', ')}. Share cards will be guessed.`);
  else add('ok', 'Open Graph basics present.');
  if (content(meta(doc, 'og:image')) && !content(meta(doc, 'og:image:alt')))
    add('warn', 'og:image has no og:image:alt.');

  head.querySelectorAll('script[type="application/ld+json"]').forEach((script, i) => {
    try {
      const data: unknown = JSON.parse(script.textContent ?? '');
      const node = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
      if (!node || !node['@context'] || !node['@type'])
        add('warn', `JSON-LD block ${i + 1} is missing @context or @type.`);
      else add('ok', `JSON-LD block ${i + 1}: ${String(node['@type'])}.`);
    } catch {
      add('error', `JSON-LD block ${i + 1} is not valid JSON.`);
    }
  });

  head.querySelectorAll('link[rel="preload"]').forEach((link) => {
    const as = link.getAttribute('as');
    if (!as)
      add(
        'error',
        `preload of ${link.getAttribute('href')} has no "as": it will be fetched twice.`,
      );
    if (as === 'font' && !link.hasAttribute('crossorigin'))
      add(
        'error',
        `Font preload ${link.getAttribute('href')} needs crossorigin, or it is fetched twice.`,
      );
  });

  if (content(meta(doc, 'generator')))
    add('warn', 'meta generator advertises your stack to attackers.');

  return findings;
}
