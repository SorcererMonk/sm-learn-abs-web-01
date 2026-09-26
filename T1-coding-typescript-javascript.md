# TypeScript & JavaScript → Training Programme
## T1: Coding · Semantics Drills · From-Scratch Builds · Async Trials · Type Katas · Taste Forge

> The training counterpart to `L1-coding-typescript-javascript.md`. This ecosystem has a specific training hazard: it is possible to be productive for years without understanding the layer underneath, because the framework hides it — until a race condition, a memory leak, a hydration mismatch, or a published package that nobody can import. This programme is built to close exactly that gap.
>
> Three outcomes: **muscle memory** (writing correct async, correct types, and correct components without lookup), **intuition** (predicting output order, inferred types, re-renders, and bundle impact before running anything), and **taste** (your own rules for types, errors, dependencies, and abstraction).
>
> Pair with `T18-cs-web-engineering.md` (the platform and delivery half) or `T18-cs-app-engineering.md` for React Native work. `L#` refers to a Part of the L file.

---

## 1. How to Train

**Session shapes**

| Shape | Length | Use |
|---|---|---|
| **Drill** | 20–40 min | Section 3. Write one thing from scratch, timed, then delete it. |
| **Prediction set** | 15 min | Section 8. Ten snippets; write the output or inferred type before running. |
| **From-scratch build** | 90 min–half day | Section 4. Reimplement a piece of the ecosystem. |
| **Trial** | 45–90 min | Section 6. Async races, leaks, type migrations, dependency removal. |
| **Build** | Half day+ | Section 5. Advance a real project one rung. |
| **Forge** | 30–45 min, weekly | Section 9. Standards, teardowns, scored predictions. |

**Rules of the room**
1. **`strict` plus `noUncheckedIndexedAccess`, always.** No `any`, no `as`, no `!`, no `@ts-ignore` in training code. If you need one, that is the lesson — write down why.
2. **No framework in drills.** Frameworks are for builds. Drills are the language, the runtime, and the type system.
3. **Predict before you run.** Output order, inferred type, re-render count, bundle delta. Log it (Section 8).
4. **Read the emitted output** at least once a week: `tsc` output, the bundler's chunk, the compiled component.
5. **Zero floating promises.** Every async drill must pass `no-floating-promises` and handle cancellation explicitly.
6. **One repo.** `ts-training/` with `drills/`, `scratch/`, `trials/`, `types/`, `standards.md`, `predictions.md`, `LOG.md`.

**Weekly minimum:** 3 drills · 2 prediction sets · 1 from-scratch session · 1 build session · 1 forge entry. Trials fortnightly.

---

## 2. The Belt Ladder

Cold, timed, strict mode, no escape hatches.

| Belt | Gate | Covers |
|---|---|---|
| **White** | In 30 min: parse a messy dataset (mixed types, missing fields) into a validated, typed shape and produce three aggregations, with tests. | L# 1, 2, 5 |
| **Yellow** | In 45 min: an async pipeline — concurrency limit 5, retry with backoff, per-item timeout, overall `AbortSignal`, ordered results. | L# 3 |
| **Orange** | In 60 min: a discriminated-union state machine for a multi-step flow, exhaustively handled, with the compiler rejecting an added case that isn't handled. | L# 5, 13 |
| **Green** | In 90 min: implement a Promise class passing the core spec behaviours (then chaining, thenable assimilation, microtask timing). | L# 3 |
| **Blue** | In 2 h: a mini-React — elements, reconciliation with keys, `useState`, `useEffect`, commit phase — rendering a working todo app. | L# 8 |
| **Brown** | In 3 h: publish a package with correct `exports`, ESM, types, tree-shakeable, type tests, verified by installing the tarball into three consumers. | L# 4, 12 |
| **Black** | Over a month: migrate a real codebase to `strict` + `noUncheckedIndexedAccess` with zero `any`, fix one real memory leak and one real race condition found by trace, and publish the write-up. | L# 5–8, 14 |

---

## 3. Drill Bank

**D1 — Semantics (no libraries, from memory)**
| Drill | Target |
|---|---|
| Implement `bind`, `call`, and `apply`, including `new` behaviour | 20 min |
| Implement `Object.create`, `instanceof`, and a prototype chain walker | 20 min |
| Deep clone with cycles, `Map`/`Set`/`Date` support — then compare with `structuredClone` | 25 min |
| Deep equality with sensible rules, documented | 20 min |
| Grapheme-correct string length, reverse, and truncate | 25 min |
| Currying, partial application, and a typed `pipe`/`compose` | 25 min |
| A getter/setter-based observable object with property descriptors | 25 min |

**D2 — Async**
| Drill | Target |
|---|---|
| Promise pool with concurrency limit, preserving result order | 25 min |
| Retry with exponential backoff and jitter, respecting an `AbortSignal` | 20 min |
| Timeout wrapper that actually cancels the underlying work | 20 min |
| Single-flight request deduplication with a cache | 25 min |
| Debounce and throttle with cancel and flush, typed generically | 25 min |
| Async queue with pause, resume, and drain | 30 min |
| Convert an EventEmitter into an async iterable with back-pressure and cleanup | 30 min |
| Race-safe "respond only to the latest request" search handler | 20 min |

**D3 — Types**
| Drill | Target |
|---|---|
| Implement `Pick`, `Omit`, `ReturnType`, `Awaited`, `DeepReadonly` from scratch | 30 min |
| Discriminated union + exhaustive switch + `never` guard for a request lifecycle | 15 min |
| Branded types with smart constructors for two identifier kinds that must not mix | 20 min |
| Template-literal types for event names with typed payload lookup | 30 min |
| A schema validator (tiny Zod) whose inferred type is derived from the schema | 45 min |
| Type a function that accepts a config object and returns a precisely narrowed result | 25 min |
| Fix a real `any`-heavy file to zero escape hatches | 30 min |

**D4 — Runtime and tooling reflexes**
Write a `tsconfig` from scratch and justify each flag · set up flat ESLint with typed rules · write a Vitest suite with fake timers for a debounce · capture a `node --cpu-prof` and read it · take a heap snapshot and find a retaining path · read a bundle analysis and name the three heaviest modules · publish a package locally with `npm pack` and install it. **Target: each under 10 minutes.**

---

## 4. From-Scratch Builds

The highest-value exercise in this file. Each one permanently removes a category of mystery. One per fortnight.

| Build | Removes the mystery of |
|---|---|
| **A Promise implementation** (states, chaining, thenables, microtask timing) | async semantics |
| **A mini-React** (elements, reconciler, keys, hooks queue, commit) | rendering and hooks |
| **A signals library** (~100 lines: signal, computed, effect, dependency tracking) | fine-grained reactivity |
| **A schema validator** with type inference | the runtime/type boundary |
| **A tiny bundler** (parse imports, build a graph, emit a single file) | modules and tree shaking |
| **A state store** with selectors and `useSyncExternalStore` | external state and tearing |
| **A query cache** (dedupe, stale-while-revalidate, invalidation) | server-cache state |
| **A virtual list** (windowing, variable heights, scroll anchoring) | list performance |
| **A router** (History API, matching, params, nested routes) | client routing |
| **An event loop visualiser** (log task/microtask/render ordering) | the event loop |

**Protocol:** build it from your own understanding first, without reading the real implementation; then read the real one and write a page on what it handles that you didn't.

---

## 5. Build Ladder

| # | Build | Forces |
|---|---|---|
| 1 | A CLI tool in strict TypeScript with validated input and a published binary | L# 1, 5, 11 |
| 2 | A typed API client with schemas as the source of truth, retry, and cancellation | L# 3, 6, 13 |
| 3 | A React application with a correct state taxonomy and zero derived-state effects | L# 8 |
| 4 | A component library published with correct `exports`, types, and type tests | L# 4, 12 |
| 5 | A Node service with streams, graceful shutdown, and event-loop-lag monitoring | L# 11 |
| 6 | The same service made runtime-portable against web standards, deployed to an edge target | L# 11 |
| 7 | A strict-mode migration of an existing codebase, `any` count tracked to zero | L# 5, 6 |
| 8 | A performance pass: hidden-class and allocation fixes, a leak hunt, a worker offload | L# 7 |
| 9 | A hardening pass: boundary validation, prototype-pollution safety, dependency audit, secret scanning | L# 14 |
| 10 | A React Native feature with a custom TurboModule and a Reanimated gesture | L# 9 |
| 11 | The same small app in React and a signals framework, with a written comparison | L# 10 |
| 12 | **Flagship:** a product shipped and operated, with the L18 engineering discipline attached | all |

---

## 6. Trials

- **The race trial.** Build a search-as-you-type against a slow API that returns out of order. Make it correct with cancellation, then break it deliberately and watch the wrong result win.
- **The leak trial.** Introduce a leak (listener, timer, closure, unbounded cache) into a running app; find it from heap snapshots alone within 30 minutes; fix the class, not the instance.
- **The strict trial.** Take a file with ten `any`s and remove all of them without a single assertion. Where you can't, write down the design reason.
- **The dependency-removal trial.** Remove one dependency from a real project by replacing it with built-ins; measure bundle delta and write what you lost.
- **The publish trial.** Publish a package and install it into a Node ESM project, a bundler project, and a TypeScript project. Most packages fail at least one; make yours fail none.
- **The output-order trial.** Given twenty mixed sync/micro/macro snippets, score yourself cold. Repeat monthly until you stop missing any.
- **The re-render trial.** Instrument a React screen, predict the re-render count for three interactions, then measure with the profiler.
- **The upgrade trial.** Upgrade a major framework or runtime version in a real project, read the migration guide properly, and write up what broke and why.

---

## 7. Read & Reimplement

**Monthly:** read a small, excellent implementation; reimplement one part from notes; diff; write one page.

**Targets:** Preact's diff and hooks · Solid's reactive core · Zod's inference types · TanStack Query's cache and dedupe logic · Node's `EventEmitter` and a stream implementation · Hono's routing and web-standard handler model · `p-limit` and `p-retry` (tiny, well-designed) · Testing Library's queries · a chunk of the TypeScript compiler's checker on one narrow feature **[Deep]**.

**Also read, as design documents rather than code:** three TC39 proposals with their rejected alternatives, two TypeScript release notes end to end, and React's "you might not need an effect" and rules-of-React pages.

---

## 8. Prediction Sets

Twice a week, fifteen minutes, ten items. Write the answer, then run. Score in `predictions.md`.

- **Output-order sets:** snippets mixing sync logs, `setTimeout(0)`, `queueMicrotask`, promise chains, `await`, and (in Node) `process.nextTick`.
- **Inference sets:** given a function or a `const`, predict the inferred type exactly — including widening, literal preservation, and what `as const` or `satisfies` would change.
- **Narrowing sets:** predict what the type is inside each branch after a guard, and where narrowing is lost (closures, `await`, reassignment).
- **Coercion sets:** predict the result of comparison and arithmetic expressions and name the algorithm step responsible.
- **Re-render sets:** predict which React components re-render on a given state change and why.
- **Bundle sets:** predict the bundle delta of adding a given import, then measure.
- **Error sets:** predict which of five snippets throws, which rejects, and which silently swallows.

Target: above 85% on output-order and inference sets before you consider Part 3 and Part 5 internalised.

---

## 9. Taste Forge

- **`standards.md`** — your house rules: when a type may be asserted, error-handling pattern, validation boundaries, dependency-addition checklist, async rules (cancellation, no floating promises), React rules (state placement, effects), and what you refuse in review. Each rule cites the bug or trial that produced it.
- **Dependency diet.** Monthly: remove one dependency, justify one that stays, and record the bundle and maintenance delta.
- **The un-golf exercise.** Solve a hard type challenge, then write the version you'd actually ship and compare readability. Ship the second one.
- **Read the emitted code** of a component or module you wrote, monthly, and note one thing that surprised you.
- **Proposal club.** One TC39 proposal a week: the motivation, the rejected alternatives, and whether you'd have voted for it.
- **Self-review at distance.** Your code from six months ago: hunt for `any`, floating promises, effects deriving state, and abstractions with one caller.
- **Defend a heresy.** Argue properly for: no TypeScript on a small project, classes over hooks, no state library ever, a monorepo for two packages, keeping `jQuery`-style imperative code in one corner. Then decide.

---

## 10. Assessment & Graduation

Trained when, with artefacts:
1. Every Section 3 drill passes cold within its time target, strict, with no escape hatches.
2. Output-order and inference prediction accuracy exceeds 85% over 100+ items.
3. You have built at least five of the Section 4 from-scratch implementations, including a Promise and a mini-React.
4. A real codebase of yours is `strict` plus `noUncheckedIndexedAccess` with zero `any` and every assertion individually justified in a comment.
5. You have published a package that installs cleanly into Node ESM, a bundler, and a TypeScript project.
6. You have found and fixed a real memory leak from a heap snapshot and a real race condition from a trace.
7. Every boundary in a project you own is schema-validated, and you can name each boundary.
8. You can explain the event loop, the type system's structural nature, and React's render/commit split to a competent engineer from another ecosystem in ten minutes each.
9. `standards.md` exists, revised five times, each rule traceable to an incident.
10. You have deleted more dependencies in the last six months than you added.

---

## 11. Spaced Schedule & Logbook

**Weekly:** Mon D1 drill + prediction set · Tue D2 async drill · Wed build rung · Thu D3 type drill + prediction set · Fri from-scratch session (fortnightly) or trial · Sat read-and-reimplement · Sun forge + log review.

**Cadence:** weekly — score predictions; re-run one older drill cold. Monthly — dependency diet, emitted-code read, self-review of three-month-old code, one proposal summary set. Quarterly — re-attempt the belt gate; audit the codebase for `any`, floating promises, and derived-state effects; review TypeScript and runtime release notes for what you should adopt or migrate. Annually — a major upgrade slot (framework, runtime, or TypeScript major) done deliberately with a written retrospective.

**Spaced repetition (facts):** coercion and equality rules · the five `this` binding rules · event-loop ordering including `process.nextTick` · promise combinator semantics · `tsconfig` strict-family flags and what each catches · utility-type definitions · variance rules · `exports` map conditions · React hook semantics and the rules of hooks · Node stream back-pressure · the security checklist from L# 14.

**Logbook** (`LOG.md`):

```
## 2026-10-06 · Drill · 30 min · D2 promise pool with ordered results
Target 25 → 31 min. First version preserved order by awaiting in sequence
after starting all — worked, but held every result in memory.
Second version used an index-keyed array and resolved in place.
Miss: forgot to propagate AbortSignal into the in-flight requests,
so "cancel" only stopped scheduling new ones.
Rule → standards.md: every concurrency helper takes and forwards a signal.
Prediction set: 8/10 on output order; both misses were nextTick vs microtask.
```

**Monthly roll-up:** drills at target · prediction accuracy by set type · from-scratch builds completed · `any` count and floating-promise count in your main project · dependencies added versus removed · trials run · standards revisions · one change for next month.

---

## 12. If You Only Have Thirty Days

Two hours a day, six days a week, with one real project as the substrate. This plan assumes you already write React and TypeScript daily — it targets the layer underneath, which is where the gap usually is.

| Week | Focus | Outcome |
|---|---|---|
| 1 | L# 1–3; D1 and D2 drills daily; output-order prediction sets | The semantics museum built; async toolkit written from scratch; ordering predictions above 80% |
| 2 | L# 5, 6; D3 drills; Build rung 7 | A real file or module migrated to strict with zero escape hatches; utility types implemented by hand; a schema validator built |
| 3 | L# 8; from-scratch mini-React; re-render trial | React's model demystified; effects audited and derived state removed; profiler-verified render counts |
| 4 | L# 4, 7, 12, 14; Build rungs 4, 8, 9 | A package published and verified in three consumers; a leak hunted from a heap snapshot; boundaries validated; dependency diet started |

Then the permanent loop: three drills, two prediction sets, one from-scratch build a fortnight, one dependency removed a month — against code you actually ship.
