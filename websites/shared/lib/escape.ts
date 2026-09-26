/** Context-aware escaping for HTML text and quoted attribute values. */
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);

/**
 * Only http(s), mailto, fragment and relative URLs survive; `javascript:` and `data:` do not.
 * Like the URL parser, strip tabs and newlines anywhere and control characters at the ends
 * first, so `java\tscript:` can't sneak past as a "relative" URL.
 */
export function safeUrl(url: string): string {
  // eslint-disable-next-line no-control-regex
  const trimmed = url.replace(/[\t\n\r]/g, '').replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '');
  if (/^(https?:|mailto:|#|\/|\.\.?\/)/i.test(trimmed)) return trimmed;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed; // relative path
  return '#';
}
