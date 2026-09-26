/**
 * The shell for server-rendered lab pages (the pages the lessons load in frames or new tabs).
 * Plain HTML with a tiny stylesheet: these pages are the "real site" in each experiment, so they
 * must stay accessible and honest about what they are.
 */
export const escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

/** JSON for a <script type="application/json"> or inline script: `<` escaped so it can't close the tag. */
export const safeJson = (value: unknown): string =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

export const LAB_CSS = `:root{color-scheme:light dark;--bg:#fbf9f7;--fg:#1d1a19;--muted:#5b5552;--accent:#0e7490;--line:#d6d3d1;--ok:#15803d;--bad:#b91c1c}
@media (prefers-color-scheme:dark){:root{--bg:#141110;--fg:#f5f5f4;--muted:#b8b2ae;--accent:#22d3ee;--line:#44403c;--ok:#4ade80;--bad:#f87171}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:46rem;margin:0 auto;padding:1rem}h1{font-size:1.5rem;line-height:1.2;margin:.25rem 0 .75rem}h2{font-size:1.1rem;margin:1.25rem 0 .5rem}
a{color:var(--accent)}code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.875em}
pre{white-space:pre-wrap;overflow-wrap:anywhere;background:color-mix(in oklab,var(--fg) 7%,transparent);padding:.5rem .75rem;border-radius:.4rem}
button,input,select,textarea{font:inherit}button{padding:.4rem .9rem;border-radius:.4rem;border:1px solid var(--accent);background:var(--accent);color:var(--bg);cursor:pointer}
button.ghost{background:transparent;color:var(--accent)}:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.muted{color:var(--muted)}.ok{color:var(--ok)}.bad{color:var(--bad)}.kicker{font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0}
table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:.25rem .4rem;border-bottom:1px solid var(--line);vertical-align:top}
.card{border:1px solid var(--line);border-radius:.6rem;padding:.75rem 1rem;margin:.75rem 0}`;

export interface LabPageOptions {
  title: string;
  /** Extra markup for <head> (preloads, styles, scripts under test). */
  head?: string;
  body: string;
  lang?: string;
  dir?: 'ltr' | 'rtl';
}

export function labPage({ title, head = '', body, lang = 'en', dir }: LabPageOptions): string {
  return `<!doctype html>
<html lang="${escapeHtml(lang)}"${dir ? ` dir="${dir}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<style>${LAB_CSS}</style>
${head}
</head>
<body>
<main>
${body}
</main>
</body>
</html>`;
}
