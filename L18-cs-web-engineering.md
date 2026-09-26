# Web Engineering → World-Class Engineer of the Web Platform
## L18: Computer Science · A Complete Concept Map: Platform → Architecture → Performance → Delivery → Taste

> This is the **engineering** file for the web: the browser as a runtime, the network between you and it, the architecture of applications that live in both places, and the operational practice of shipping to an audience whose device, network, and browser you never chose. It is framework-agnostic by design — React, Next.js, Vue, Svelte, and their mechanics belong to `L1-coding-typescript-javascript.md`. Visual craft, design systems, and motion belong to `L18-cs-design-engineering.md`. General design and process belong to `L18-cs-software-engineering.md`. Infrastructure and pipelines belong to the cloud and DevOps files. Native clients belong to `L18-cs-app-engineering.md`. The training counterpart is `T18-cs-web-engineering.md`.
>
> **Currency stamp (September 2026):** the responsiveness Core Web Vital is **INP** (Interaction to Next Paint), which replaced FID in March 2024; **Baseline** is now the common vocabulary for "can I use this" across browsers; **container queries**, `:has()`, CSS nesting, `@layer`, and the **View Transitions API** have moved from novelty to normal; **React Server Components and streaming SSR** are mainstream in the meta-frameworks, with resumability (Qwik) and islands (Astro) as the serious alternative positions; **Vite** is the default build tool for most new work with Rolldown-based iterations landing; Deno and Bun are credible runtimes alongside Node; edge runtimes are a normal deployment target; **passkeys/WebAuthn** are the recommended primary authentication; **WCAG 2.2 AA** is the standard and the European Accessibility Act has applied since June 2025. Browser privacy policy — third-party cookies, partitioning, tracking prevention — has changed direction more than once; verify the current state before designing around it. This document names mechanisms rather than framework APIs precisely because the framework layer churns fastest.

---

## How To Use This Document

**Depth ladder — apply to every bullet:** **L1** Name it · **L2** Use it correctly · **L3** Choose it over alternatives · **L4** Explain the mechanism (what the browser, network, or server actually does) · **L5** Build a minimal version yourself · **L6** Teach it and critique misuse.

**Tier tags:** **[Core]** every web engineer · **[Deep]** senior/platform depth · **[Frontier]** new or moving fast.

**Each Part closes with:** *Intuition anchors* · *Mastery checks* · *Build* · *Taste*.

**The web-engineering learning loop:**
1. **Open DevTools before you open the editor.** Network waterfall, performance trace, coverage, rendering panel, and the accessibility tree are the instruments of this discipline. Guessing is optional; measuring is cheap.
2. **Throttle everything.** Mid-tier Android CPU throttling (4–6×) and Slow 4G are the defaults you should develop against, not the exceptions you test at the end.
3. **Build it without the framework once.** Every abstraction you use — routing, hydration, data caching, form handling — is worth reimplementing in 100 lines of plain platform code once. Afterwards the framework is a convenience rather than a mystery.
4. **Read the spec, not the summary.** WHATWG HTML, Fetch, and URL; the CSS specs; the ECMAScript proposals. They are the only sources that say what actually happens.
5. **Field data over lab data.** Lighthouse tells you about one run on your machine; real-user monitoring tells you about your users. Ship measurement before optimisation.
6. **Progressive enhancement as a discipline**: make it work as HTML over a network, then improve it. It is also the cheapest accessibility, SEO, and resilience strategy that exists.

**Relationship to the other files:** `L18-cs-fundamentals.md` Part 9 explains HTTP, TLS, and DNS mechanisms this file applies, and Part 15 the security theory; `L18-cs-data-engineering.md` owns the database behind your API; `L18-cs-cloud-engineering.md` and `…-devops-platform-sre.md` own where it runs and how it gets there.

---

## PART 0 — What Web Engineering Is [Core]

- The platform's defining constraints: **you ship to an unknown device over an unknown network into an untrusted runtime you do not control**, with no install step, no version pinning, and a decades-long backward-compatibility guarantee you inherit for free
- The four surfaces of every web application — the **client** (a browser running your code in a sandbox), the **network** (latency, loss, caching, CDNs), the **server** (rendering, APIs, data), and the **build** (what you compile and ship) — and the fact that most web engineering decisions trade one against another
- The web's unique properties, which shape everything else: the **URL as shareable application state**, the back button as a user-owned undo, view-source as a permanent security assumption, linkability and crawlability, and "the user agent is the user's, not yours"
- Where the web wins and where it loses against native (`L18-cs-app-engineering.md` Part 10): reach, zero install, instant updates, and linkability against device integration, background execution, and the performance ceiling
- The engineering failure modes this file exists to prevent: multi-megabyte bundles shipped to phones, layouts that jump while loading, keyboard-inaccessible interfaces, cache-invalidation bugs that serve last week's JavaScript, auth implemented with tokens in `localStorage`, and a single vendor script that owns your main thread
- The composition of the discipline: platform knowledge (Parts 1–2), architecture (3–4), the quality attributes the web cares most about (5–8), the server and delivery halves (9–12), and the craft that turns all of it into judgement (14)

**Intuition anchors**
- Your application is a guest in a browser on a stranger's phone, arriving over a network that may be a train tunnel. Every assumption you don't test is a bug waiting for a specific user.
- The fastest code is the code you never ship. On the web, bytes are latency and JavaScript is main-thread time.

**Mastery checks**
- Explain what makes the web different from a native platform in five concrete engineering consequences.
- Explain why the URL should encode application state, and name three things that break when it doesn't.

**Build**
- Take any page you've built and produce its "hostile report": Slow 4G with 4× CPU throttling, JavaScript disabled, a screen reader, 200% browser zoom, and a cold cache — with a numbered list of what breaks.

**Taste**
- Start every feature by asking what it does as plain HTML over a slow connection. What you build on top of that answer will be faster, more accessible, and more resilient than what you'd have built without asking.

---

## PART 1 — The Browser as a Runtime [Core → Deep]

- **Process architecture**: browser process, renderer processes per site (**site isolation**), GPU process, network service, utility processes; what a renderer can and cannot do; why a crashed tab doesn't take the browser down; the security consequences (Spectre-era isolation, `COOP`/`COEP` and cross-origin isolation for `SharedArrayBuffer`)
- **The navigation and loading sequence**, end to end: URL parsing, DNS, connection setup (TCP + TLS or QUIC), the HTML response streaming in, the **preload scanner** racing the parser, HTML tokenisation and DOM construction, blocking versus deferred scripts, CSSOM construction and why CSS is render-blocking, the render tree, layout, paint, compositing — and where each can be delayed by your decisions
- **The main thread and the event loop**: tasks vs **microtasks** (promises) vs `requestAnimationFrame` vs `requestIdleCallback`, rendering opportunities, **long tasks** and why they destroy responsiveness, input delay, `scheduler.yield()`/`postTask` and the modern scheduling APIs, `isInputPending`, and the rule that everything competes for one thread
- **Rendering pipeline internals**: style recalculation, layout (reflow) and the properties that trigger it, **layout thrashing** from read-write interleaving, paint and raster, the **compositor thread**, layers and `will-change`, which properties can be animated off the main thread (`transform`, `opacity`) and which cannot, `content-visibility` and CSS containment as rendering-cost controls
- **The JavaScript engine** at the level an engineer needs (language mechanics are in `L1-coding-typescript-javascript.md`): parse and lazy compilation, bytecode, optimising JIT and deoptimisation, hidden classes and inline caches, garbage collection (generational, incremental, concurrent) and what causes pauses, memory retention and leak shapes (detached DOM nodes, closures over large objects, listeners never removed, growing caches)
- Threads off the main thread: **Web Workers** (structured clone, transferables, `SharedArrayBuffer` with cross-origin isolation), worklets (paint, audio, animation), and what should move off-thread (parsing, decoding, crypto, heavy transforms) and what cannot (DOM)
- Storage and quota: cookies, `localStorage` (synchronous — a main-thread hazard), `sessionStorage`, **IndexedDB**, the **Cache API**, the Origin Private File System, storage quotas and eviction, persistence, and storage partitioning by top-level site
- The browser's other engines you will meet: the network cache, the back/forward cache (**bfcache**) and what disqualifies a page from it, prerendering and speculation rules, the HTML parser's error recovery, and the layout engine's quirks across browsers

**Intuition anchors**
- There is one main thread, and it runs your JavaScript, your style recalculation, your layout, and your event handlers. Everything "janky" is something occupying it for too long.
- The browser wants to show something as soon as possible; almost every performance technique is about not standing in its way.

**Mastery checks**
- Trace a navigation from URL entry to first paint, naming every step that your code can block.
- Explain layout thrashing with a code example and the fix.
- Explain why `transform`-based animation is smoother than animating `top`/`left`.
- Explain what disqualifies a page from bfcache and why it matters for perceived navigation speed.

**Build**
- A "browser mechanics lab": one page demonstrating render-blocking CSS, a blocking script, layout thrashing, a long task destroying INP, a composited versus non-composited animation, and a memory leak — each with a DevTools trace saved and annotated.

**Taste**
- Learn the pipeline once and you stop cargo-culting performance advice. Most tips are special cases of "don't block the main thread" and "don't make the browser recalculate what didn't change".

---

## PART 2 — The Web Platform: Standards & APIs [Core → Deep]

- **HTML as semantics, not markup soup**: document structure and landmarks, headings as an outline, lists, tables with proper headers, `<button>` versus a clickable `<div>` (and everything that comes free with the former), links versus buttons, `<dialog>`, `<details>`, the popover attribute, `<form>` and native validation, inputs and their types (which drive mobile keyboards and autofill), `autocomplete` tokens, images with `alt`, `<picture>` and responsive images, `<video>`/`<audio>`, `<template>`, metadata in `<head>`
- **Forms as a full platform feature**: submission with and without JavaScript, `FormData`, native validation and its messages, progressive enhancement of form handling, multi-step flows, file inputs, and why native form semantics are the difference between accessible and not
- **The DOM and events**: the tree, node types, traversal, mutation and its cost, `DocumentFragment`, event flow (capture, target, bubble), delegation, `passive` listeners and scroll performance, `AbortController` for listener and fetch cleanup, custom events, `MutationObserver`, `IntersectionObserver` (lazy loading, analytics, infinite scroll), `ResizeObserver`
- **CSS from an engineering perspective** (craft is in the design-engineering file): the cascade, specificity and `@layer`, inheritance, custom properties as a runtime API, box model, **layout algorithms** (normal flow, flexbox, grid, subgrid), stacking contexts and z-index, logical properties for internationalisation, **container queries**, `:has()`, media queries including `prefers-reduced-motion`/`prefers-color-scheme`/`forced-colors`, CSS containment and `content-visibility`, transitions and animations, view transitions, and the performance characteristics of each
- **Web components and the shadow DOM**: custom elements, shadow roots and encapsulation, slots, declarative shadow DOM for SSR, styling across the boundary (`::part`, `::slotted`, custom properties), form participation, and the honest assessment of when they beat a framework (design systems used by multiple frameworks; long-lived widgets)
- **Networking APIs**: `fetch` (requests, responses, streams, `AbortSignal`, credentials modes, `keepalive`), **Streams** (readable, writable, transform — the basis of streaming SSR and progressive rendering), `WebSocket`, **Server-Sent Events**, `WebTransport` **[Frontier]**, `navigator.sendBeacon`, and `EventSource` versus polling versus sockets as a design choice
- **Service workers and the Cache API**: lifecycle (install, activate, `skipWaiting`, `clients.claim`), fetch interception, caching strategies (cache-first, network-first, stale-while-revalidate, cache-then-network), precaching versus runtime caching, update semantics and the "stuck on an old version" failure, scope, and the debugging story
- Device and capability APIs: geolocation, permissions, notifications and push, Web Share, clipboard, media capture, Web Bluetooth/USB/Serial **[Frontier]**, screen wake lock, visual viewport, and the **Permissions API** as the pattern for all of them
- Computation and graphics: **WebAssembly** (when it wins, the JS boundary cost, threads, and toolchains — `L1-coding-c.md` and `L1-coding-rust.md` for the source side), Canvas 2D, WebGL, **WebGPU** **[Frontier]**, OffscreenCanvas, Web Audio, WebCodecs
- Security and identity APIs: **Web Crypto**, **WebAuthn/passkeys**, Credential Management, Trusted Types
- Internationalisation: the `Intl` family (number, date, list, plural rules, collation, relative time, segmenter), `lang` and `dir`, logical properties, locale negotiation, and translation pipelines
- **How the platform evolves**: WHATWG living standards, W3C specs, TC39 stages, browser positions and standards positions, origin trials, **Baseline** (newly available versus widely available) as the practical shipping signal, progressive enhancement and feature detection over user-agent sniffing, and polyfill strategy with its cost

**Intuition anchors**
- The platform has already solved most of what teams rebuild: validation, focus management, dialogs, lazy loading, date formatting, caching. Reaching for a library first is how a codebase gets heavy.
- Semantic HTML is the accessibility, SEO, and resilience layer all at once — it is the highest-leverage thing on this entire page.

**Mastery checks**
- Explain everything a `<button>` gives you that a `<div onClick>` does not.
- Explain the service-worker update lifecycle and how a user ends up stuck on a stale build.
- Explain when you'd choose SSE over WebSocket over polling, with the failure mode of each.
- Explain what Baseline "widely available" means and how you'd decide whether to ship `:has()` without a fallback.

**Build**
- A no-framework application using only platform APIs: routing with the History and Navigation APIs, a form with native validation and progressive enhancement, `IntersectionObserver`-driven lazy loading, an IndexedDB store, a service worker with a stale-while-revalidate strategy and a correct update flow, and one custom element — then read the whole thing back and note what your framework of choice actually buys you.

**Taste**
- Use the platform first, a library when the platform is genuinely insufficient, and a framework when the application's scale earns it. The dependency you don't add can never break, bloat, or be abandoned.

---

## PART 3 — Frontend Architecture [Core → Deep]

- **Rendering strategies** and what each actually trades: client-side rendering (fast deploys, slow first paint, poor crawlability), **server-side rendering** (fast first paint, server cost, hydration tax), **static generation** (cheapest and fastest, staleness), **incremental/on-demand revalidation**, **streaming SSR** (send the shell, stream the slow parts), **islands** (ship JavaScript only for interactive regions), **React Server Components** (components that never reach the client), **resumability** as the alternative to hydration, and **edge rendering** (close to the user, limited runtime)
- **Hydration**, precisely: why the client re-executes what the server already rendered, hydration mismatch errors and their causes, partial and progressive hydration, selective hydration on interaction, and the reason "time to interactive" and INP diverge from first paint
- Choosing per route, not per application: marketing pages static, dashboards client-rendered behind auth, content streaming — and how to explain the choice in terms of Core Web Vitals and cost
- **Routing architecture**: URL as state (query parameters for filters, path for resources), nested layouts, route-level data loading, parallel and dependent loads, prefetching on hover/viewport, view transitions between routes, scroll restoration, back/forward semantics, and deep-link correctness
- **The state taxonomy**, the distinction that decides most frontend architecture:
  - *Server-cache state* (data you fetched; belongs in a query cache with staleness rules, not in a global store)
  - *URL state* (filters, tabs, pagination — shareable and restorable)
  - *Client state* (auth session, theme, feature flags)
  - *Form state* (draft values, validation, submission status)
  - *Ephemeral UI state* (open menus, hover, focus)
  Most "state management is hard" pain comes from putting server-cache state into a global store and then hand-writing cache invalidation
- Data-fetching patterns: colocation of queries with components, request waterfalls and how to detect them in the network panel, parallel loading and preloading at the route level, suspense-style loading boundaries, pagination and infinite lists, and the N+1 problem's frontend twin
- Component architecture: composition over configuration, presentational versus container distinctions (and their modern forms), prop drilling versus context versus stores, controlled versus uncontrolled components, the boundary with the design system (`L18-cs-design-engineering.md`), and dependency direction rules that keep features from importing each other
- Codebase structure: feature-first folders, shared kernels, module boundaries enforced by lint rules or package boundaries, monorepo layout (apps, packages, tooling), and when to extract a package
- **Micro-frontends**, critically: module federation, independent deployment, and the real costs (duplicated runtimes, version skew, shared-state hacks, inconsistent design, debugging across boundaries); the honest rule — this solves an organisational problem for large multi-team products and creates problems for everyone else
- Framework-agnostic principles worth carrying between frameworks: unidirectional data flow, derived state over duplicated state, immutable updates, stable identity for lists, effects as synchronisation rather than lifecycle hooks, and the "make the state impossible to hold wrongly" instinct from `L18-cs-software-engineering.md` Part 3

**Intuition anchors**
- Classify every piece of state before you choose a library. Once server-cache state lives in a query cache and shareable state lives in the URL, what remains is small enough that the "store" question mostly disappears.
- Rendering strategy is a per-route decision about who does the work and when: the build, the server, the edge, or the user's phone.

**Mastery checks**
- Choose a rendering strategy for four routes (marketing home, blog post, authenticated dashboard, checkout) and justify each in Core Web Vitals and cost terms.
- Explain hydration mismatch, one real cause, and how you'd detect it in production.
- Take a screen's state and classify every piece into the five categories, saying where each lives and how it restores on reload.
- Find a request waterfall in a network trace and describe two structural fixes.

**Build**
- The same application built two ways — a client-rendered SPA and a streaming server-rendered version with islands — measured on LCP, INP, CLS, JavaScript bytes, and server cost, on a throttled mid-tier device, with the comparison written up.

**Taste**
- Put state where it belongs and the architecture mostly designs itself. Reaching for a global store first is the frontend equivalent of making every variable global.

---

## PART 4 — The Data & API Layer [Core → Deep]

- API styles from the client's perspective (design details in `L18-cs-software-engineering.md` Part 4): REST with HTTP caching semantics, GraphQL (client-shaped queries, over-fetching solved, caching harder, N+1 on the server), RPC-style typed endpoints (tRPC and friends — type safety without a schema layer), server functions/actions in meta-frameworks, and the trade-offs in caching, versioning, and tooling
- **Client-side data caching**: query caches (TanStack Query, SWR and their equivalents) with stale-while-revalidate semantics, cache keys and invalidation, background refetching, deduplication of in-flight requests, retry policy, pagination and infinite queries, and why a query cache beats a hand-rolled store for server data
- Normalisation: when a normalised client cache earns its complexity (heavily relational data edited in many places) and when document-shaped caching is enough
- **Optimistic updates**: applying the change locally, reconciling with the server response, rolling back on failure, conflict handling, and making the pending state visible rather than invisible
- Real-time: WebSocket connection management (reconnection with backoff, heartbeats, auth on connect, message ordering, back-pressure), SSE for one-way streams, polling as an honest fallback, presence and collaborative editing (CRDTs — `L18-cs-fundamentals.md` Part 14), and reconciling live updates with a query cache
- **Offline and PWA data**: IndexedDB as the local store, background sync, an outbox for queued mutations, conflict resolution, and the realistic limits of offline on the web compared with native (`L18-cs-app-engineering.md` Part 4)
- Forms, done well: progressive enhancement so the form works without JavaScript, client and server validation sharing one schema, field-level and form-level errors, focus management on error, submission states, idempotent submits (double-click protection), file uploads (chunking, resumability, progress, direct-to-storage signed URLs), and multi-step flows with resumable state
- Streaming and large payloads: streamed HTML, streamed JSON, range requests, pagination over "load everything", and virtualised rendering for long lists
- **Authentication in the browser**: session cookies (`HttpOnly`, `Secure`, `SameSite`) versus tokens in JavaScript-accessible storage (and why the former is the default recommendation), refresh strategies, silent renewal, OAuth 2.1/OIDC flows with PKCE, **passkeys/WebAuthn** as the modern primary factor, session fixation and rotation, logout across tabs (`BroadcastChannel`, storage events), and multi-tab consistency
- Authorisation on the client: the rule that client checks are UX only, server checks are security; feature flags versus permissions; and hiding versus disabling versus removing
- Error handling and resilience: typed error boundaries per route and per widget, retry with backoff and jitter for idempotent reads, distinguishing offline from server error from validation error, user-visible recovery actions, and telemetry on every failure path

**Intuition anchors**
- The browser already has a cache with well-specified semantics; the second cache you build in JavaScript must earn its existence and its invalidation bugs.
- Anything on the client is a suggestion. The server decides what is true — that applies to permissions, prices, and validation without exception.

**Mastery checks**
- Explain why session cookies are usually preferable to `localStorage` tokens, and the XSS and CSRF consequences of each.
- Design optimistic updates for a "like" button that behaves correctly under double taps, offline, and server rejection.
- Explain the caching semantics of `stale-while-revalidate` at both the HTTP and the query-cache layer.

**Build**
- A data layer for a real app: a typed API client, a query cache with defined staleness and invalidation rules, optimistic mutations with rollback, a WebSocket channel reconciled into the same cache, cookie-based auth with passkey enrolment, and a form that fully works with JavaScript disabled.

**Taste**
- Design the loading, empty, error, and offline states at the same time as the success state. A UI that only has a happy path is half a feature, and the half your users meet on a train is the missing one.

---

## PART 5 — Performance [Core → Deep]

- **Core Web Vitals** and what each measures: **LCP** (largest contentful paint — the main content's arrival), **INP** (interaction to next paint — responsiveness across the whole session), **CLS** (cumulative layout shift — visual stability), plus supporting metrics (TTFB, FCP, long tasks, total blocking time); field thresholds and the 75th-percentile rule
- **Lab versus field**: Lighthouse and WebPageTest for diagnosis and regression detection; **real-user monitoring** and the Chrome UX Report for truth; the trap of optimising a lab score while field INP is terrible; segmenting field data by device class, connection, and country
- **The critical rendering path**: minimise render-blocking CSS, defer non-critical JavaScript, inline what's needed for the first paint, and understand exactly which resources block what
- **Resource loading control**: `preload`, `prefetch`, `preconnect`, `dns-prefetch`, `fetchpriority`, `loading="lazy"`, `decoding="async"`, **103 Early Hints**, speculation rules for prerendering, module preloading, and the cost of getting priorities wrong
- **Images**: modern formats (AVIF, WebP with fallbacks), responsive images (`srcset`, `sizes`, `<picture>`), dimensions to prevent CLS, lazy loading below the fold and *not* lazy-loading the LCP image, CDN-based transformation, placeholders (LQIP, blur-up), and why images are usually the largest and easiest win
- **Fonts**: `font-display` strategies, subsetting, variable fonts, self-hosting versus third-party, preloading the critical font, `size-adjust` to reduce layout shift, and system-font stacks as the zero-cost option
- **JavaScript budgets**: bytes shipped versus bytes executed, code splitting by route and interaction, tree shaking and what defeats it, dependency weight analysis, replacing heavy libraries (dates, charts, validation) with platform APIs or lighter alternatives, and the "how much JavaScript does this page need at all" question
- **Third-party scripts**: the most common cause of bad field performance; auditing them, loading them off the critical path, `async`/`defer`, facades for embeds (video, maps, chat), partytown-style off-main-thread execution, tag-manager governance, and the political skill of saying no
- **Caching**: HTTP caching (`Cache-Control`, `ETag`, `Last-Modified`, immutable assets with content hashes, `stale-while-revalidate`), CDN caching and purge/tag-based invalidation, service-worker caching, and the cache-busting discipline that prevents stale-asset incidents
- Transport: HTTP/2 versus HTTP/3 and head-of-line blocking, compression (Brotli, zstd), connection reuse, and CDN edge placement
- **Runtime performance**: long-task elimination, yielding to the main thread, virtualising long lists, debouncing and throttling, avoiding layout thrashing, compositor-friendly animation, `content-visibility`, offloading work to workers, and INP-specific work (input handlers that yield before rendering)
- Memory on the web: leak shapes (detached nodes, listeners, timers, caches without bounds), measuring with heap snapshots, and the mobile consequence — tab discards
- **Performance as a process**: budgets defined per route, enforced in CI (bundle size, Lighthouse CI), a RUM dashboard everyone can see, regressions treated as bugs, and performance reviewed at design time rather than audited at the end

**Intuition anchors**
- LCP is usually an image or a font arriving late; CLS is usually a missing dimension or a late-injected banner; INP is usually one long task in an event handler. Knowing those three patterns solves most real sites.
- Every kilobyte of JavaScript costs more than a kilobyte of image: it must be downloaded, parsed, compiled, and executed on a thread that also runs the interface.

**Mastery checks**
- Given a field report showing good LCP and poor INP, list the four most likely causes and the trace you'd capture.
- Explain why lazy-loading the hero image makes LCP worse.
- Explain content-hash-based immutable caching and the deployment bug it prevents.
- Set a performance budget for a content site and for an authenticated dashboard, and justify the difference.

**Build**
- A full performance rescue of a real page: capture field and lab baselines, fix the top five causes across images, fonts, JavaScript, third parties, and long tasks, then add CI budgets and a RUM dashboard — with before/after numbers for each metric.

**Taste**
- Measure the 75th percentile on a mid-tier phone, not your laptop. Performance work judged on a fast machine is decoration; performance work judged on field data is engineering.

---

## PART 6 — Accessibility [Core]

- The frame: accessibility is a legal requirement in most markets (the European Accessibility Act since June 2025, the ADA in the US, India's Rights of Persons with Disabilities Act), a large share of your users, and — not incidentally — the same work that makes an interface usable by keyboard, voice, small screens, and search engines
- **WCAG 2.2 at AA**, organised by POUR (perceivable, operable, understandable, robust): text alternatives, captions, contrast ratios (4.5:1 body text, 3:1 large text and UI components), resize to 200% without loss, reflow at 320 CSS pixels, keyboard operability without traps, focus visible and not obscured, target sizes, timing adjustable, motion alternatives, consistent navigation, error identification and suggestion, name/role/value for every control
- **Semantic HTML first**: landmarks (`header`, `nav`, `main`, `aside`, `footer`), a sensible heading hierarchy, lists for lists, tables with `th`/`scope`/`caption`, `button` for actions and `a` for navigation, `label` bound to every input, `fieldset`/`legend` for groups — the majority of accessibility is achieved before ARIA is mentioned
- **ARIA**, used correctly: the first rule (don't use ARIA if native HTML will do), roles, states and properties, `aria-label` versus `aria-labelledby` versus visible text, `aria-describedby` for hints and errors, `aria-live` regions (polite versus assertive) and when they're the only option, `aria-expanded`/`aria-controls` for disclosure, `aria-current`, the accessibility tree as the thing you are actually authoring, and the ways ARIA makes things worse when guessed at
- **Keyboard and focus management**: tab order and `tabindex` (0, -1, and never positive), focus rings (`:focus-visible`), focus trapping in modals and returning focus on close, skip links, roving tabindex for composite widgets, focus after route change in an SPA (announce and move focus), and the fact that every mouse interaction needs a keyboard equivalent
- Screen readers in practice: NVDA and JAWS on Windows, VoiceOver on macOS and iOS, TalkBack on Android; virtual cursor versus focus mode; how headings, landmarks, and forms are actually navigated; and the necessity of testing with at least one real screen reader rather than only automated checks
- Forms and errors: labels, required indication, inline validation announced to assistive technology, an error summary with links to fields, avoiding placeholder-as-label, autocomplete tokens, and accessible date and combobox patterns (or using native ones)
- Visual accessibility: contrast including against images and gradients, not relying on colour alone, `prefers-reduced-motion`, `prefers-contrast` and forced-colors/high-contrast mode, zoom and reflow, line length and spacing, and dark mode contrast regressions
- Rich widgets: the **ARIA Authoring Practices Guide** patterns (tabs, accordions, comboboxes, menus, dialogs, carousels) — and the strong advice to use a well-tested headless library or native elements rather than authoring them from scratch
- Media: captions, transcripts, audio description, accessible players, autoplay policy
- **Testing and process**: automated tooling (axe, Lighthouse, pa11y, eslint-plugin-jsx-a11y) catching perhaps a third of issues; manual keyboard passes; screen-reader passes; zoom and forced-colors passes; accessibility acceptance criteria in tickets; regression tests in CI; VPAT/accessibility statements; and involving disabled users where possible

**Intuition anchors**
- The accessibility tree is a second, invisible UI you ship whether you think about it or not. Semantic HTML authors it for you; `div` soup leaves it blank.
- If it works with a keyboard alone and at 200% zoom, you have already fixed most of what an audit would find.

**Mastery checks**
- Navigate one of your pages with keyboard only and with a screen reader, and list every failure.
- Explain the correct focus behaviour when opening and closing a modal, and what happens without it.
- Explain why `aria-label` on a `div` with a click handler is not an accessible button.
- Explain what changes for a screen-reader user on an SPA route change and how to handle it.

**Build**
- Take a real page to WCAG 2.2 AA: automated pass, keyboard pass, screen-reader pass, zoom and forced-colors pass, an error-summary form pattern, and CI checks — documented as an audit with before/after evidence.

**Taste**
- Build with the keyboard and the accessibility tree in mind from the first component. Retrofitting accessibility costs several times more and always ships later than promised.

---

## PART 7 — Web Security [Core → Deep]

*Cryptography and general security theory are in `L18-cs-fundamentals.md` Part 15; this Part is the browser's security model and the web's attack surface.*

- **The origin model**: scheme + host + port, the same-origin policy, what it does and does not isolate, cross-origin reads versus writes, `postMessage` with strict origin checks, `iframe` sandboxing, and site versus origin (cookies are per-site, storage is partitioned)
- **CORS**, properly understood: it *relaxes* the same-origin policy for scripted requests; simple versus preflighted requests, `Access-Control-Allow-*` headers, credentials mode, why a CORS error is usually a server misconfiguration, and why CORS is not an authorisation mechanism
- **Cookies**: attributes (`HttpOnly`, `Secure`, `SameSite=Lax/Strict/None`, `Path`, `Domain`, `Max-Age`), cookie prefixes, partitioned cookies (CHIPS), third-party cookie policy churn across browsers, and session design on top of them
- **XSS** in all three forms (stored, reflected, DOM-based): the sinks (`innerHTML`, `document.write`, `eval`, `javascript:` URLs, unsanitised `dangerouslySetInnerHTML`/`v-html`), contextual output encoding, sanitisation with a maintained library (DOMPurify), **Trusted Types**, and a **Content Security Policy** built on nonces or hashes with `strict-dynamic` rather than a long allowlist
- **CSRF**: how it works, `SameSite` cookies as the first defence, synchroniser tokens and double-submit patterns, why `GET` must never mutate, and the CORS interaction
- Clickjacking and framing: `X-Frame-Options`, CSP `frame-ancestors`, and UI-redress attacks
- Injection beyond XSS: SQL injection at your API (`L18-cs-data-engineering.md`), command injection, template injection, prototype pollution in JavaScript, open redirects, path traversal in file-serving code, **SSRF** triggered by user-supplied URLs (image proxies, webhooks, previews)
- **Security headers as a checklist**: CSP, HSTS with preload, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP/COEP/CORP for cross-origin isolation, and how to roll out CSP with report-only first
- Authentication and session security: password storage (server-side), passkeys/WebAuthn, MFA, session rotation on privilege change, absolute and idle timeouts, logout everywhere, account enumeration, rate limiting and lockout, and the JWT pitfalls (`alg: none`, algorithm confusion, non-revocability, size in cookies)
- **Supply chain**, the web's sharpest risk: the npm dependency graph, typosquatting and dependency confusion, postinstall scripts, compromised maintainers, lockfiles and integrity hashes, `npm audit` and its noise, provenance and SBOMs, Subresource Integrity for third-party scripts, self-hosting instead of CDN-loading someone else's code, and vetting before adding
- Client-side privacy and abuse: no secrets in client code (including in environment variables that get inlined), scraping and bot defence, rate limiting, CAPTCHAs and their accessibility cost, spam, and abuse of user-generated content
- Privacy and consent as engineering: analytics and tracking, consent management that actually gates loading, fingerprinting surfaces, data minimisation in the client, and the legal frame in `L18-cs-fundamentals.md` Part 21
- Practice: threat-model the application, use the **OWASP Top 10** and the ASVS as checklists, dependency scanning and secret scanning in CI, security review before launch, and a disclosure policy

**Intuition anchors**
- XSS is the master key: it defeats CSRF tokens, reads any JavaScript-accessible storage, and acts as the user. Every other client-side control assumes you don't have XSS.
- The client is the attacker's computer. Validate, authorise, and price everything on the server.

**Mastery checks**
- Write a CSP for a real app using nonces, and explain what breaks and how you'd find out with report-only.
- Explain why `HttpOnly` cookies survive XSS better than `localStorage` tokens, and what XSS can still do.
- Explain a dependency-confusion attack and the controls that prevent it.
- Explain SSRF through an image-proxy endpoint and the correct mitigations.

**Build**
- A security hardening pass on one of your apps: threat model, CSP rolled out report-only then enforced, security headers, cookie-based session with rotation and passkey support, dependency and secret scanning in CI, an SSRF-safe URL fetcher, and a written report of what each control stops.

**Taste**
- Prefer controls the browser enforces (cookie flags, CSP, Trusted Types, CORS) over controls your code enforces. Then assume your code will be bypassed anyway and check again on the server.

---

## PART 8 — Discoverability: SEO, Metadata & Sharing [Core]

- How search works, mechanically: crawling (robots.txt, crawl budget, sitemaps), rendering (crawlers execute JavaScript but with delay and limits — server-rendered content is indexed faster and more reliably), indexing, and ranking signals including Core Web Vitals
- Information architecture for discoverability: stable, meaningful URLs, canonical tags and duplicate handling, pagination signals, internal linking, breadcrumb structure, redirect discipline (301 versus 302, chains, and the SEO cost of URL churn)
- Metadata: `title` and meta description as user-facing copy, Open Graph and Twitter cards for sharing previews, favicons and app icons, theme colour, and generating these per route
- **Structured data**: schema.org vocabulary in JSON-LD, the types that earn rich results (article, product, FAQ, breadcrumb, organisation, event), validation tooling, and the honesty rule (markup must match visible content)
- International sites: `hreflang`, locale routing strategies (subdomain, subdirectory, parameter), language negotiation, and the duplicate-content traps
- The rendering-strategy consequence: SPA-only rendering costs indexing reliability, social previews, and first-paint speed; dynamic rendering as a legacy workaround; streaming SSR or static generation as the modern answer (Part 3)
- The overlap you get for free: semantic HTML, fast LCP, accessible headings, and descriptive links serve users, assistive technology, and crawlers simultaneously
- Measurement: search console data, indexing coverage, structured-data reports, and correlating field Core Web Vitals with search performance

**Intuition anchors**
- A crawler is a user with no JavaScript patience, no mouse, and no context. Everything you do for it also helps a screen-reader user on a slow connection.

**Mastery checks**
- Explain what breaks for search and for social sharing when an app is purely client-rendered, and the two ways to fix it.
- Explain canonical URLs and a case where their absence caused duplicate indexing.

**Build**
- Take a site to a complete discoverability baseline: per-route metadata and Open Graph, JSON-LD for the main content type, sitemap and robots, canonical handling, a redirect map for legacy URLs, and validation evidence for each.

**Taste**
- Treat URLs as a public API: they are shared, bookmarked, indexed, and pasted into documents for years. Changing them carelessly breaks things you'll never see.

---

## PART 9 — The Server Side of the Web [Core → Deep]

- Runtimes and their differences: **Node.js** (the default, single-threaded event loop, worker threads, streams), **Deno** (secure by default, TypeScript-first), **Bun** (speed and bundled tooling), and **edge runtimes** (V8 isolates, no filesystem, short CPU budgets, geographically distributed) — what code can and cannot run in each, and why "runs on Node" is not "runs on the edge"
- The request lifecycle on your server: routing, middleware, parsing (bodies, multipart, cookies), authentication, business logic, rendering or serialisation, compression, and the response; streaming responses and back-pressure; timeouts at every layer; graceful shutdown and connection draining
- **Server-side rendering mechanics**: rendering to a string versus streaming, data loading before or during render, serialising state for hydration, per-request context (auth, locale, feature flags), the cost per request, and protecting the server from render-time errors
- **Caching layers, in order**: browser cache, service worker, CDN edge, server-side response cache (full-page, fragment, data), and the application data cache — each with its own keys, TTLs, and invalidation; tag-based purge, on-demand revalidation, and the incident category that is stale-cache-after-deploy
- CDNs as part of the architecture: edge caching rules, cache keys including cookies and headers (`Vary`), origin shielding, edge compute for personalisation and A/B assignment, geo-routing, and cost
- API and BFF design for browsers: payload shaping, batching, compression, ETags, conditional requests, pagination, idempotency for mutations, and rate limiting with user-visible headers
- Sessions and auth at the server or edge: cookie signing and encryption, session stores versus stateless tokens, per-request validation, CSRF token issuance, and multi-region session consistency
- Background work in web backends: queues, scheduled jobs, webhooks (verification, idempotency, retries, ordering), long-running tasks moved off the request path, and progress reporting to the client
- Serverless and its constraints: cold starts, execution limits, statelessness, connection pooling against databases (a recurring production trap), and cost shapes that reward short requests
- Observability for web applications: structured logs with request IDs, distributed tracing across edge, server, and database, RUM correlated with server traces, error monitoring with source maps uploaded for readable stacks, and dashboards that separate client-side from server-side failure (operations detail in `L18-cs-devops-platform-sre.md`)
- Multi-region and resilience: read replicas near users, write latency, session stickiness, failover behaviour, and what degradation the frontend should show when the backend is unhealthy

**Intuition anchors**
- Caching is where web performance is won and where the worst incidents are born. Every cache needs an owner, a key, a TTL, and a documented invalidation path.
- The edge is fast because it is close and constrained. Design for a small runtime with no local state, or don't deploy there.

**Mastery checks**
- Explain the full cache chain for an authenticated dashboard page and where personalisation forces you to skip each layer.
- Explain why database connection pooling breaks under serverless and three ways to handle it.
- Explain streaming SSR and what the user sees at each stage on a slow connection.

**Build**
- A production-shaped web backend: streaming SSR for one route, an edge-cached static route with tag-based invalidation, a BFF endpoint with ETags and idempotent mutations, cookie sessions, a webhook receiver with verification and replay protection, and tracing that links a browser interaction to a database query.

**Taste**
- Decide what is cached, where, and how it is invalidated *before* you ship the feature. Cache strategy invented during an incident is how sites serve last week's prices.

---

## PART 10 — Build Systems & Tooling [Core]

- What a build actually does: dependency graph resolution, transformation (TypeScript, JSX, CSS), module bundling and chunking, tree shaking, minification, asset hashing and fingerprinting, source-map generation, and emitting a manifest the server or HTML can use
- Bundlers and their positions: **Vite** (native ESM dev server plus a production bundler; the default for new work), esbuild and SWC as fast transformers, Rollup for libraries, webpack as the incumbent with the deepest plugin ecosystem, Turbopack and rspack as the Rust-based successors; the trade-off axis is dev-server speed, build speed, plugin maturity, and output quality
- Modules: ESM versus CommonJS, dual publishing, `exports` maps and conditional exports, side-effect flags (`sideEffects: false`) and what defeats tree shaking, dynamic `import()` as the code-splitting primitive, import maps in the browser
- **Code splitting strategy**: by route, by interaction, vendor chunking, shared chunks, and measuring the result with a bundle analyser; the anti-pattern of a single vendor bundle invalidated by every dependency bump
- TypeScript in the build: type-checking as a separate process from transpilation (why `tsc --noEmit` runs alongside a fast transformer), project references for monorepos, declaration emission for libraries, and build-time cost management (language mechanics in `L1-coding-typescript-javascript.md`)
- CSS pipelines: PostCSS, CSS Modules, utility-first frameworks (Tailwind and its build model), CSS-in-JS runtime versus zero-runtime approaches, critical CSS extraction, and the trade-offs each makes in bundle size, runtime cost, and developer ergonomics (craft considerations in `L18-cs-design-engineering.md`)
- Assets: image pipelines (responsive variants, modern formats, hashed filenames), font subsetting, SVG handling (inline versus sprite versus file), static asset serving with immutable cache headers
- Developer experience as an engineering concern: dev-server startup time, hot module replacement and its limits, type-check latency, test-run time, and treating these as budgets — a slow inner loop taxes every hour of the team's work
- **Monorepos**: workspaces (pnpm, npm, yarn), task orchestration and caching (Turborepo, Nx, Bazel at scale), affected-target detection, shared configuration packages, and dependency-boundary enforcement
- Publishing packages: semantic versioning, changesets, `exports` correctness, testing published artefacts, peer dependencies, and the design-system publishing path
- Dependency hygiene: evaluating a package before adding (maintenance, size, transitive graph, licence, types), lockfiles, renovation cadence, deduplication, and periodic dependency audits with size reporting

**Intuition anchors**
- A bundler is a graph transformation with a caching layer. Once you can name the graph, the chunking, and the invalidation, build problems stop being magic.
- Every dependency is a permanent hire: it consumes build time, bytes, upgrade attention, and security surface for as long as it stays.

**Mastery checks**
- Explain why a single change to a shared utility invalidates a badly chunked vendor bundle, and how to chunk better.
- Explain what defeats tree shaking in a library you publish.
- Explain the difference between transpiling and type-checking TypeScript and why builds do both separately.

**Build**
- Take an existing project and rebuild its toolchain deliberately: measure dev-server start, HMR latency, type-check time, production build time, and output size; then change one thing at a time (bundler, chunking, dependency substitutions) and publish the before/after table.

**Taste**
- Own your build. A toolchain you cannot explain is a toolchain that will fail on a deadline, and "it works, don't touch it" is how a codebase becomes unupgradeable.

---

## PART 11 — Testing the Web [Core]

- The layered strategy for web applications: pure logic in fast unit tests, **component tests** exercising real DOM behaviour, integration tests with the network faked at the boundary, a small number of **end-to-end** journeys on real browsers, and visual and accessibility checks in CI
- The Testing Library philosophy: query by role, label, and text as a user would; avoid testing implementation details; and the useful side effect that role-based queries fail when your markup is inaccessible
- Faking the network: **MSW**-style request interception so the same handlers serve tests, storybook, and local development; contract tests against the real API schema; and avoiding brittle snapshot-of-a-mock tests
- **End-to-end testing**: Playwright (parallelism, tracing, auto-waiting, multiple browsers, network interception, mobile emulation) and Cypress; selecting stable selectors (`data-testid` or roles), authentication strategies (seeded sessions over UI login), test data management, parallel sharding, and flakiness discipline
- Visual regression testing: screenshot diffing across viewports and themes, dealing with fonts and animation nondeterminism, per-component versus per-page approaches, and review workflows
- Accessibility testing in CI: axe integration at the component and page level, keyboard-path tests, and the honest note that automation catches a minority of issues (Part 6)
- Performance testing in CI: Lighthouse CI budgets, bundle-size assertions, and synthetic checks against a preview deployment
- Cross-browser and device coverage: what to test where, browser matrices driven by your analytics, mobile Safari as the perennial special case, and real-device testing services
- Test infrastructure: seeding and resetting state, deterministic time and randomness, parallel-safe fixtures, preview-environment tests, retry policy that surfaces flakiness rather than hiding it, and keeping total CI time inside the team's patience

**Intuition anchors**
- If your tests query by role and label, your tests and your accessibility improve together; if they query by CSS class, both rot together.
- End-to-end tests are expensive and slow: spend them on the journeys that make money and cover everything else lower down.

**Mastery checks**
- Given a flaky E2E test, name five causes in order of likelihood and the fix for each.
- Explain why a component test using `getByRole('button')` is a better test than one using a test id.
- Design the test pyramid for a checkout flow and justify what sits at each layer.

**Build**
- A complete testing setup for one real application: unit and component tests, MSW handlers shared with development, three Playwright journeys with seeded auth, axe checks, visual regression on key components, and Lighthouse budgets — all running in under ten minutes in CI.

**Taste**
- Write tests that describe user-visible behaviour. A suite full of implementation assertions blocks refactoring, which is the opposite of what tests are for.

---

## PART 12 — Delivery & Operating a Web Application [Core → Deep]

*Pipelines, IaC, and on-call practice live in `L18-cs-devops-platform-sre.md`; this Part is what a web engineer owns.*

- Environments and preview deployments: per-branch previews as the review medium, seeded data, environment parity, and secrets per environment
- Release mechanics for the web: immutable hashed assets, atomic deploys, long-lived asset caching with short-lived HTML, the stale-chunk problem after a deploy (a user on the old HTML requesting a removed chunk) and its fixes (retaining old assets, reload-on-chunk-error, version signalling), service-worker update coordination
- **Progressive delivery**: feature flags with owners and expiry, percentage rollouts, A/B experiments with stable assignment and exposure logging, kill switches for risky features, and edge-based assignment to avoid a flash of the wrong variant
- **Frontend observability**: error monitoring with uploaded source maps, RUM for Core Web Vitals segmented by route and device, session replay (with privacy redaction), custom business events, and correlating a browser error with a server trace via a request ID
- Incident practice for frontends: detecting a bad release from error rate and vitals, rollback as the first response, cache purge, kill-switching a feature, and the postmortem discipline from `L18-cs-software-engineering.md` Part 12
- Third-party risk in production: a vendor script slowing or breaking the site, SLAs you don't have, monitoring them separately, and the ability to disable each one quickly
- Cost awareness: bandwidth and CDN egress, server rendering cost per request, image transformation costs, edge invocation counts, and the trade-off between caching aggressiveness and freshness
- Legal and compliance surface the frontend owns: consent management that gates script loading, cookie policies, accessibility statements, and data minimisation in client telemetry

**Intuition anchors**
- On the web you can roll back in seconds — but only if your assets are immutable, your deploys are atomic, and your flags are ready. Those three things are what make releases boring.
- If you can't see Core Web Vitals and JavaScript errors for yesterday's release, you are not operating the application; you are hoping.

**Mastery checks**
- Explain the stale-chunk error after a deploy and two ways to prevent it.
- Design the rollout of a risky redesign: flags, percentages, metrics that would halt it, and the rollback path.
- Explain how you'd tie a user's report of "the page is broken" to a specific release and stack trace.

**Build**
- Instrument and operate one of your sites: source-mapped error monitoring, RUM for vitals by route, feature flags with a kill switch, preview deployments per PR, an atomic deploy with immutable assets, and a written release/rollback runbook — then run a deliberate bad release and rehearse recovery.

**Taste**
- Ship small and often behind flags, and measure the field. The teams that dread releases are the ones who batch them.

---

## PART 13 — Progressive Web Apps & the Web as an App Platform [Deep]

- What a PWA is in engineering terms: a service worker, a manifest, HTTPS, and a design that tolerates offline — installability is the consequence, not the goal
- Service-worker strategy in depth (mechanics in Part 2): precaching the app shell, runtime caching per resource type, navigation fallbacks, versioning and cleanup of old caches, update prompts versus silent updates, and the "user is stuck on an old version" failure that defines badly built PWAs
- Offline capability: IndexedDB as the store, an outbox for queued mutations, Background Sync where supported, conflict resolution, and honest UI about what is and isn't available offline
- Installability and platform integration: the web app manifest (icons, display modes, shortcuts, share target), install prompts and their UX, OS differences (especially on iOS), badging, file handling, and protocol handlers
- **Web push**: subscription and VAPID keys, permission timing, payload encryption, delivery semantics, and the platform caveats that make push on iOS different from Android
- Capabilities and their limits compared with native (`L18-cs-app-engineering.md`): background execution, sensors, Bluetooth/USB, precise storage guarantees, and performance ceilings — and the decision framework for web versus native versus both
- Wrapping the web for distribution: WebViews inside native apps (bridge design, auth sharing, navigation), Capacitor-style hybrids, and desktop shells (Electron, Tauri) with their memory, size, update, and signing considerations
- When the web is the right answer: reach and linkability matter, install friction is fatal, content must be indexable, or the team is web-native; and when it isn't: deep device integration, background reliability, or a performance ceiling below the product's needs

**Intuition anchors**
- A service worker is a proxy you ship and cannot easily recall. Test its update path harder than its caching path.

**Mastery checks**
- Explain the service-worker update lifecycle and design a correct "new version available" flow.
- Explain what a PWA cannot do that a native app can, in five concrete capabilities.

**Build**
- Convert an application to a well-behaved PWA: precached shell, runtime caching per resource type, offline mode with an outbox, a correct update flow with user prompt, manifest with shortcuts, and a tested install experience on Android and iOS.

**Taste**
- Add a service worker only when offline or install genuinely serves the user. An unnecessary one converts every deploy into a cache-invalidation risk.

---

## PART 14 — Taste Development as a Web Engineer [Deep → Lifelong]

**What good looks like:** pages that render meaningful content in under a second on a mid-tier phone; interfaces operable by keyboard and screen reader without special effort; URLs that mean something; forms that work without JavaScript; caches with documented invalidation; a JavaScript budget nobody has to argue about because it's in CI; graceful degradation everywhere; and a codebase where the framework could be swapped without rewriting the domain.

**Reading and sources:** the WHATWG HTML and Fetch living standards, the CSS specifications, and TC39 proposals as primary sources · **web.dev** and the Chrome DevRel material on Core Web Vitals and rendering · MDN for reference · **Baseline** for support decisions · the WCAG 2.2 quick reference and the ARIA Authoring Practices Guide · OWASP Top 10 and the cheat sheets · *High Performance Browser Networking* (Grigorik, free) · Addy Osmani on performance and loading patterns, Jake Archibald on service workers and the event loop, Alex Russell on the mobile performance reality, Sara Soueidan and Adrian Roselli and Heydon Pickering on accessibility, Josh Comeau and Kevin Powell on CSS craft, Rich Harris and Ryan Carniato and Dan Abramov on rendering architecture debates (read all sides) · browser release notes and Interop project results each year

**Deliberate exercises:** rebuild one component of a site you admire with no framework · audit a popular site with DevTools and write what you'd fix in order · pick a library you use daily and read its source until you could reimplement the core · take a page from 5 MB to 500 KB and write up every decision · spend a week developing with 4× CPU throttling and Slow 4G as the default · run your site through a screen reader monthly · read one spec section a week rather than a blog post about it

**Anti-taste:** shipping a framework to render a brochure page · `div` soup with click handlers · `localStorage` tokens · disabling ESLint accessibility rules to ship · spinners as the whole loading design · infinite scroll with no URL state · carousels nobody asked for · a 900 KB date library · third-party scripts added without measurement · cache headers copied from a blog post · `!important` as conflict resolution · chasing framework releases instead of measuring user outcomes

---

## PART 15 — Professional Growth [Lifelong]

- Following the platform: browser release notes (Chrome, Safari, Firefox), the annual Interop project, WHATWG and TC39 activity, and Baseline as the shipping signal; separating "new" from "usable"
- Communities and signal: web.dev, MDN, the Interop and Baseline teams, conference archives (performance.now(), Smashing, State of the Browser), and the frameworks' own RFC processes
- Career shapes: product frontend engineer, full-stack web engineer, platform/DX engineer (build systems, design systems, tooling), performance specialist, accessibility specialist, **design engineer** (`L18-cs-design-engineering.md`), and web-infrastructure roles at CDN and framework companies
- Portfolio evidence that carries weight: a site with excellent field vitals, an accessibility audit you performed and fixed, a performance rescue written up with numbers, a published package with real users, and open-source contributions to tooling
- Interviews: rendering strategies and their trade-offs, browser mechanics (event loop, rendering pipeline, caching), state architecture, accessibility and security fundamentals, debugging a live page in DevTools, and system design for a web product
- Staying current without churn: the platform moves slowly and is forever; frameworks move fast and are replaceable. Invest proportionally

---

## Capstone Projects

1. **A no-framework application** — routing, data caching, forms with progressive enhancement, a service worker, and one custom element, built only on platform APIs (Parts 1, 2)
2. **A rendering-strategy comparison** — the same app as SPA, streaming SSR with islands, and static generation, measured on vitals, bytes, and cost (Part 3)
3. **A performance rescue** — a real site from failing to passing Core Web Vitals in the field, with CI budgets and a RUM dashboard, written up decision by decision (Part 5)
4. **A WCAG 2.2 AA audit and remediation** of a real product, with automated, keyboard, screen-reader, zoom, and forced-colors passes (Part 6)
5. **A security hardening project** — threat model, CSP with nonces, full header set, cookie sessions with passkeys, dependency and secret scanning (Part 7)
6. **A production data layer** — typed API client, query cache with invalidation rules, optimistic mutations, WebSocket reconciliation, offline outbox (Part 4)
7. **A design-system package** consumed by two applications, published with correct exports, visual and accessibility tests (Parts 10, 11; `L18-cs-design-engineering.md`)
8. **Flagship: ship and operate a real web product** — preview deploys, flags, RUM, error monitoring, a bad-release rehearsal, and a written year-one retrospective (Parts 9, 12)

---

## Resource Library

**Primary:** WHATWG HTML, DOM, Fetch, URL standards · CSS specifications and MDN · web.dev (Core Web Vitals, rendering, loading) · Chrome DevTools documentation · Baseline and the Interop project · WCAG 2.2 quick reference and the ARIA Authoring Practices Guide · OWASP Top 10, ASVS, and cheat sheets · RFC 9110/9111/9112/9114 for HTTP

**Books:** *High Performance Browser Networking* (Grigorik, free) · *Web Performance in Action* / *Learning HTTP/2* for transport depth · *Inclusive Components* and *Inclusive Design Patterns* (Pickering) · *Accessibility for Everyone* (Kalbag) · *Refactoring UI* for the design boundary · *CSS: The Definitive Guide* (Meyer & Weyl) as reference · *JavaScript: The Definitive Guide* and *You Don't Know JS* for the language side (with `L1-coding-typescript-javascript.md`) · *Designing Data-Intensive Applications* 2e for the backend half · *Building Secure and Reliable Systems* (Google, free)

**Courses & structured material:** frontendmasters courses on browser internals, performance, and accessibility · web.dev learn paths (HTML, CSS, accessibility, performance, PWA) · Josh Comeau's CSS and React material · Deque University for accessibility · the Chrome DevTools "Perf" and "Rendering" documentation used as a lab manual

**Tools to know cold:** Chrome DevTools (network, performance, coverage, memory, rendering, accessibility, Lighthouse) · WebPageTest · CrUX and a RUM provider · axe DevTools and a screen reader · Playwright · a bundle analyser · Sentry or equivalent · `curl -v` and HTTP header inspection

**Practice:** rebuild real screens under the hostile spec in `T18-cs-web-engineering.md` · audit sites you use and write the fix list · contribute to an open-source web project's accessibility or performance · take one page to perfect field vitals and keep it there for a quarter

---

## Suggested Learning Order

1. **Part 0 → Part 2** — the platform itself: semantic HTML, the DOM, CSS layout, and core APIs, built without a framework at least once
2. **Part 1** — browser internals, as soon as you have something to measure; this is what turns advice into understanding
3. **Part 6** — accessibility, early and permanently, because retrofitting is the expensive path
4. **Part 3 → Part 4** — architecture and the data layer, on a real application with your chosen framework (`L1-coding-typescript-javascript.md` in parallel)
5. **Part 5** — performance with field data, once real users exist
6. **Part 7** — security, before anything handles authentication or user content
7. **Part 10 → Part 11** — build tooling and testing as the application grows past one person
8. **Part 9 → Part 12** — the server side and operations, when you own the whole product
9. **Part 8 → Part 13** — discoverability and PWA capabilities, driven by product need
10. **Parts 14–15** — continuous: one spec section, one audit, one teardown a week

**Rough scale (for planning, not promises):** competent product-level web engineering (steps 1–4) is typically a few hundred focused hours for someone already programming; the difference between that and engineering a web product you'd defend — field vitals, accessibility, security, caching, and operations — is another several hundred hours and at least one product you have shipped, measured, and maintained through incidents.
