/**
 * An allowlist HTML sanitiser for user content, the way DOMPurify, sanitize-html and bleach
 * work: parse into an inert document, keep only known-safe elements and attributes, drop
 * dangerous subtrees entirely, unwrap everything else, and harden links.
 */
import { safeUrl } from '@learn/shared/lib/escape.ts';

const ALLOWED = new Set([
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'code',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'h3',
  'h4',
]);
/** Removed with their contents: they execute, load or embed things. */
const DROP = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'svg',
  'math',
  'template',
  'noscript',
  'link',
  'meta',
  'base',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'video',
  'audio',
  'img',
]);
const ALLOWED_ATTRS: Record<string, string[]> = { a: ['href', 'title'] };

export interface SanitizeResult {
  html: string;
  removed: string[];
}

/** `parse` is DOMParser-like, injected so the function runs in browsers and in tests. */
export function sanitizeHtml(
  input: string,
  parse: (markup: string) => Document = (m) => new DOMParser().parseFromString(m, 'text/html'),
): SanitizeResult {
  const doc = parse(`<body>${input}</body>`);
  const removed: string[] = [];

  const clean = (node: Element): void => {
    for (const child of [...node.children]) {
      const tag = child.localName;
      if (DROP.has(tag)) {
        removed.push(`<${tag}> and its contents`);
        child.remove();
        continue;
      }
      clean(child);
      if (!ALLOWED.has(tag)) {
        removed.push(`<${tag}> (kept its text)`);
        child.replaceWith(...child.childNodes);
        continue;
      }
      for (const attr of [...child.attributes]) {
        const allowed = ALLOWED_ATTRS[tag]?.includes(attr.name);
        if (!allowed) {
          removed.push(`${attr.name}="${attr.value}" on <${tag}>`);
          child.removeAttribute(attr.name);
        }
      }
      if (tag === 'a') {
        const href = child.getAttribute('href');
        if (href !== null && safeUrl(href) === '#' && href.trim() !== '#') {
          removed.push(`unsafe href "${href}"`);
          child.removeAttribute('href');
        }
        child.setAttribute('rel', 'ugc nofollow noopener');
      }
    }
  };

  clean(doc.body);
  // comments can hide conditional markup for old parsers: drop them too
  const walker = doc.createTreeWalker(doc.body, 128 /* NodeFilter.SHOW_COMMENT */);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((c) => c.parentNode?.removeChild(c));

  return { html: doc.body.innerHTML, removed };
}
