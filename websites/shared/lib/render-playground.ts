/**
 * Live HTML/CSS/JS playground markup. The preview is a sandboxed iframe (allow-scripts, plus
 * allow-forms only when a lesson needs real form submission; never allow-same-origin), rendered with srcdoc at build time so it works without JavaScript.
 * client/playground.ts adds tabs, live re-rendering, reset/solution and a console bridge.
 */
import { escapeHtml } from './escape.ts';
import { renderInline } from './inline-md.ts';

export interface PlaygroundFiles {
  html?: string;
  css?: string;
  js?: string;
}

export interface PlaygroundProps extends PlaygroundFiles {
  id: string;
  title: string;
  task?: string;
  solution?: PlaygroundFiles;
  height?: string;
  /** allow form submission inside the preview (validation bubbles, method="dialog") */
  forms?: boolean;
}

/** Split so the literal never closes an inline <script> if this module is ever inlined. */
const END_SCRIPT = '</' + 'script>';

const PREVIEW_BASE = `*,*::before,*::after{box-sizing:border-box}html{color-scheme:light;font-family:system-ui,sans-serif;line-height:1.5;color:#1d1a19;background:#fff}body{margin:1rem}img{max-width:100%;display:block}`;

/** The console bridge: forwards console calls and errors to the parent with postMessage. */
const bridge = (id: string): string =>
  `<script>(()=>{const s=(level,args)=>parent.postMessage({pg:${JSON.stringify(id)},level,text:args.map(a=>{try{return typeof a==='string'?a:JSON.stringify(a)}catch{return String(a)}}).join(' ')},'*');for(const l of ['log','info','warn','error']){const o=console[l];console[l]=(...a)=>{s(l,a);o.apply(console,a)}}addEventListener('error',e=>s('error',[e.message]));addEventListener('unhandledrejection',e=>s('error',['Unhandled rejection: '+(e.reason&&e.reason.message||e.reason)]))})()${END_SCRIPT}`;

export function composeDocument(id: string, files: PlaygroundFiles): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${PREVIEW_BASE}</style><style>${files.css ?? ''}</style></head><body>${files.html ?? ''}${bridge(id)}${files.js ? `<script type="module">${files.js}${END_SCRIPT}` : ''}</body></html>`;
}

export function renderPlayground(props: PlaygroundProps): string {
  const { id, title, task, solution, height, forms } = props;
  const langs = (['html', 'css', 'js'] as const).filter((lang) => props[lang] !== undefined);
  const tabs = langs
    .map(
      (lang, i) =>
        `<button type="button" role="tab" id="${id}-tab-${lang}" aria-controls="${id}-panel-${lang}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${lang.toUpperCase()}</button>`,
    )
    .join('');
  const panels = langs
    .map(
      (lang) =>
        `<div role="tabpanel" id="${id}-panel-${lang}" aria-labelledby="${id}-tab-${lang}" class="playground__panel"><label class="visually-hidden" for="${id}-${lang}">${lang.toUpperCase()} source for ${escapeHtml(title)}</label><textarea id="${id}-${lang}" data-lang="${lang}" spellcheck="false" autocapitalize="off" autocomplete="off" data-initial="${escapeHtml(props[lang] ?? '')}">${escapeHtml(props[lang] ?? '')}</textarea></div>`,
    )
    .join('');
  const solutionAttr = solution ? ` data-solution="${escapeHtml(JSON.stringify(solution))}"` : '';
  const doc = composeDocument(id, props);
  return `<div class="demo" data-playground="${escapeHtml(id)}"${solutionAttr}${height ? ` style="--pg-height:${escapeHtml(height)}"` : ''}>
<div class="demo__header"><span class="demo__badge">Playground</span><h4 class="demo__title">${renderInline(title)}</h4></div>
${task ? `<div class="demo__body"><p><strong>Task:</strong> ${renderInline(task)}</p></div>` : ''}
<div class="playground">
<div class="playground__editor"><div class="tabs" role="tablist" aria-label="Source files">${tabs}</div>${panels}</div>
<div class="playground__preview"><div class="playground__bar"><span class="muted">Live preview (sandboxed)</span><span class="cluster"><button type="button" class="btn btn--small btn--ghost" data-pg-reset hidden>Reset</button>${solution ? '<button type="button" class="btn btn--small btn--ghost" data-pg-solution hidden>Show solution</button>' : ''}</span></div>
<iframe title="Preview: ${escapeHtml(title)}" sandbox="allow-scripts${forms ? ' allow-forms' : ''}" loading="lazy" srcdoc="${escapeHtml(doc)}"></iframe>
<pre class="playground__console" aria-live="polite" aria-label="Console output"></pre></div>
</div></div>`;
}
