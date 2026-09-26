/**
 * Minimal inline Markdown -> HTML for the curriculum's prose: `code`, **bold**,
 * *italic*, [links](url). Everything else is escaped, so source text can never inject markup.
 */
import { escapeHtml, safeUrl } from './escape.ts';

function renderEmphasis(escaped: string): string {
  return escaped
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, href: string) => {
      const url = safeUrl(href.replace(/&amp;/g, '&'));
      const external = /^https?:/i.test(url);
      return `<a href="${escapeHtml(url)}"${external ? ' rel="noopener"' : ''}>${text}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?!\w)/g, '$1<em>$2</em>');
}

export function renderInline(text: string): string {
  // Split out code spans first so their contents are never treated as emphasis.
  return text
    .split(/(`[^`]+`)/g)
    .map((part) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 1
        ? `<code>${escapeHtml(part.slice(1, -1))}</code>`
        : renderEmphasis(escapeHtml(part)),
    )
    .join('');
}

/** Plain text for aria-labels, titles and search indexes. */
export const stripInline = (text: string): string =>
  text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
