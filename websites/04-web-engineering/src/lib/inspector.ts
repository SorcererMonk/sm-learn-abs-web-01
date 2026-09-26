/** Types and parsing shared by the HTTP inspector's markup and its client script. */
export interface Preset {
  label: string;
  method?: string;
  path: string;
  headers?: Record<string, string>;
  body?: string;
  via?: 'browser' | 'wire';
  repeat?: number;
  credentials?: RequestCredentials;
  cache?: RequestCache;
}

/** "Name: value" lines → a header record (blank and malformed lines are skipped). */
export function parseHeaderLines(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}
