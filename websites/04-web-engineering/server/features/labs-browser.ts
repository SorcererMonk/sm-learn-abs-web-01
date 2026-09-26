/**
 * Lab pages for Part 1 (the browser as a runtime) and Part 5 (loading performance):
 * - /lab/waterfall: a page whose CSS, scripts, hero image, web font and third-party script are
 *   configurable (delay, loading mode), which reports its own resource timings and paint metrics
 *   to the lesson that framed it;
 * - /lab/isolation: the same page with and without COOP + COEP (cross-origin isolation);
 * - /lab/nav/a and /lab/nav/b: a pair for the back/forward cache and speculation-rules prerender.
 */
import type { Deps } from '../app.ts';
import { html, send } from '../core/http.ts';
import type { Router } from '../core/router.ts';
import { escapeHtml, labPage, safeJson } from '../labs/layout.ts';

export interface WaterfallConfig {
  css: number;
  cssMode: 'blocking' | 'async' | 'inline';
  js: number;
  jsMode: 'sync' | 'defer' | 'async' | 'none';
  img: number;
  imgMode: 'eager' | 'lazy' | 'high' | 'preload';
  font: number;
  fontDisplay: 'block' | 'swap' | 'optional' | 'fallback' | 'none';
  vendor: number;
  vendorMode: 'none' | 'sync' | 'async' | 'facade';
  run: string;
}

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;
const ms = (value: string | null): number => Math.min(5000, Math.max(0, Number(value) || 0));

export function parseWaterfall(params: URLSearchParams): WaterfallConfig {
  return {
    css: ms(params.get('css')),
    cssMode: pick(params.get('cssMode'), ['blocking', 'async', 'inline'] as const, 'blocking'),
    js: ms(params.get('js')),
    jsMode: pick(params.get('jsMode'), ['sync', 'defer', 'async', 'none'] as const, 'none'),
    img: ms(params.get('img')),
    imgMode: pick(params.get('imgMode'), ['eager', 'lazy', 'high', 'preload'] as const, 'eager'),
    font: ms(params.get('font')),
    fontDisplay: pick(
      params.get('fontDisplay'),
      ['block', 'swap', 'optional', 'fallback', 'none'] as const,
      'none',
    ),
    vendor: ms(params.get('vendor')),
    vendorMode: pick(
      params.get('vendorMode'),
      ['none', 'sync', 'async', 'facade'] as const,
      'none',
    ),
    run: (params.get('run') ?? '0').replace(/\W/g, '').slice(0, 12),
  };
}

/** The page under test. Every choice in the config is visible in the markup it produces. */
export function waterfallPage(c: WaterfallConfig, otherOrigin: string): string {
  const q = (delay: number): string => `?delay=${delay}&run=${c.run}`;
  const head: string[] = [];
  if (c.imgMode === 'preload')
    head.push(
      `<link rel="preload" as="image" href="/lab/asset/hero.svg${q(c.img)}" fetchpriority="high">`,
    );
  if (c.fontDisplay !== 'none')
    head.push(
      `<link rel="preload" as="font" type="font/woff2" href="/lab/asset/font.woff2${q(c.font)}" crossorigin>`,
      `<style>@font-face{font-family:LabFont;src:url(/lab/asset/font.woff2${q(c.font)}) format("woff2");font-display:${c.fontDisplay}}h1{font-family:LabFont,serif}</style>`,
    );
  if (c.cssMode === 'blocking')
    head.push(`<link rel="stylesheet" href="/lab/asset/style.css${q(c.css)}">`);
  if (c.cssMode === 'async')
    head.push(
      `<link rel="preload" as="style" href="/lab/asset/style.css${q(c.css)}" onload="this.onload=null;this.rel='stylesheet'">`,
    );
  if (c.cssMode === 'inline') head.push(`<style>${CRITICAL_CSS}</style>`);
  if (c.vendorMode === 'sync')
    head.push(`<script src="${otherOrigin}/lab/asset/vendor.js${q(c.vendor)}"></script>`);
  if (c.vendorMode === 'async')
    head.push(`<script async src="${otherOrigin}/lab/asset/vendor.js${q(c.vendor)}"></script>`);
  if (c.jsMode === 'sync') head.push(`<script src="/lab/asset/app.js${q(c.js)}"></script>`);
  if (c.jsMode === 'defer') head.push(`<script defer src="/lab/asset/app.js${q(c.js)}"></script>`);
  if (c.jsMode === 'async') head.push(`<script async src="/lab/asset/app.js${q(c.js)}"></script>`);

  const img = `<img src="/lab/asset/hero.svg${q(c.img)}" width="1200" height="520" alt="Trail Runner 3, side view"${c.imgMode === 'lazy' ? ' loading="lazy"' : ''}${c.imgMode === 'high' || c.imgMode === 'preload' ? ' fetchpriority="high"' : ''} style="width:100%;height:auto;display:block">`;
  const facade =
    c.vendorMode === 'facade'
      ? `<button type="button" id="chat">Chat with us</button><script>document.getElementById('chat').addEventListener('click',()=>{const s=document.createElement('script');s.src=${safeJson(`${otherOrigin}/lab/asset/vendor.js${q(c.vendor)}`)};document.head.append(s)},{once:true})</script>`
      : '';
  return labPage({
    title: 'Trail Runner 3 · waterfall lab',
    head: head.join('\n'),
    body: `<p class="kicker">Lab page · run ${escapeHtml(c.run)}</p>
<h1>Trail Runner 3</h1>
${img}
<p>A light trail shoe with a rock plate and a 6 mm drop. This page is the patient: its CSS, scripts, image and font arrive when the lab says so.</p>
${facade}
<script>${REPORTER.replace('__RUN__', safeJson(c.run))}</script>`,
  });
}

const CRITICAL_CSS = 'h1{letter-spacing:-.01em}img{border-radius:.5rem}';

/** Reports this page's timings to the lesson that framed it (same origin only). */
const REPORTER = `(()=>{let lcp=0;try{new PerformanceObserver(l=>{const e=l.getEntries().at(-1);if(e)lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true})}catch{}
const send=()=>{const nav=performance.getEntriesByType('navigation')[0];const fcp=performance.getEntriesByName('first-contentful-paint')[0];
const resources=[{name:'document (HTML)',host:location.host,start:0,end:nav.responseEnd,blocking:''}].concat(performance.getEntriesByType('resource').map(r=>{const u=new URL(r.name);return{name:u.pathname.split('/').pop(),host:u.host,start:r.startTime,end:r.responseEnd,blocking:r.renderBlockingStatus||''}}));
if(parent!==window)parent.postMessage({type:'lab:waterfall',run:__RUN__,ttfb:nav.responseStart,fcp:fcp?fcp.startTime:0,lcp,dcl:nav.domContentLoadedEventEnd,load:nav.loadEventEnd,resources},location.origin)};
addEventListener('load',()=>setTimeout(send,400))})();`;

const HERO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0e7490"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="1200" height="520" fill="#ecfeff"/><path d="M160 360c120-10 260-120 420-130 150-10 250 60 420 70 60 4 90 30 90 60v40H140c-40 0-50-38 20-40z" fill="url(#g)"/><path d="M140 400h960v28c0 12-10 22-22 22H162c-12 0-22-10-22-22z" fill="#164e63"/><circle cx="420" cy="300" r="14" fill="#ecfeff"/><circle cx="480" cy="292" r="14" fill="#ecfeff"/><circle cx="540" cy="286" r="14" fill="#ecfeff"/></svg>`;

const VENDOR = `/* vendor.js: a "tag manager" that does 250 ms of work on arrival */(()=>{const end=performance.now()+250;while(performance.now()<end){}})();`;

export function registerBrowserLabs(router: Router, deps: Deps): void {
  const otherOrigin = (host: string | undefined): string => {
    const [name = 'localhost', port = ''] = (host ?? 'localhost').split(':');
    const swapped = name === '127.0.0.1' ? 'localhost' : '127.0.0.1';
    return `http://${swapped}${port ? `:${port}` : ''}`;
  };

  router.get('/lab/waterfall', ({ res, url, req }) => {
    html(res, 200, waterfallPage(parseWaterfall(url.searchParams), otherOrigin(req.headers.host)));
  });

  router.get('/lab/asset/:name', async ({ res, params, url }) => {
    const delay = ms(url.searchParams.get('delay'));
    await deps.sleep(delay);
    const noStore = { 'Cache-Control': 'no-store', 'Timing-Allow-Origin': '*' };
    switch (params.name) {
      case 'style.css':
        send(res, 200, `body{accent-color:#0e7490}h1{color:#0e7490}p{max-width:60ch}`, {
          'Content-Type': 'text/css; charset=utf-8',
          ...noStore,
        });
        return;
      case 'app.js':
        send(res, 200, `document.documentElement.dataset.app='ready';`, {
          'Content-Type': 'text/javascript; charset=utf-8',
          ...noStore,
        });
        return;
      case 'vendor.js':
        send(res, 200, VENDOR, {
          'Content-Type': 'text/javascript; charset=utf-8',
          'Cross-Origin-Resource-Policy': 'cross-origin',
          ...noStore,
        });
        return;
      case 'hero.svg':
        send(res, 200, HERO, { 'Content-Type': 'image/svg+xml', ...noStore });
        return;
      case 'font.woff2': {
        const font = deps.files.find(/\.woff2$/);
        const body = font ? deps.files.read(font) : undefined;
        if (!body) {
          send(res, 404, '');
          return;
        }
        send(res, 200, body, { 'Content-Type': 'font/woff2', ...noStore });
        return;
      }
      default:
        send(res, 404, 'No such lab asset', { 'Content-Type': 'text/plain; charset=utf-8' });
    }
  });

  // Cross-origin isolation: COOP + COEP make SharedArrayBuffer and fine-grained timers available.
  router.get('/lab/isolation', ({ res, url }) => {
    const isolated = url.searchParams.get('coep') === '1';
    const headers: Record<string, string> = {};
    if (isolated) {
      headers['Cross-Origin-Opener-Policy'] = 'same-origin';
      headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    }
    html(
      res,
      200,
      labPage({
        title: isolated ? 'Cross-origin isolated page' : 'Ordinary page',
        body: `<p class="kicker">Lab · process isolation</p>
<h1>${isolated ? 'Cross-origin isolated (COOP + COEP)' : 'Not isolated (no COEP)'}</h1>
<table><caption class="muted">Measured in this tab</caption><tbody id="facts"></tbody></table>
<p class="muted">Headers on this response: ${isolated ? '<code>Cross-Origin-Opener-Policy: same-origin</code> and <code>Cross-Origin-Embedder-Policy: require-corp</code>' : 'the site baseline only'}. Compare with <a href="/lab/isolation?coep=${isolated ? '0' : '1'}">the ${isolated ? 'ordinary' : 'isolated'} twin</a>.</p>
<script>${ISOLATION_PROBE}</script>`,
      }),
      headers,
    );
  });

  // Back/forward cache and prerendering: page A links to page B; each reports how it was shown.
  router.get('/lab/nav/:page', ({ res, params, url }) => {
    const page = params.page === 'b' ? 'b' : 'a';
    const nostore = url.searchParams.get('nostore') === '1';
    const unload = url.searchParams.get('unload') === '1';
    const prerender = url.searchParams.get('prerender') === '1';
    const query = url.search;
    const other = `/lab/nav/${page === 'a' ? 'b' : 'a'}${query}`;
    const rules = prerender
      ? `<script type="speculationrules">${safeJson({ prerender: [{ source: 'list', urls: [other] }] })}</script>`
      : '';
    html(
      res,
      200,
      labPage({
        title: `Navigation lab, page ${page.toUpperCase()}`,
        head: rules,
        body: `<p class="kicker">Lab · bfcache and prerender · page ${page.toUpperCase()}</p>
<h1>Page ${page.toUpperCase()}</h1>
<p>Settings: ${nostore ? '<code>Cache-Control: no-store</code>' : 'cacheable'} · ${unload ? 'an <code>unload</code> listener' : 'no unload listener'} · ${prerender ? `speculation rules prerender <code>${escapeHtml(other)}</code>` : 'no speculation rules'}.</p>
<p><a href="${escapeHtml(other)}">Go to page ${page === 'a' ? 'B' : 'A'}</a>, then press the browser's Back button.</p>
<ol id="log" aria-live="polite"></ol>
<script>${NAV_PROBE.replace('__UNLOAD__', unload ? 'true' : 'false')}</script>`,
      }),
      nostore ? { 'Cache-Control': 'no-store' } : { 'Cache-Control': 'no-cache' },
    );
  });
}

const ISOLATION_PROBE = `(()=>{const rows=document.getElementById('facts');
const add=(k,v,ok)=>{const tr=rows.insertRow();const th=document.createElement('th');th.scope='row';th.textContent=k;tr.append(th);const td=tr.insertCell();td.textContent=v;if(ok!==undefined)td.className=ok?'ok':'bad'};
add('self.crossOriginIsolated',String(self.crossOriginIsolated),self.crossOriginIsolated);
add('SharedArrayBuffer available',String(typeof SharedArrayBuffer==='function'),typeof SharedArrayBuffer==='function');
const seen=new Set();let prev=performance.now();for(let i=0;i<200000&&seen.size<50;i++){const t=performance.now();if(t!==prev){seen.add(+(t-prev).toFixed(4));prev=t}}
add('Smallest performance.now() step',Math.min(...seen).toFixed(3)+' ms (coarser without isolation: a Spectre mitigation)');
add('measureUserAgentSpecificMemory',String('measureUserAgentSpecificMemory' in performance));})();`;

const NAV_PROBE = `(()=>{const log=document.getElementById('log');const note=t=>{const li=document.createElement('li');li.textContent=new Date().toLocaleTimeString()+' '+t;log.append(li)};
const nav=performance.getEntriesByType('navigation')[0];
note('Loaded: navigation type '+(nav?nav.type:'?')+(nav&&nav.activationStart>0?', prerendered then activated after '+Math.round(nav.activationStart)+' ms':''));
if(document.prerendering)document.addEventListener('prerenderingchange',()=>note('Activated from a prerender: it rendered in the background before you clicked'),{once:true});
addEventListener('pageshow',e=>{if(e.persisted)note('Restored from the back/forward cache: no network, no re-run of scripts')});
if(__UNLOAD__)addEventListener('unload',()=>{});
if(nav&&nav.notRestoredReasons&&nav.type==='back_forward'){const r=nav.notRestoredReasons;const reasons=(r.reasons||[]).map(x=>x.reason||x).concat((r.children||[]).flatMap(c=>(c.reasons||[]).map(x=>x.reason||x)));note('Not restored from bfcache'+(reasons.length?': '+reasons.join(', '):''))}})();`;
