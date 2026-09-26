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

/** Only http(s), mailto, fragment and relative URLs survive; `javascript:` and `data:` do not. */
export function safeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:|mailto:|#|\/|\.\.?\/)/i.test(trimmed)) return trimmed;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed; // relative path
  return '#';
}
