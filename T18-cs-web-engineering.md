# Web Engineering → Training Programme
## T18: Computer Science · Platform Drills · Screen Reps · Audit Hunts · Rescue Trials · Taste Forge

> The training counterpart to `L18-cs-web-engineering.md`. The web has the best training feedback of any platform in this series: everything is measurable in a tool you already have open. DevTools, an axe scan, a Lighthouse run, and a screen reader will tell you the truth about your work in under a minute — so this programme is built on **measure, fix, re-measure**, with the numbers logged.
>
> Three outcomes: **muscle memory** (building an accessible, fast, resilient screen without looking things up), **intuition** (predicting what a waterfall, a trace, or an audit will say before you run it), and **taste** (your own standards for what ships).
>
> Pair with `T1-coding-typescript-javascript.md` for the language and framework reps. `L#` refers to a Part of the L file.

---

## 1. How to Train

**Session shapes**

| Shape | Length | Use |
|---|---|---|
| **Drill** | 25–45 min | Section 3. Build one behaviour with platform APIs only, timed. |
| **Screen rep** | 90 min | Section 4. Rebuild a real screen to the hostile spec. |
| **Hunt** | 45–60 min | Section 5. Performance, accessibility, or security audit of a real site, ending in numbers. |
| **Trial** | 60–90 min | Section 6. Adversarial: rescue, incident, migration, no-framework. |
| **Build** | Half day+ | Section 7. Advance a real project one rung. |
| **Forge** | 30–45 min, weekly | Section 9. Standards, teardowns, predictions scored. |

**Rules of the room**
1. **Throttled by default**: 4× CPU slowdown and Slow 4G in DevTools for every drill and rep. Your laptop is not a user.
2. **Keyboard only, once per session.** Complete what you just built using only the keyboard. If you can't, it isn't done.
3. **Numbers or it didn't happen.** Every performance or accessibility claim needs a Lighthouse run, a trace, an axe scan, or a field measurement attached.
4. **Platform first in drills.** No framework unless the drill says so — frameworks are for builds, not drills.
5. **Predict before you measure** (Section 8), and log it.
6. **One repo plus one live site.** `web-training/` with `drills/`, `reps/`, `audits/`, `traces/`, `standards.md`, `predictions.md`, `LOG.md` — and a deployed site you actually operate, because field data is the curriculum.

**Weekly minimum:** 3 drills · 1 screen rep · 1 hunt · 1 build session · 1 forge entry. Trials fortnightly.

---

## 2. The Belt Ladder

Cold, timed, throttled, with the hostile spec applied.

| Belt | Gate | Covers |
|---|---|---|
| **White** | In 45 min: a semantic, responsive page with a working form (no JS), passing axe with zero violations and keyboard-complete. | L# 2, 6 |
| **Yellow** | In 60 min: add fetch-driven content with loading, empty, error, and offline states; URL reflects filter state; no layout shift. | L# 2, 3 |
| **Orange** | In 90 min: no-framework SPA — client routing with the History API, focus management on route change, scroll restoration, prefetch on hover. | L# 2, 3, 6 |
| **Green** | In 2 h: take a deliberately slow page to green Core Web Vitals in the lab, with a written cause list and before/after traces. | L# 5 |
| **Blue** | In 2 h: a service worker with precache, runtime caching, an offline fallback, and a correct update-prompt flow — proven by deploying twice. | L# 2, 13 |
| **Brown** | In 3 h: a security pass — CSP with nonces enforced, full header set, cookie session with rotation, an SSRF-safe fetcher, dependency scan — with a report of what each stops. | L# 7 |
| **Black** | Over a quarter: operate a real site with field vitals in the good range at p75, a WCAG 2.2 AA audit passed, CI budgets, an error-monitoring setup, and a rehearsed rollback. | L# 5–12 |

---

## 3. Drill Bank

**D1 — Platform reflexes (no framework)**
| Drill | Target |
|---|---|
| Accessible modal from scratch: focus trap, restore focus, `Esc`, `inert` background, correct roles | 35 min |
| Combobox with keyboard support per the ARIA APG (or argue for the native element and prove it) | 45 min |
| Client-side router: History API, focus and announcement on navigation, scroll restoration | 40 min |
| Form with native validation, custom error summary, and full no-JS fallback | 30 min |
| `IntersectionObserver` lazy loading + infinite list with URL-synced pagination | 30 min |
| Service worker: precache, runtime SWR cache, offline page, version cleanup | 45 min |
| IndexedDB store with an outbox queue and replay on reconnect | 45 min |
| Custom element with shadow DOM, slots, and `::part` styling | 35 min |

**D2 — Rendering and layout**
| Drill | Target |
|---|---|
| Reproduce layout thrashing, measure it, fix with batched reads/writes | 20 min |
| Composited vs non-composited animation, with frame traces for both | 20 min |
| A responsive card grid with container queries and no media queries | 25 min |
| Zero-CLS image and font loading for a hero section | 25 min |
| Virtualised list of 50,000 rows at 60 fps under 4× throttle | 40 min |

**D3 — Data and state**
| Drill | Target |
|---|---|
| Query cache from scratch: dedupe in-flight, stale-while-revalidate, invalidation | 45 min |
| Optimistic update with rollback and conflict handling | 30 min |
| WebSocket client with reconnect, backoff, heartbeat, and cache reconciliation | 40 min |
| Detect and fix a request waterfall in an existing page | 25 min |
| Cookie-session auth flow with CSRF protection and logout across tabs | 40 min |

**D4 — Diagnosis reflexes**
Read a network waterfall and name the critical-path blocker · capture a performance trace and find the long task · run coverage and find unused JavaScript · read the accessibility tree for a widget · find a memory leak in a heap snapshot · find the CLS source with the rendering panel · read a CSP violation report and fix it. **Target: each under 8 minutes.**

---

## 4. Screen Reps

One per week, 90 minutes, rebuilding a screen from a real product. **The hostile spec every rep must pass:**

- Loading, empty, error, and offline states designed, not improvised
- Works with JavaScript disabled for the primary action (or degrades explicitly)
- Keyboard-complete with visible focus; axe with zero violations; sensible screen-reader traversal
- 200% zoom and 320 px reflow without loss; `prefers-reduced-motion` respected; forced-colors survivable
- LCP under 2.5 s and INP under 200 ms under 4× CPU and Slow 4G; zero unexpected CLS
- URL encodes shareable state; back button behaves; reload restores
- One RTL locale renders correctly

**Rep list:** a pricing page with a comparison table · a product listing with faceted filters in the URL · a search-as-you-type with debounce and cancellation · a multi-step checkout form · a dashboard with charts and date-range selection · a settings page with optimistic toggles · a comment thread with nested replies and live updates · a media gallery with lazy loading and a lightbox · a data table with sorting, pagination, and column visibility · an onboarding flow with progress persistence.

---

## 5. Hunts

One per week, rotating. Each ends with numbers and a written cause list.

- **Performance hunt.** Pick a real site (yours or a public one). Lab + field baseline, then the top five causes across images, fonts, JavaScript, third parties, and long tasks, each with the specific fix. Re-measure.
- **Accessibility hunt.** Automated scan, then keyboard pass, then screen-reader pass, then zoom and forced-colors. Categorise findings by WCAG criterion and severity.
- **Security hunt.** Headers check, CSP evaluation, cookie flags, dependency audit, an XSS sink review of your own code, and an SSRF review of any URL-fetching endpoint.
- **Bundle hunt.** Analyse the bundle, find the three heaviest dependencies, and either replace, defer, or justify each in writing.
- **Cache hunt.** Map every cache layer for one route — browser, service worker, CDN, server, data — with keys, TTLs, and invalidation paths. Find the one nobody can explain.
- **Waterfall hunt.** Record a cold-load trace and rewrite the loading order: what's blocking, what should be preloaded, what should be deferred, what shouldn't ship at all.

---

## 6. Trials

- **The rescue.** Inherit an unfamiliar repository. In 90 minutes: run it, measure it, and produce a prioritised fix list with evidence — no code changes, just diagnosis you could defend.
- **The 500 KB trial.** Take a page over 2 MB of JavaScript and get it under 500 KB without losing features. Write up every decision.
- **The no-framework trial.** Rebuild a feature you'd normally use a framework for, with platform APIs only, then list precisely what the framework was buying you.
- **The bad-release drill.** Deploy a deliberately broken build to a preview or staged environment; detect it from monitoring, roll back, purge caches, and write the postmortem against the clock.
- **The stale-chunk trial.** Reproduce the "user on old HTML requests a removed chunk" failure, then implement and verify a fix.
- **The screen-reader day.** Use your own site for a full session with the screen on but your eyes closed for the primary flows.
- **The migration trial.** Move one route from client-rendered to server-rendered (or vice versa) and measure what actually changed in vitals and cost.
- **The third-party trial.** Remove or facade every third-party script on a page and measure the difference; then argue each one back in on evidence.

---

## 7. Build Ladder

| # | Build | Forces |
|---|---|---|
| 1 | A content site with perfect semantics, metadata, and field vitals in the good range | L# 2, 5, 8 |
| 2 | Add a data-driven section: query cache, all edge states, URL-synced filters | L# 3, 4 |
| 3 | Add authentication: cookie sessions, CSRF, passkey enrolment, logout across tabs | L# 4, 7 |
| 4 | Take it to WCAG 2.2 AA with a written audit and CI checks | L# 6, 11 |
| 5 | Add a design-system package consumed by the app, published with correct exports | L# 10 |
| 6 | Server-render one route with streaming; measure against the client-rendered version | L# 3, 9 |
| 7 | Add the caching chain: CDN rules, tag-based invalidation, immutable assets, documented keys | L# 9 |
| 8 | Add the test pyramid: component tests, MSW, three Playwright journeys, visual and axe checks | L# 11 |
| 9 | Add observability: source-mapped errors, RUM vitals by route, business events, request-ID correlation | L# 12 |
| 10 | Add progressive delivery: flags with expiry, percentage rollout, kill switch, preview deploys | L# 12 |
| 11 | Security hardening: CSP with nonces, full headers, dependency and secret scanning, SSRF-safe fetching | L# 7 |
| 12 | **Flagship:** operate it for a year — field vitals at p75, an incident and postmortem, a framework or runtime upgrade, and an annual retrospective | all |

---

## 8. Intuition Probes

Log in `predictions.md`; score monthly.

- **Waterfall probe:** before opening the network panel, predict the critical-path blocker and the largest resource.
- **Vitals probe:** predict LCP element, INP-worst interaction, and CLS source before running Lighthouse.
- **Audit probe:** predict the top three axe violations on a page you built before scanning.
- **Bundle probe:** predict your three heaviest dependencies and their approximate share before analysing.
- **Trace probe:** predict where the long task comes from before recording.
- **Cache probe:** predict which layer serves a given request (and whether it's stale) before checking headers.
- **Break probe:** before shipping, predict what will break first on Safari, on a slow network, and at 200% zoom.

Accuracy above 80% on the vitals and audit probes is the sign that you can design correctly rather than fix repeatedly.

---

## 9. Taste Forge

- **`standards.md`** — your own web standards: the states every screen must have, your performance budgets per route type, the accessibility checklist, the security header set, rules for adding a dependency or a third-party script, and what you refuse in review. Every revision cites a real measurement, audit finding, or incident.
- **Teardown.** Monthly, audit a site you admire and one you don't: network waterfall, bundle, vitals, accessibility tree, headers. Write one page each on what you'd steal and what you'd refuse.
- **Rebuild-and-compare.** Take a component from a popular library and rebuild it on platform primitives; compare bytes, accessibility, and behaviour.
- **The deletion pass.** Each month, remove a dependency, a third-party script, an abstraction layer, and a feature flag from your own site; measure the effect.
- **Spec club.** Read one section of a living standard per week (HTML, Fetch, CSS, WCAG) instead of a blog post; write three sentences on what surprised you.
- **Defend a heresy.** Argue properly for: no framework at all, server-rendered HTML with a sprinkle of JavaScript, no design system, no client-side router, no analytics. Then decide with evidence.

---

## 10. Assessment & Graduation

Trained when, with artefacts:
1. Every drill in Section 3 passes cold within its time target, under throttling, axe-clean.
2. You can take a screen through the full hostile spec in one 90-minute rep, repeatedly.
3. A site you operate has field Core Web Vitals in the good range at p75, sustained for a quarter.
4. You have completed a WCAG 2.2 AA audit on a real product with remediation evidence, including a screen-reader pass.
5. You have enforced CSP with nonces in production and can explain every header you set.
6. You can diagnose an unfamiliar slow page from DevTools alone and produce a prioritised, evidence-backed fix list in under an hour.
7. Your CI enforces bundle-size and Lighthouse budgets, and the last three regressions were caught there rather than in the field.
8. You have shipped, broken, detected, and rolled back a release deliberately, with a postmortem.
9. Prediction accuracy on vitals and audit probes exceeds 80% over 30+ entries.
10. `standards.md` exists, revised five times, each rule traceable to a measurement or incident.
11. You can explain the rendering pipeline, the caching chain, and the accessibility tree to a competent backend engineer in ten minutes each.

---

## 11. Spaced Schedule & Logbook

**Weekly:** Mon D1 drill · Tue D2/D3 drill · Wed build rung · Thu hunt · Fri screen rep · Sat trial (fortnightly) or D4 diagnosis drill · Sun forge + log review.

**Cadence:** weekly — score predictions, re-run one older drill, check field vitals. Monthly — full audit round (performance, accessibility, security) on your live site, one teardown, one `standards.md` revision, dependency and bundle review. Quarterly — re-attempt the belt gate cold, review browser release notes and Baseline changes for anything you can now ship or must migrate, rehearse a rollback. Annually — a framework/runtime upgrade slot and a written retrospective on the site you operate.

**Spaced repetition (facts):** Core Web Vitals thresholds and what each measures · cache-control directives and their semantics · CORS preflight rules · cookie attribute effects · CSP directives and nonce mechanics · WCAG criteria you keep failing · ARIA rules and the APG patterns you use · event-loop ordering (task, microtask, rAF, rIC) · which CSS properties trigger layout versus paint versus composite · HTTP status semantics · your own budgets.

**Logbook** (`LOG.md`):

```
## 2026-09-29 · Hunt · 55 min · Performance hunt on own site
Baseline (field p75): LCP 3.4s, INP 260ms, CLS 0.02.
Causes: hero image not preloaded and lazy-loaded (LCP);
one 180ms handler doing layout in a loop (INP); fonts fine.
Fixed: fetchpriority=high + removed lazy on hero; batched reads,
yielded with scheduler.yield in the handler.
Lab after: LCP 1.6s, INP 90ms. Field to be checked in 28 days.
Prediction: said LCP would be font-related. Miss — it was the image.
```

**Monthly roll-up:** drills at target · prediction hit rate · field vitals trend at p75 · axe violations open · bundle size trend · third-party count · trials run · standards revisions and causes · one change for next month.

---

## 12. If You Only Have Thirty Days

Two hours a day, six days a week, on one real site you deploy.

| Week | Focus | Outcome |
|---|---|---|
| 1 | L# 0–2, 6; D1 drills daily; Build rungs 1 and 4 | A semantic, accessible, keyboard-complete site with clean axe scans and good lab vitals |
| 2 | L# 1, 5; D2 and D4 drills; performance and bundle hunts; screen reps ×2 | Field vitals instrumented and improved, budgets in CI, hostile-spec screens |
| 3 | L# 3, 4; D3 drills; Build rungs 2, 3, 6 | Data layer with a query cache and optimistic updates, cookie auth, one streaming SSR route |
| 4 | L# 7, 9, 12; Build rungs 7, 9, 10, 11; bad-release drill | CSP and headers enforced, caching chain documented, RUM and error monitoring live, a rehearsed rollback |

Then the weekly loop — one drill, one rep, one hunt, one forge entry — against a site whose field data you actually watch.
