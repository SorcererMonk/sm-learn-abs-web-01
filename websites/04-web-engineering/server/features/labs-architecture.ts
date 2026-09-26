/**
 * Lab pages for Part 3 (frontend architecture) and Part 9 (SSR mechanics):
 * - /lab/render/:mode: one product page rendered four ways (csr, ssr, stream, static), with a
 *   "database" that takes ?delay ms, a framework-sized bundle for csr/ssr/stream and a 1 KB
 *   island for static; each page reports its own milestones to the lesson;
 * - /lab/hydrate: a server-rendered button whose code arrives late (dead clicks, event replay,
 *   hydration mismatch);
 * - /lab/router/*: a no-framework SPA with History API routing, focus management, scroll
 *   restoration and prefetch; the server returns the shell for every path (deep links work).
 */
import type { Deps } from '../app.ts';
import { html, json, send } from '../core/http.ts';
import type { Router } from '../core/router.ts';
import { escapeHtml, labPage, safeJson } from '../labs/layout.ts';

export const PRODUCTS = [
  ['Trail Runner 3', 129],
  ['Road Glide', 115],
  ['Summit Boot', 189],
  ['Trail Sock ×3', 24],
  ['Rain Shell', 149],
  ['Merino Tee', 59],
  ['Hydration Vest', 99],
  ['Headlamp 400', 45],
  ['Gaiter', 19],
  ['Trekking Poles', 89],
  ['Buff', 15],
  ['Recovery Slide', 49],
].map(([name, price], i) => ({ id: i + 1, name: String(name), price: Number(price) }));

type Product = (typeof PRODUCTS)[number];

export const renderList = (products: Product[]): string =>
  `<ul class="grid" id="products">${products
    .map(
      (p) =>
        `<li class="card"><h2>${escapeHtml(p.name)}</h2><p>€${p.price}</p><button type="button" data-add="${p.id}">Add to cart</button></li>`,
    )
    .join('')}</ul>`;

const STYLE = `<style>.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(9rem,1fr));gap:.6rem;padding:0;list-style:none}.card h2{font-size:1rem;margin:0}.skeleton{height:8rem;border-radius:.6rem;background:color-mix(in oklab,var(--fg) 8%,transparent)}</style>`;

const header = (mode: string): string =>
  `<p class="kicker">Rendering lab · ${escapeHtml(mode)}</p><h1>Trail shop</h1><p id="cart" aria-live="polite">Cart: 0 items</p>`;

/** Posts this page's milestones to the lesson that framed it. */
const reporter = (mode: string): string =>
  `<script>(()=>{let lcp=0;try{new PerformanceObserver(l=>{const e=l.getEntries().at(-1);if(e)lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true})}catch{}
const mark=n=>{const m=performance.getEntriesByName(n)[0];return m?m.startTime:0};
const send=()=>{const nav=performance.getEntriesByType('navigation')[0];const js=performance.getEntriesByType('resource').filter(r=>r.initiatorType==='script');
if(parent!==window)parent.postMessage({type:'lab:render',mode:${safeJson(mode)},ttfb:nav.responseStart,fcp:(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime||0,lcp,content:mark('content'),interactive:mark('interactive'),html:nav.encodedBodySize||nav.transferSize,js:js.reduce((n,r)=>n+(r.encodedBodySize||r.transferSize),0)},location.origin)};
const wait=()=>(mark('content')&&mark('interactive'))||performance.now()>15000?setTimeout(send,200):setTimeout(wait,100);
addEventListener('load',wait)})();</script>`;

/** A framework-sized bundle: ~80 KB of real functions the engine must parse and compile. */
function runtimeBundle(): string {
  const lines: string[] = [
    '/* "framework runtime" padding: parsed and compiled like the real thing */',
  ];
  for (let i = 0; lines.join('').length < 80_000; i += 1)
    lines.push(`function h${i}(t,p,c){return{t,p:p||{},c:c||[],k:${i}}}`);
  return lines.join('\n');
}

const RUNTIME = runtimeBundle();

const APP = (render: boolean): string => `${RUNTIME}
(async()=>{${
  render
    ? `const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const data=await (await fetch('/lab/render/data'+location.search)).json();
document.getElementById('app').innerHTML='<ul class="grid" id="products">'+data.map(p=>'<li class="card"><h2>'+esc(p.name)+'</h2><p>€'+p.price+'</p><button type="button" data-add="'+p.id+'">Add to cart</button></li>').join('')+'</ul>';
performance.mark('content');`
    : ''
}
const cart=document.getElementById('cart');let n=0;document.addEventListener('click',e=>{if(e.target.closest('[data-add]')){n++;cart.textContent='Cart: '+n+' items'}});performance.mark('interactive')})();`;

const ISLAND = `/* island: only the cart button's code, 1 KB */(()=>{const cart=document.getElementById('cart');let n=0;document.addEventListener('click',e=>{if(e.target.closest('[data-add]')){n++;cart.textContent='Cart: '+n+' items'}});performance.mark('interactive')})();`;

export function registerArchitectureLabs(router: Router, deps: Deps): void {
  const builtAt = new Date(deps.now()).toISOString().slice(11, 19);
  const staticHtml = labPage({
    title: 'Trail shop (static + islands)',
    head: STYLE,
    body: `${header('static + islands')}${renderList(PRODUCTS)}<script>performance.mark('content')</script><p class="muted">Pre-rendered at build time (${builtAt} UTC). Prices could be stale until the next build or revalidation.</p><script type="module" src="/lab/render/island.js"></script>${reporter('static')}`,
  });

  const delayOf = (url: URL): number =>
    Math.min(3000, Math.max(0, Number(url.searchParams.get('delay') ?? 0)));
  const query = async (url: URL): Promise<Product[]> => {
    await deps.sleep(delayOf(url));
    return PRODUCTS;
  };

  router.get('/lab/render/data', async ({ res, url, timing }) => {
    const products = await timing.measure('db', () => query(url), 'simulated query');
    json(res, 200, products);
  });

  router.get('/lab/render/app.js', ({ res, url }) => {
    send(res, 200, APP(url.searchParams.get('mode') === 'csr'), {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  });

  router.get('/lab/render/island.js', ({ res }) => {
    send(res, 200, ISLAND, {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  });

  router.get('/lab/render/:mode', async ({ res, url, params, timing }) => {
    switch (params.mode) {
      case 'csr':
        html(
          res,
          200,
          labPage({
            title: 'Trail shop (client-side rendering)',
            head: STYLE,
            body: `${header('client-side rendering')}<div id="app"><div class="skeleton" aria-label="Loading products"></div></div><script type="module" src="/lab/render/app.js?mode=csr"></script>${reporter('csr')}`,
          }),
        );
        return;
      case 'ssr': {
        const products = await timing.measure('db', () => query(url), 'simulated query');
        const list = await timing.measure('render', () => renderList(products));
        html(
          res,
          200,
          labPage({
            title: 'Trail shop (server-side rendering)',
            head: STYLE,
            body: `${header('server-side rendering')}${list}<script>performance.mark('content')</script><script type="module" src="/lab/render/app.js?mode=ssr"></script>${reporter('ssr')}`,
          }),
        );
        return;
      }
      case 'stream': {
        // Send the shell now; stream the slow part when it exists; close the document last.
        const page = labPage({
          title: 'Trail shop (streaming SSR)',
          head: STYLE,
          body: `${header('streaming server-side rendering')}<!--SLOT--><script type="module" src="/lab/render/app.js?mode=stream"></script>${reporter('stream')}`,
        });
        const [before = '', after = ''] = page.split('<!--SLOT-->');
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.write(
          `${before}<div class="skeleton" id="placeholder" aria-label="Loading products"></div>`,
        );
        const products = await query(url);
        res.write(
          `<template id="products-tpl">${renderList(products)}</template><script>document.getElementById('placeholder').replaceWith(document.getElementById('products-tpl').content);performance.mark('content')</script>`,
        );
        res.end(after);
        return;
      }
      case 'static':
        html(res, 200, staticHtml);
        return;
      default:
        html(
          res,
          404,
          labPage({
            title: 'Unknown mode',
            body: `<h1>Unknown mode ${escapeHtml(params.mode)}</h1>`,
          }),
        );
    }
  });

  // Hydration: server HTML now, the code that makes it work later.
  router.get('/lab/hydrate', ({ res, url }) => {
    const delay = delayOf(url);
    const replay = url.searchParams.get('replay') === '1';
    const mismatch = url.searchParams.get('mismatch') === '1';
    const serverTime = new Date(deps.now()).toISOString().slice(11, 23);
    html(
      res,
      200,
      labPage({
        title: 'Hydration lab',
        head: `<script>${HYDRATION_CAPTURE.replace('__REPLAY__', String(replay))}</script>`,
        body: `<p class="kicker">Hydration lab · code arrives after ${delay} ms${replay ? ' · event replay on' : ''}</p>
<h1>Basket</h1>
<p>Rendered on the server at <time id="rendered">${serverTime}</time></p>
<p><button type="button" id="add" data-action="add">Add to basket (0)</button></p>
<ol id="log" aria-live="polite"></ol>
<script type="module" src="/lab/hydrate/app.js?delay=${delay}&amp;mismatch=${mismatch ? 1 : 0}"></script>`,
      }),
    );
  });

  router.get('/lab/hydrate/app.js', async ({ res, url }) => {
    await deps.sleep(delayOf(url));
    send(
      res,
      200,
      HYDRATION_APP.replace('__MISMATCH__', String(url.searchParams.get('mismatch') === '1')),
      {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    );
  });

  // A client-routed app: every path under /lab/router/ gets the same shell.
  router.get('/lab/router-app.js', ({ res }) => {
    send(res, 200, ROUTER_APP, {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
  });

  router.get('/lab/router/*', ({ res }) => {
    html(
      res,
      200,
      labPage({
        title: 'Router lab',
        body: `<nav aria-label="Router lab"><a href="/lab/router/">Home</a> · <a href="/lab/router/products">Products</a> · <a href="/lab/router/products/1">Product 1</a> · <a href="/lab/router/products/2">Product 2</a> · <a href="/lab/router/about">About</a></nav>
<div id="view" tabindex="-1"></div>
<p id="announce" class="muted" aria-live="polite"></p>
<script type="module" src="/lab/router-app.js"></script>`,
      }),
    );
  });
}

const HYDRATION_CAPTURE = `window.__lab={start:performance.now(),dead:0,queued:[],replay:__REPLAY__,hydrated:false};
const say=t=>{const post=()=>{const li=document.createElement('li');li.textContent=t;document.getElementById('log')?.append(li)};document.readyState==='loading'?addEventListener('DOMContentLoaded',post):post();if(parent!==window)parent.postMessage({type:'lab:hydrate',text:t},location.origin)};window.__say=say;
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||__lab.hydrated)return;if(__lab.replay){__lab.queued.push(el.dataset.action);say('Click captured before hydration: queued for replay')}else{__lab.dead++;say('Dead click: the button is visible but its code has not arrived')}},true);`;

const HYDRATION_APP = `const lab=window.__lab;const button=document.getElementById('add');let count=0;
const render=()=>{button.textContent='Add to basket ('+count+')'};
if(__MISMATCH__){const client=new Date().toISOString().slice(11,23);const server=document.getElementById('rendered').textContent;if(client!==server){__say('Hydration mismatch: server rendered '+server+', client rendered '+client+'. Frameworks warn, then patch or re-render the subtree.');document.getElementById('rendered').textContent=client}}
button.addEventListener('click',()=>{count++;render()});lab.hydrated=true;
__say('Hydrated after '+Math.round(performance.now()-lab.start)+' ms');
if(lab.queued.length){__say('Replaying '+lab.queued.length+' queued click(s)');for(const _ of lab.queued){count++}render()}
if(lab.dead)__say(lab.dead+' click(s) were lost before hydration');`;

const ROUTER_APP = `const view=document.getElementById('view');const announce=document.getElementById('announce');const cache=new Map();
const tell=t=>{if(parent!==window)parent.postMessage({type:'lab:router',text:t,path:location.pathname},location.origin)};
const load=path=>{if(!cache.has(path))cache.set(path,fetch('/api/slow?ms=400&label='+encodeURIComponent(path)).then(r=>r.json()));return cache.get(path)};
const routes=[[/^\\/lab\\/router\\/?$/,()=>['Home','<p>Scroll down, open a product, then use Back: your scroll position comes back.</p>'+'<p>Filler paragraph.</p>'.repeat(30)]],
[/^\\/lab\\/router\\/products\\/?$/,()=>['Products','<ul>'+[1,2,3].map(i=>'<li><a href="/lab/router/products/'+i+'">Product '+i+'</a></li>').join('')+'</ul>']],
[/^\\/lab\\/router\\/products\\/(\\d+)$/,m=>['Product '+m[1],'<p>Deep link to this URL and reload: the server returns the shell and the router renders this view.</p>']],
[/^\\/lab\\/router\\/about$/,()=>['About','<p>No framework: History API, focus management, scroll restoration, prefetch.</p>']]];
async function render(path,{focus=true}={}){const warm=cache.has(path);const route=routes.find(([re])=>re.test(path));const [title,body]=route?route[1](path.match(route[0])):['Not found','<p>No route matches '+path+'.</p>'];
await load(path);const swap=()=>{view.innerHTML='<h1>'+title+'</h1>'+body;document.title=title+' · Router lab'};
if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)await document.startViewTransition(swap).updateCallbackDone;else swap();
if(focus){view.focus();announce.textContent='Navigated to '+title}tell('Rendered '+path+(warm?' instantly: its data was already prefetched':' after waiting 400 ms for its data'))}
history.scrollRestoration='manual';
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||a.origin!==location.origin||!a.pathname.startsWith('/lab/router')||e.metaKey||e.ctrlKey)return;e.preventDefault();
history.replaceState({...history.state,scroll:scrollY},'');history.pushState({scroll:0},'',a.pathname);void render(a.pathname).then(()=>scrollTo(0,0))});
const prefetch=e=>{const a=e.target.closest&&e.target.closest('a');if(a&&a.pathname.startsWith('/lab/router')&&!cache.has(a.pathname)){load(a.pathname);tell('Prefetching '+a.pathname+' on '+e.type)}};
document.addEventListener('pointerover',prefetch);document.addEventListener('focusin',prefetch);
addEventListener('popstate',e=>{void render(location.pathname).then(()=>scrollTo(0,(e.state&&e.state.scroll)||0));tell('popstate: restored scroll to '+((e.state&&e.state.scroll)||0)+' px')});
void render(location.pathname,{focus:false});`;
