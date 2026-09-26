# TypeScript & JavaScript → World-Class Engineer of the Language and Its Runtimes
## L1: Coding · A Complete Concept Map: Practical → Semantics → Engines → Taste

> This is the **language** file for JavaScript and TypeScript: semantics, the type system, the event loop, the engines that run it, the runtimes (browser, Node, Deno, Bun, edge), the module and packaging model, and the mechanics of the frameworks built on it — React and React Native in depth, the others as literacy. It stops where the *engineering* begins: the browser platform, rendering strategy, performance budgets, accessibility, and delivery live in `L18-cs-web-engineering.md`; client-app architecture and release practice in `L18-cs-app-engineering.md`; craft and design systems in `L18-cs-design-engineering.md`; general design and process in `L18-cs-software-engineering.md`. Build-strategy questions (chunking, budgets, CI) belong to web engineering Part 10; this file owns module *semantics*, the compiler, and package authoring. The training counterpart is `T1-coding-typescript-javascript.md`.
>
> **Currency stamp (September 2026):** TypeScript is the default authoring language for serious JavaScript work; a **native compiler port aimed at order-of-magnitude faster type checking** has been the headline project of recent releases — check which version you're on and whether the native toolchain is production-ready for your codebase. Recent ECMAScript additions worth knowing by name: `Object.groupBy`, `Promise.withResolvers`, `Array.fromAsync`, the RegExp `v` flag, **iterator helpers**, `Error.cause`, and **Temporal** (the replacement for `Date`) now shipping in engines at different rates. **Node** ships a built-in test runner, `fetch`, watch mode, and increasingly seamless TypeScript execution (type stripping) — much of the historical toolchain is now unnecessary. **Deno 2** and **Bun** are credible alternatives with different trade-offs. **React 19+** brought Actions, `use()`, form actions, and the **React Compiler**, which automates most memoisation; **React Native's New Architecture** (JSI, Fabric, TurboModules, bridgeless) is the default. **ESLint flat config** is the standard; **Biome** competes with the ESLint/Prettier pair. Verify all of this against release notes: no ecosystem in this series moves faster.

---

## How To Use This Document

**Depth ladder — apply to every bullet:** **L1** Name it · **L2** Use it correctly · **L3** Choose it over alternatives · **L4** Explain the mechanism (what the engine, compiler, or runtime does) · **L5** Rebuild a minimal version · **L6** Teach it and critique misuse.

**Tier tags:** **[Core]** every JS/TS developer · **[Deep]** senior/library-author depth · **[Frontier]** new or moving fast.

**Each Part closes with:** *Intuition anchors* · *Mastery checks* · *Build* · *Taste*.

**The JS/TS learning loop:**
1. **Separate the layers.** Almost every confusion here is a layer confusion: is this a *language* rule, a *type-system* rule, a *runtime* API, a *framework* behaviour, or a *bundler* transformation? Name the layer before debugging.
2. **Run it in the console, then in Node, then in the browser.** The same code behaves differently across runtimes and module systems; discovering that deliberately beats discovering it in production.
3. **Read the emitted JavaScript.** TypeScript is erased; frameworks compile. When behaviour surprises you, look at the output (`tsc --noEmit false`, the bundler's output, React Compiler's transform, Svelte's compiled component).
4. **Types are a compile-time argument, not a runtime guarantee.** Every boundary — network, storage, user input, third-party library — needs runtime validation regardless of how strict your types are.
5. **Prefer the platform to the dependency.** Much of what libraries used to provide (fetch, date handling, deep clone, grouping, test running) is now built in. Re-check before adding.
6. **Follow TC39 and the TypeScript release notes**, not framework news. The language compounds; frameworks rotate.

**Relationship to the other files:** `L18-cs-fundamentals.md` Parts 2, 10, and 11 explain the paradigms, interpreters, and type theory beneath this language; `L1-coding-rust.md` and `L1-coding-c.md` are the contrast partners for memory and performance; the L18 files consume this one.

---

## PART 0 — Orientation, Toolchain & Mental Models [Core]

- What JavaScript actually is: a specification (**ECMAScript**, maintained by TC39 through a staged proposal process) implemented by engines (V8, JavaScriptCore, SpiderMonkey), embedded in *host environments* that supply their own APIs (the browser's DOM, Node's `fs`, Deno's permissions, edge runtimes' subset). "JavaScript can't read files" is a host statement, not a language one
- What TypeScript is: a **structural type system and compiler that erases to JavaScript**, adding no runtime semantics of its own (with the historical exceptions of enums, namespaces, decorators, and parameter properties — all of which are reasons to avoid them). Its job is to catch mistakes at authoring time and document intent; it is not a runtime guard
- The layer map to keep in your head: ECMAScript semantics → runtime APIs → module system → compiler/transpiler → bundler → framework → your code. Debugging means locating the layer first
- Toolchain setup: a version manager (`mise`, `fnm`, `nvm`), a package manager chosen deliberately (**pnpm** for workspaces and disk efficiency, npm for ubiquity, Bun for speed), `tsconfig.json` written rather than copied, ESLint flat config with typed rules, a formatter, and a test runner — and the knowledge that Node, Deno, and Bun differ in what they require
- Reading the sources that matter: **MDN** for APIs, the **ECMAScript spec** for semantics you must be certain about (it is readable once you learn its notation), TC39 proposal repositories for the *why*, the TypeScript release notes and handbook, and the runtime documentation for the environment you target
- Ecosystem literacy without churn: the difference between a language feature (permanent), a runtime API (slow-moving), a framework API (years), and a tool (months); a personal policy for adopting each
- What this language is genuinely good at (ubiquity, iteration speed, a vast ecosystem, one language across client, server, and mobile) and what it is bad at (numeric performance without WASM, memory control, CPU-bound work, dependency hygiene)

**Intuition anchors**
- JavaScript is a small language with a very large environment. Most of what people call "JavaScript problems" are environment, tooling, or framework problems.
- TypeScript's types vanish at runtime. Every guarantee you think you have at a boundary is a guarantee you must re-establish with a validator.

**Mastery checks**
- Explain the difference between ECMAScript, a JavaScript engine, and a runtime, with an example API belonging to each.
- Explain what TypeScript does and does not change about the program that actually runs.
- Write a minimal `tsconfig.json` from scratch and justify every option.

**Build**
- The same small program (read input, transform, write output) run in Node, Deno, and Bun, and in the browser — with the differences in module loading, APIs, and permissions documented.

**Taste**
- Learn the language separately from the framework. Engineers who only know React struggle the moment the problem is one layer down, which is exactly where the hard bugs live.

---

## PART 1 — Core JavaScript Semantics [Core → Deep]

- **Types and values**: the seven primitives (`undefined`, `null`, `boolean`, `number`, `string`, `symbol`, `bigint`) plus objects; wrapper objects and autoboxing; `typeof` and its famous `null` quirk; `Object.prototype.toString` and `Symbol.toStringTag`
- **Coercion**, fully understood rather than feared: `ToPrimitive`, `valueOf`/`Symbol.toPrimitive`/`toString`, abstract equality (`==`) versus strict (`===`) versus `Object.is` and `SameValueZero`, truthiness and falsy values, `+` as the most overloaded operator, template literals, explicit conversion idioms
- **Numbers**: IEEE-754 doubles, `0.1 + 0.2`, `Number.EPSILON`, safe-integer range, `-0`, `NaN` (and why `NaN !== NaN`), integer operations and bitwise 32-bit coercion, **BigInt** and where it is required, `Number` parsing pitfalls, `Intl.NumberFormat` for output
- **Strings**: UTF-16 code units versus code points versus grapheme clusters, surrogate pairs, `length` lying about emoji, iteration by code point, `Intl.Segmenter` for user-perceived characters, normalisation (`NFC`/`NFD`), `localeCompare`, and template literal tags
- **Scope and bindings**: lexical scope, `var` hoisting versus `let`/`const` and the **temporal dead zone**, block scope, function declarations versus expressions, shadowing, closures (and the loop-variable classic), IIFEs as history, global object and `globalThis`, strict mode and module scope
- **Functions**: parameters, defaults, rest, `arguments` as legacy, first-class functions, higher-order functions, currying and partial application, recursion and stack limits, named function expressions, `length` and `name`
- **`this`**, the five binding rules: default, implicit (method call), explicit (`call`/`apply`/`bind`), `new`, and lexical (arrow functions); losing `this` in callbacks; class-field arrow functions as the pragmatic fix; `this` in modules and strict mode
- **Objects**: property definition and access, computed keys, shorthand, getters and setters, **property descriptors** (`writable`, `enumerable`, `configurable`), `Object.freeze`/`seal`/`preventExtensions` and their shallowness, own versus inherited, key ordering rules, `structuredClone` versus shallow spread, symbols as keys
- **Prototypes**: the prototype chain, `[[Prototype]]` versus `.prototype`, `Object.create`, constructor functions, `instanceof` and `Symbol.hasInstance`, prototype mutation as a performance and security hazard, and the fact that classes are prototypes with better syntax
- **Classes**: declarations, `constructor`, methods, `static`, **private fields** (`#x`) and their genuine encapsulation, public and static blocks, `super`, inheritance and `extends`, subclassing built-ins, accessors, and decorators **[Frontier]**
- Destructuring, spread and rest (objects and arrays, defaults, renaming, nested patterns), optional chaining (`?.`), nullish coalescing (`??` and `??=`), logical assignment operators, `at()`, and exponent/comma/void/`in` operators
- **Iteration protocols**: `Symbol.iterator`, iterables versus iterators, `for...of` versus `for...in`, spread on iterables, **generators** (`yield`, two-way communication, delegation with `yield*`, generators as state machines and coroutines), and iterator helpers (`map`/`filter`/`take` on iterators)
- **Errors**: the `Error` hierarchy, custom error classes, `cause`, `AggregateError`, stack traces and their non-standard nature, `try`/`catch`/`finally` semantics (including `finally` overriding returns), throwing non-Errors as an anti-pattern, and error handling across async boundaries (Part 3)
- `Symbol`s and well-known symbols (`iterator`, `asyncIterator`, `hasInstance`, `toPrimitive`, `toStringTag`), and `Proxy`/`Reflect` for meta-programming — with the warning that proxies break engine optimisation and confuse debugging

**Intuition anchors**
- Everything that isn't a primitive is an object, and every object has a prototype chain that ends at `null`. Those two facts explain most of the language's behaviour.
- `this` is decided at *call* time by how the function was called, except for arrow functions, which have no `this` of their own. Almost every `this` bug is a lost call site.

**Mastery checks**
- Explain `[] + {}` versus `{} + []` and what the coercion algorithm does in each case.
- Write a closure bug with `var` in a loop and fix it three ways.
- Explain the difference between `Object.freeze` and true immutability, with an example that breaks.
- Implement `bind` yourself, including `new` behaviour.
- Explain why `"👨‍👩‍👧".length` is not 1 and produce the correct count.

**Build**
- A "semantics museum": 30 numbered snippets covering coercion, `this`, closures, prototypes, property descriptors, and iteration — each with your predicted output, the actual output, and the spec rule that explains it.

**Taste**
- Use the small, predictable subset: `const` by default, `===` always, pure functions where possible, no prototype mutation, no `with`, no implicit coercion you can't defend. The language is at its best when you deliberately use less of it.

---

## PART 2 — The Standard Library [Core]

- `Object`: `keys`/`values`/`entries`/`fromEntries`, `assign`, `create`, `defineProperty`, `getOwnPropertyDescriptors`, `hasOwn` (over `hasOwnProperty.call`), `groupBy`, spread semantics and their shallowness
- `Array`: creation (`of`, `from`, `fromAsync`), the mutating versus non-mutating pairs (`sort`/`toSorted`, `reverse`/`toReversed`, `splice`/`toSpliced`, `with`), iteration methods (`map`, `filter`, `reduce`, `flatMap`, `find`, `findLast`, `some`, `every`), `at`, `includes` versus `indexOf` and `NaN`, sparse arrays and holes, sorting correctly (comparator required for numbers; stability guaranteed), `flat`, and the performance characteristics behind each
- Keyed collections: `Map` and `Set` (insertion order, any key type, size, iteration), `WeakMap`/`WeakSet`/`WeakRef`/`FinalizationRegistry` for memory-sensitive associations, and choosing between a plain object and a `Map`
- `String`: search and slice methods, `replaceAll`, `padStart`/`padEnd`, `trimStart`/`trimEnd`, `normalize`, `raw`, and the Unicode considerations from Part 1
- `Number`, `Math`, `BigInt`: parsing, formatting, rounding traps (`toFixed` rounding behaviour), random numbers (`Math.random` is not cryptographic — use `crypto.getRandomValues`)
- **Dates and time**: `Date`'s well-known flaws (mutability, month indexing, parsing inconsistency, no time-zone support), the correct patterns with it, `Intl.DateTimeFormat`, and **Temporal** as the replacement (plain versus zoned types, durations, arithmetic, time-zone-safe reasoning) — adopt where supported, polyfill where not
- **RegExp**: syntax, flags (`g`, `i`, `m`, `s`, `u`, `v`, `y`, `d`), named capture groups, lookahead and lookbehind, Unicode property escapes, the `v` flag's set operations, `matchAll`, `replace` with a function, `lastIndex` statefulness as a bug source, and **catastrophic backtracking/ReDoS** with the linear-time alternatives
- `JSON`: `parse`/`stringify`, `reviver` and `replacer`, `toJSON`, what is silently dropped (`undefined`, functions, symbols), cycles, precision loss on large integers, and the boundary with `L18-cs-data-engineering.md` Part 5 for JSON as a format
- Binary data: `ArrayBuffer`, typed arrays, `DataView`, endianness, `SharedArrayBuffer` and `Atomics` (with cross-origin isolation), `Blob`/`File`, base64 helpers, and streams
- `Intl` in depth: `NumberFormat` (currency, units, compact notation), `DateTimeFormat`, `RelativeTimeFormat`, `ListFormat`, `PluralRules`, `Collator`, `Segmenter`, `DisplayNames` — the correct answer to almost every formatting question
- `structuredClone` for deep copies, `Proxy`/`Reflect` for interception, `globalThis`, and the timers and scheduling APIs (Part 3)

**Intuition anchors**
- The standard library got quietly excellent. Most utility-library imports in a modern codebase are now replaceable by built-ins with better performance and zero bytes.
- `Date` is the one built-in that is genuinely broken. Treat every date bug as a design smell until you move to `Temporal` or a well-chosen library.

**Mastery checks**
- Explain why `[10, 9, 1].sort()` produces `[1, 10, 9]` and fix it.
- Explain three things `JSON.stringify` silently drops and the consequences for an API payload.
- Write a ReDoS-vulnerable regex, demonstrate the blow-up, and rewrite it safely.
- Format a price, a relative time, and a plural noun for two locales using only `Intl`.

**Build**
- A "no-dependencies" utility module replacing common library functions (grouping, deep clone, debounce, chunk, formatting, date arithmetic) with built-ins, plus benchmarks and a written note on what a library still does better.

**Taste**
- Reach for `Intl` and the newer array and object methods before a dependency. Every utility package you delete is bytes, a supply-chain risk, and an upgrade obligation removed.

---

## PART 3 — Asynchrony & Concurrency [Core → Deep]

- **The event loop**, precisely: the call stack, the task (macrotask) queue, the **microtask** queue, and — in browsers — the rendering opportunity between them; `queueMicrotask`, promise jobs, `setTimeout` clamping and the 4 ms minimum, `requestAnimationFrame` and `requestIdleCallback`; **Node's phases** (timers, pending callbacks, poll, check, close) plus `process.nextTick`'s priority over promises; why starving the microtask queue blocks rendering entirely
- **Promises**: states and settlement, `then`/`catch`/`finally` semantics, chaining and value propagation, thenables and assimilation, `Promise.resolve/reject`, the constructor anti-pattern (wrapping something already promise-returning), `Promise.withResolvers`, and unhandled rejection behaviour in each runtime
- Combinators and when each is right: `all` (fail fast), `allSettled` (collect outcomes), `race` (first settle, including rejections), `any` (first success)
- **async/await**: syntactic sugar over promises and its exact desugaring, `await` in loops versus parallel starts (the most common performance bug in this language), top-level `await` in modules, error handling with `try`/`catch`, `finally` for cleanup, and async functions always returning promises
- **Cancellation**: `AbortController`/`AbortSignal`, `signal.throwIfAborted`, `AbortSignal.timeout` and `any`, passing signals through your own async APIs as a convention, and the fact that promises themselves are not cancellable
- **Async iteration**: `Symbol.asyncIterator`, `for await...of`, async generators, streaming consumption, back-pressure realities, and converting event emitters and callbacks into async iterables
- Concurrency patterns you should be able to write from memory: a concurrency limiter (pool of N), retry with exponential backoff and jitter, timeout wrapper, debounce and throttle, memoised in-flight requests (single-flight), sequential versus parallel orchestration, and a simple task queue
- Common async bugs: floating promises (no `await`, no `catch`), `forEach` with an async callback, sequential awaits that should be parallel, race conditions between fast-changing state and slow responses (respond only to the latest request), unhandled rejections crashing Node, `await` inside a lock or transaction held too long, and leaked timers and listeners
- **Workers and real parallelism**: Web Workers and `worker_threads`, structured clone versus transferables versus `SharedArrayBuffer`, message-passing design, when offloading helps (parsing, crypto, image work) and when the transfer cost dominates; `Atomics` for coordination **[Deep]**
- The mental model to carry: JavaScript is **single-threaded with an event loop and non-blocking I/O**; concurrency is interleaving, not parallelism, unless you explicitly use workers

**Intuition anchors**
- `await` is a `return` from your function plus a scheduled resumption. Everything else in the program runs in between — which is why state can change across every `await`.
- Microtasks run to exhaustion before the next task or render. An infinite microtask chain freezes the page more completely than a long loop does.

**Mastery checks**
- Predict the exact output order of a snippet mixing `setTimeout`, promises, `queueMicrotask`, and synchronous logs — and explain each position.
- Rewrite a loop of sequential `await`s to run with a concurrency limit of 5, preserving result order.
- Explain what happens to the HTTP request when you abort a `fetch` mid-flight, and how to propagate that through three layers of your own functions.
- Explain why `array.forEach(async ...)` does not wait, and the three correct alternatives.

**Build**
- An async toolkit written from scratch: a promise pool with concurrency control, retry with backoff and jitter, a timeout wrapper, single-flight deduplication, a cancellable fetch wrapper threading `AbortSignal`, and an async queue — with tests that use fake timers and prove cancellation actually cancels.

**Taste**
- Start work in parallel and await together; thread an `AbortSignal` through everything that can be abandoned; and never write an async function that can reject without a caller who is prepared to handle it.

---

## PART 4 — Modules, Packages & Resolution [Core → Deep]

- **ESM versus CommonJS**: static structure and live bindings versus dynamic `require` and value copies, hoisted imports, circular-dependency behaviour in each, `import()` for dynamic loading, top-level `await` (ESM only), `import.meta`, and the interop hazards (default-export shape, named exports from CJS, dual-package hazard)
- Module resolution: Node's algorithm (`node_modules` walk, extensions, directories), `package.json` fields — `type`, `main`, `module` (historical), **`exports`** with conditions (`import`, `require`, `types`, `node`, `browser`, `default`) and subpath patterns, `imports` for internal aliases (`#internal/...`), `files`, `sideEffects`; browser resolution via bundlers and **import maps**; Deno's URL-based imports and Bun's resolution
- Authoring packages properly: choosing ESM-only versus dual publishing, correct `exports` (the single most commonly broken thing in published packages), shipping types (`.d.ts` co-located and declared in `exports.types` first), avoiding bundling dependencies, `peerDependencies` semantics, `engines`, publishing with provenance, and testing the published artefact rather than the source
- Versioning and dependency management: semantic versioning honestly applied, ranges and lockfiles, `npm`/`pnpm`/`yarn` differences (hoisting, strictness, disk, workspace support), `overrides`/`resolutions`, audit noise, renovation cadence, and the supply-chain reality of a deep dependency graph (Part 14)
- Monorepos: workspaces, internal packages consumed as source versus built artefacts, TypeScript **project references**, task orchestration and caching, and dependency-boundary enforcement
- Tree shaking from the author's side: ESM, pure annotations, `sideEffects: false`, avoiding top-level side effects and barrel files that defeat elimination, and the difference between what a bundler *can* remove and what it *will*
- Polyfills, transpilation targets, and browserslist: what your `target`/`lib` and bundler target actually produce, the cost of downlevelling, and shipping modern syntax to modern engines

**Intuition anchors**
- A package's `exports` map is its public API surface, and getting it wrong breaks consumers in ways the author never sees because it works in their repo.
- ESM is static so tools can analyse it; that static-ness is exactly what makes tree shaking, top-level await, and live bindings possible.

**Mastery checks**
- Explain the dual-package hazard and how `exports` conditions prevent it.
- Explain what a barrel file does to tree shaking and bundle size.
- Explain circular imports in ESM versus CJS with an example that behaves differently.

**Build**
- Publish a small package properly: ESM with correct `exports` and types, a CJS build only if justified, `sideEffects` set, tested by installing the packed tarball into three consumers (Node ESM, a bundler, and a TypeScript project) and verifying types, tree shaking, and runtime behaviour.

**Taste**
- Treat your package's `exports`, types, and version range as part of the API. A library that is a joy to install is one where the author tested the install, not just the source.

---

## PART 5 — TypeScript: The Working Type System [Core]

- The model: **structural typing** (compatibility by shape, not by name), gradual typing with `any` as the escape hatch, erasure at compile time, and inference doing most of the work when you let it
- Annotations and inference: when to annotate (function parameters, exported API boundaries, empty containers) and when not to (obvious locals, return types in small functions — though explicit return types on public APIs prevent accidental widening); contextual typing; `const` assertions and literal widening
- The type vocabulary: primitives, literal types, unions, intersections, `unknown` versus `any` versus `never`, `void`, tuples (including named and variadic), arrays versus readonly arrays, object types, index signatures, optional and readonly properties, `Record`
- **Narrowing and control-flow analysis**: `typeof`, `instanceof`, `in`, truthiness, equality narrowing, discriminated unions and the discriminant property, user-defined **type guards** (`x is T`), assertion functions (`asserts x is T`), exhaustiveness checking with `never`, and the narrowing that is lost across closures and `await`
- Functions: parameter and return typing, optional and default parameters, rest tuples, overloads (and why a union parameter is usually better), `this` parameters, function type expressions versus call signatures, and typing higher-order functions
- **Generics**: type parameters, constraints (`extends`), defaults, inference from arguments, generic constraints on object shapes, `const` type parameters for literal inference, and the rule that a type parameter used once is usually not a type parameter
- Interfaces versus type aliases: declaration merging, extends versus intersection, performance in large codebases, and a consistent house rule
- Classes in TypeScript: access modifiers versus `#private`, parameter properties, abstract classes, implementing interfaces, and `override`
- **Enums and their alternatives**: numeric enum pitfalls, string enums, `const` enums and their build hazards, and the union-of-literals + `const` object pattern that is usually better
- Modules and declarations: `.d.ts` files, `declare module`, ambient declarations, triple-slash directives as legacy, typing untyped dependencies, and `DefinitelyTyped`
- **`tsconfig.json`** as a design document: `strict` and its component flags (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables`, `noImplicitThis`, `alwaysStrict`), `noUncheckedIndexedAccess` (the most valuable non-default flag), `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `isolatedModules`, `target`/`lib`/`module`/`moduleResolution`, `paths`, and project references
- The escape hatches and their costs: `any`, `as` assertions, non-null `!`, `@ts-ignore` versus `@ts-expect-error`, and the discipline of making each one loud, local, and commented — plus **`satisfies`** as the tool that often removes the need for an assertion

**Intuition anchors**
- TypeScript is a static argument about your program that disappears before it runs. Its value is entirely in what it prevents you from writing.
- Model the domain with unions and narrowing rather than optional fields and runtime checks: "loading | error | loaded" beats three booleans and a nullable payload.

**Mastery checks**
- Explain structural typing with a case where nominal typing would have caught a bug, and show the branded-type fix.
- Explain `unknown` versus `any` and rewrite an `any`-heavy function using `unknown` plus narrowing.
- Explain what `noUncheckedIndexedAccess` changes and why most codebases should enable it.
- Write a discriminated union for a network request and an exhaustive `switch` that fails to compile when a case is added.

**Build**
- Convert a real JavaScript module to strict TypeScript with zero `any` and zero assertions, documenting each place the types forced a design change — then enable `noUncheckedIndexedAccess` and fix the fallout.

**Taste**
- Make the types describe reality, not convenience. Every `as` is a place where you told the compiler to stop helping; they should be rare enough to review individually.

---

## PART 6 — TypeScript: The Advanced Type System [Deep]

- `keyof`, `typeof`, indexed access types (`T[K]`), and the trio that powers most generic utilities
- **Mapped types**: `{ [K in keyof T]: … }`, key remapping with `as`, modifiers (`readonly`, `?`, and their `+`/`-` forms), and building `Partial`, `Required`, `Readonly`, `Pick`, `Omit` yourself to understand them
- **Conditional types**: `T extends U ? X : Y`, `infer` for extracting types, distributive behaviour over unions (and how to switch it off with `[T]`), nested conditionals, and the standard library's `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`
- **Template literal types**: string manipulation at the type level, combined with mapped types for event names, route params, and CSS-property typing; `Uppercase`/`Lowercase`/`Capitalize`
- **Variance**: covariance, contravariance, bivariance in method parameters (an intentional unsoundness), `strictFunctionTypes`, explicit `in`/`out` annotations on type parameters, and where variance bugs actually bite (callbacks, arrays, promises)
- Recursive types and their limits: JSON types, deep readonly, deep partial, path types, tail-recursion elimination in conditional types, and the depth limits that produce "type instantiation is excessively deep"
- **Branded/nominal types**: `type UserId = string & { readonly __brand: unique symbol }`, smart constructors, and using them to stop the class of bug where every identifier is a `string`
- Declaration merging and module augmentation: extending third-party types, augmenting global interfaces (`Window`, `ProcessEnv`), and the maintenance cost
- Type-level programming, with a warning: it is Turing-complete-ish and seductive; the costs are compile time, unreadable errors, and code that only you can maintain. Prefer simple types plus runtime validation over a type-level proof
- Type-checker performance **[Deep]**: what makes checking slow (large unions, deep conditionals, huge inferred object types, barrel files, `any` cascades), diagnosing with `--extendedDiagnostics`, `--generateTrace`, and project references; incremental builds; and why a native compiler port matters for large codebases
- Reading and writing declaration files: generating them, hand-writing for JS libraries, `export =` versus default interop, and testing types themselves (`expectTypeOf`, `tsd`, `@ts-expect-error` assertions)
- **Runtime validation as the counterpart to types**: schema libraries (Zod, Valibot, ArkType, TypeBox) with type inference from schemas, **parse-don't-validate** at every boundary (network responses, form input, environment variables, storage, third-party callbacks), and generating types from an API contract (OpenAPI, GraphQL codegen) so the types are derived rather than asserted

**Intuition anchors**
- Advanced types are for library boundaries and domain invariants, not for everyday application code. If the type is harder to read than the function, you have overpaid.
- Types stop at the network boundary. Validate there, and let the validator's inferred type be the source of truth downstream.

**Mastery checks**
- Implement `Pick`, `Omit`, `ReturnType`, and `DeepReadonly` from scratch.
- Explain distributive conditional types with an example where the distribution surprised you.
- Explain why arrays are covariant in TypeScript despite being unsound, and construct the failing case.
- Type a function that takes an event name like `"user:created"` and returns a correctly typed payload.

**Build**
- A typed API client with no hand-written response types: schemas define runtime validation and infer the static types, endpoints are described once, template-literal types give typed route parameters, and type tests prove the inference — plus a benchmark of the type-check time before and after.

**Taste**
- Use the type system to make illegal states unrepresentable, then stop. Clever types are a tax on every future reader, including you in six months.

---

## PART 7 — Engines & Performance [Deep]

- The pipeline inside a modern engine: source → parser (with lazy parsing of function bodies) → bytecode interpreter → optimising compiler tiers → deoptimisation back to bytecode; why start-up cost, code size, and hot-loop performance are three different problems
- **Hidden classes (shapes/maps) and inline caches**: objects with the same property order share a shape; adding properties later, deleting properties, and mixing types at a call site force transitions or megamorphic caches; the practical rules — initialise all fields in the constructor, keep object shapes stable, avoid `delete`, prefer `Map` for dictionaries with dynamic keys
- Array element kinds (packed small integers → doubles → objects → holey) and why holes and mixed types make arrays slower; preallocation; typed arrays for numeric work
- Deoptimisation triggers: changing types at a call site, `arguments` leaking, `try`/`catch` in hot code (historically), `eval` and `with`, and using a proxy in a hot path
- **Garbage collection**: generational collection (young/old), scavenging, incremental and concurrent marking, and what causes visible pauses; allocation pressure in hot loops; object pooling as a last resort
- **Memory leaks in JavaScript**: detached DOM nodes, forgotten listeners and timers, closures capturing large scopes, unbounded caches and maps, global accumulation; diagnosing with heap snapshots, allocation timelines, and comparing snapshots across a repeated action
- Measuring honestly: `performance.now`, `performance.mark`/`measure`, Chrome DevTools performance and memory panels, `node --cpu-prof` and `--heap-prof`, `0x`/flame graphs, `hyperfine` for CLI, benchmark harnesses (and their traps — dead-code elimination, insufficient warm-up, engine-specific tuning)
- Practical performance work, in order of payoff: do less work (algorithms and data shapes), do it later (lazy, defer), do it once (memoise, cache), avoid main-thread blocking (chunk, yield, worker), reduce allocations in hot paths, and only then micro-optimise
- String and JSON performance: concatenation and ropes, `JSON.parse` cost on large payloads, streaming parsers, and moving parsing off the main thread
- **WebAssembly** as the escape hatch: when it wins (CPU-bound numeric work, existing C/C++/Rust code, deterministic performance), the JS↔WASM boundary cost, memory model, and toolchains (`L1-coding-rust.md` Part 7, `L1-coding-c.md` Part 14)
- Node-specific performance: event-loop lag monitoring, blocking the loop with synchronous I/O or CPU work, `worker_threads` for CPU-bound tasks, stream back-pressure, and cluster versus process managers

**Intuition anchors**
- The engine is optimising for code that is *predictable*: stable shapes, stable types, monomorphic call sites. Dynamic tricks that feel clever are exactly what push you off the fast path.
- In application JavaScript, the wins are almost never in the arithmetic. They are in how much work you scheduled, how much you allocated, and how much you shipped.

**Mastery checks**
- Explain hidden classes with two objects that look identical but are shaped differently, and the performance consequence.
- Find a memory leak in a running app using heap snapshots and name the retaining path.
- Explain why `try/catch` around a hot loop used to matter and why measurement, not folklore, should decide today.

**Build**
- A performance study on a real hot path: baseline measurement, a hypothesis about shapes/allocation/blocking, three optimisations measured individually, a heap-snapshot leak hunt, and a WASM comparison for one numeric kernel — written up with numbers.

**Taste**
- Profile first, in the runtime that matters, with realistic data. JavaScript performance advice ages badly; measurements don't.

---

## PART 8 — React Mechanics [Core → Deep]

*Architecture, rendering strategy, and state-layer decisions are `L18-cs-web-engineering.md` Part 3; this Part is how React actually works.*

- The model: `UI = f(state)`; elements are descriptions, components are functions returning descriptions, and React reconciles descriptions into host instances; declarative rendering as the core idea you can reimplement in an afternoon
- **Reconciliation**: the element tree diff, component identity by type and position, **keys** (why index keys break, what a stable key guarantees), bailouts, and why state resets when identity changes
- The render/commit split: render phase (pure, interruptible, may be discarded or replayed — hence StrictMode's double invocation in development), commit phase (DOM mutation, refs, layout effects), and passive effects afterwards
- **Hooks semantics**: the rules and the reason behind them (call order as identity); `useState` (updater functions, batching, lazy initialisation), `useReducer` for complex transitions, `useEffect` (dependencies as a synchronisation contract, cleanup, why it runs after paint), `useLayoutEffect` (before paint, for measurement), `useRef` (mutable box, not reactive), `useMemo`/`useCallback` (caches with a cost — and largely unnecessary once the compiler memoises), `useContext`, `useId`, `useSyncExternalStore` (the correct way to subscribe to external stores), `useImperativeHandle`
- **Effects, used correctly**: effects are for synchronising with external systems, not for deriving state or reacting to props; the standard mistakes — derived state stored in state, effect chains that cascade renders, missing cleanup causing leaks and race conditions, and stale closures capturing old values
- Context: what it is good at (dependency injection, rarely changing values), what it is bad at (high-frequency state — every consumer re-renders), splitting contexts, and the selector patterns or external stores that fix it
- **Concurrent rendering**: `startTransition`/`useTransition` for non-urgent updates, `useDeferredValue`, Suspense for loading states and streaming, error boundaries, and the mental model of interruptible rendering
- Data and the server: **Server Components** (components that run only on the server and never ship), the client/server boundary and `"use client"`, server actions and `"use server"`, `use()` for reading promises and context, form actions with `useActionState`/`useFormStatus`, and the hydration rules that govern all of it
- **The React Compiler** **[Frontier]**: automatic memoisation based on the rules of React, what it assumes (purity, no mutation of props/state), what it cannot fix, and the consequence — hand-written `useMemo`/`useCallback` becomes mostly obsolete in compiled codebases
- Performance work in React: the profiler, finding unnecessary renders, stable props and identities, list virtualisation, `memo` and when it does nothing, moving state down, lifting content up as `children`, and avoiding expensive work in render
- State libraries and what they actually differ on: Redux Toolkit (explicit, devtools, boilerplate), Zustand (small store, subscribe with selectors), Jotai/Recoil (atoms), XState (state machines for complex flows), and TanStack Query for server-cache state (which removes most of the need for a global store — see `L18-cs-web-engineering.md` Part 4)
- Testing React: Testing Library's philosophy (query by role and text, assert behaviour), act warnings and what they mean, fake timers, testing hooks, and mocking at the network boundary rather than the module boundary

**Intuition anchors**
- React does not re-render because a value changed; it re-renders because a state update told it to, and then it re-executes the component to produce a new description. Everything else is diffing.
- Most React bugs are one of three things: wrong identity (keys), wrong dependency (effects), or state stored where it shouldn't be (derived or server state).

**Mastery checks**
- Explain what happens, step by step, from `setState` to the DOM changing.
- Explain why StrictMode double-invokes and what class of bug it is designed to surface.
- Take an effect that fetches on a prop change and identify its race condition; fix it with cancellation.
- Explain why a context holding fast-changing state causes performance problems, and three fixes.
- Explain what the React Compiler does and what it requires from your code.

**Build**
- A mini-React: elements, a reconciler with keys, function components, `useState` and `useEffect` with a hook queue, and a commit phase — in about 500 lines. Nothing else in this file teaches React as quickly.

**Taste**
- Write components that are boring: state as low as possible, effects only for external synchronisation, derived values computed during render, and identity stable by construction. Almost all React "performance work" is a symptom of violating one of those.

---

## PART 9 — React Native Mechanics [Deep]

*App architecture, lifecycle, offline, and release practice are `L18-cs-app-engineering.md`; this Part is how React Native works as a runtime.*

- The premise: React's programming model driving **real native views**, not a web view — one language and one component model across iOS and Android, with an escape hatch to native code
- **The New Architecture** (now the default): **JSI** (a lightweight C++ interface letting JavaScript hold references to native objects and call them synchronously, replacing the asynchronous JSON bridge), **Fabric** (the new renderer with a C++ shadow tree, synchronous layout, and concurrent-React support), **TurboModules** (lazily loaded native modules with typed interfaces), **Codegen** (type-safe bindings generated from TypeScript specs), and bridgeless mode; what changed in practice — fewer serialisation costs, synchronous measurement, and real concurrent features
- The engine and threads: **Hermes** (ahead-of-time bytecode, fast start-up, smaller memory) as the default engine; the JavaScript thread, the native/UI thread, and the background thread pool; what blocks which; why a long JS task freezes gestures even though the UI thread is free
- Layout and styling: **Yoga** (a flexbox implementation in C++), the subset of flexbox and style properties available, density-independent units, platform-specific styles, `StyleSheet` semantics, and the differences from web CSS that repeatedly surprise web developers
- Core components and the host-view mapping: `View`, `Text` (and its nesting rules), `Image` (caching, resizing, memory), `ScrollView` versus `FlatList`/`SectionList` versus newer list implementations, `Pressable` and touch handling, `TextInput` (the perennial source of platform differences), `Modal`, and safe-area handling
- **Gestures and animation**: the `Animated` API and `useNativeDriver`, **Reanimated** worklets running on the UI thread (and the rules that come with them), Gesture Handler replacing the touch system, shared-element transitions, and why animation that depends on the JS thread stutters under load
- Navigation: React Navigation (JS-driven) versus native-stack implementations, deep linking, screen lifecycle, state persistence, and the interaction with the platform back behaviour
- Native interop: writing a TurboModule or Fabric component, Codegen specs, the JSI boundary, third-party native dependencies and their build implications, autolinking, and the moment you must open Xcode or Android Studio
- **Expo** as the default path: the managed workflow, config plugins, prebuild, EAS build and update (over-the-air updates and their store-policy limits), the dev client, and the trade-off between convenience and full native control
- Performance in React Native: start-up time and bundle size, Hermes bytecode, list virtualisation and `getItemLayout`, image memory, avoiding re-renders that cross the JSI boundary, the `InteractionManager`, and profiling (Flipper's successors, Hermes profiler, Systrace, Xcode Instruments)
- Platform differences you will actually hit: text rendering and line height, shadows versus elevation, keyboard behaviour, safe areas, status-bar handling, permissions, and back-gesture semantics
- The honest comparison (decision framework in `L18-cs-app-engineering.md` Part 10): React Native buys one team, shared logic, and fast iteration; it costs platform fidelity at the edges, an extra layer to debug, and dependence on the library ecosystem for native features

**Intuition anchors**
- With the New Architecture, JavaScript can call native code synchronously — but your JavaScript still runs on one thread, so a long task blocks everything the JS thread owns, including some gestures and list rendering.
- React Native is React's model over native primitives; it is not the web. Every time you reason with CSS or DOM instincts, check the Yoga and platform semantics instead.

**Mastery checks**
- Explain what JSI changed relative to the old bridge, and the class of performance problem it removed.
- Explain why an animation driven by JavaScript state stutters and how Reanimated worklets avoid it.
- Explain what Codegen produces and why TurboModules need it.

**Build**
- A small app exercising the layer: a virtualised list with images, a gesture-driven sheet in Reanimated, one custom TurboModule exposing a platform API, deep linking, and a start-up and list-scroll profile captured on a mid-range Android device.

**Taste**
- Keep JavaScript off the critical interaction path: animation and gestures on the UI thread, heavy work batched or deferred, lists virtualised properly. React Native feels native exactly when the JS thread is not in the way.

---

## PART 10 — Framework Literacy Beyond React [Deep]

- Why look outside your framework: the reactivity debate has produced genuinely different designs, and understanding them makes you better at the one you use — and able to judge when to switch
- **Virtual DOM versus compiled versus signals**: React's re-render-and-diff, Svelte's compile-time reactivity (runes), Solid's fine-grained **signals** that update the DOM directly with no component re-execution, Vue's proxy-based reactivity plus a compiler, Angular's move to signals, and Qwik's **resumability** (serialising state so the client never re-executes what the server already ran)
- What transfers regardless of framework: component composition, unidirectional data flow, derived state, keyed lists, effects as synchronisation, and the state taxonomy from `L18-cs-web-engineering.md` Part 3
- **Meta-frameworks** and their opinions: Next.js (Server Components, routing, caching layers), Remix/React Router (web-standards-first, forms and loaders), SvelteKit, Nuxt, SolidStart, Astro (island architecture, content-first, framework-agnostic islands), TanStack Start — compare on routing, data loading, caching model, and deployment target rather than on syntax
- Reading a framework's source once: Preact or Solid is small enough to read end to end, and doing so demystifies reactivity permanently
- Migration and interop realities: incremental adoption, web components as a neutral boundary, and the cost of a framework rewrite versus the cost of staying
- Judgement: choose by team, ecosystem, hiring, longevity, and the product's rendering needs; treat benchmark claims with the same skepticism as any vendor's

**Intuition anchors**
- Every framework is answering one question: when state changes, how little work can we do to update the screen? React re-runs components and diffs; signals update exactly the bindings that read the value; compilers move the bookkeeping to build time.

**Mastery checks**
- Explain signals versus React's render model, and one thing each makes easy that the other makes hard.
- Explain resumability versus hydration in terms of what the client has to execute.

**Build**
- Implement the same small application in React and in a signals-based framework, and write the comparison: lines of code, bundle size, update granularity, and where each model made you think differently.

**Taste**
- Learn the model, not the API. The APIs will be replaced; the reactivity models are now stable ideas that will outlast several framework generations.

---

## PART 11 — Runtimes: Node, Deno, Bun & the Edge [Core → Deep]

- **Node.js**: the event loop and libuv thread pool, `process` (argv, env, exit codes, signals, `nextTick`), `EventEmitter`, **streams** (readable, writable, duplex, transform; back-pressure and why `pipeline` beats manual piping), `Buffer` and its relationship to typed arrays, `fs` (sync versus promises versus callbacks; the cost of sync in a server), `path` and `url`, `http`/`https` servers and clients, `crypto`, `worker_threads`, `child_process`, `cluster`, `perf_hooks`, `AsyncLocalStorage` for request context, and the built-in **test runner**, `fetch`, watch mode, and TypeScript execution that removed several dependencies from the typical stack
- Node operational realities: unhandled rejections and uncaught exceptions (and the correct crash-and-restart posture), graceful shutdown and connection draining, memory limits and `--max-old-space-size`, event-loop lag as the key health metric, blocking the loop as the most common production incident, and native addons (N-API) when JavaScript isn't enough
- **Deno**: secure by default with explicit permissions, TypeScript without configuration, URL and npm-compatible imports, a batteries-included toolchain (fmt, lint, test, bundle, compile), web-standard APIs as the default surface, and where the ecosystem still lags
- **Bun**: a JavaScriptCore-based runtime plus package manager, bundler, and test runner in one binary, Node API compatibility as a goal, notable start-up and install speed, and the maturity questions to ask before production
- **Edge runtimes**: V8 isolates rather than containers, no filesystem, limited CPU time and memory, web-standard APIs only, cold-start characteristics, geographic distribution, and the design consequence — stateless handlers, streaming responses, and external state for everything
- Choosing a runtime: Node for ecosystem and operational familiarity, Deno for security and standards purity, Bun for speed-sensitive tooling, edge for latency-critical stateless work — and the portability discipline of writing to web standards (`fetch`, `Request`/`Response`, `URL`, streams) so the choice stays reversible
- Cross-runtime libraries: how to author code that runs in all of them (avoid Node built-ins where possible, use conditional exports, test in a matrix)

**Intuition anchors**
- Node's single thread is fine for I/O and fatal for CPU work. The question to ask about any server-side JavaScript feature is "does this ever block the loop?"
- Web-standard APIs are the portability layer: code written against `fetch` and `Request` runs almost anywhere; code written against `fs` runs in exactly one place.

**Mastery checks**
- Explain back-pressure in Node streams and what goes wrong without it.
- Explain what happens to an in-flight request when a Node process receives `SIGTERM`, and how to shut down gracefully.
- Explain why a synchronous 200 ms CPU task in a request handler is worse than a 2 s database query.

**Build**
- The same HTTP service implemented three ways — Node with streams, Deno with web standards, and an edge-compatible handler — sharing a core written against web APIs, with a load test showing event-loop lag under CPU-bound work and the `worker_threads` fix.

**Taste**
- Write the core of your server logic against web standards and keep runtime-specific code at the edges. It makes testing simpler and keeps every deployment target open.

---

## PART 12 — Tooling, Testing & Quality [Core]

- The compiler and the transpilers: `tsc` for type checking (and the native port's promise for large codebases), esbuild/SWC/Babel for fast transformation, and the standard arrangement — a fast transpiler in the build, `tsc --noEmit` as a separate gate, with `isolatedModules` keeping the two compatible
- Linting and formatting: **ESLint flat config**, type-aware rules (and their cost), the rules that actually prevent bugs (`no-floating-promises`, `no-misused-promises`, exhaustive `switch`, import boundaries, React hooks rules), Prettier versus Biome, and enforcing in CI rather than in review comments
- **Testing**: Vitest and Jest for unit and component tests, Node's built-in runner for zero-dependency projects, Testing Library for components (`L18-cs-web-engineering.md` Part 11 for the strategy), MSW for network faking, fake timers for async and debounce logic, property-based testing (fast-check) for pure logic, snapshot testing used sparingly, and type-level tests for library APIs
- Debugging: the DevTools debugger and `node --inspect`, conditional and logpoint breakpoints, source maps (and shipping them privately for error monitoring), `debugger` statements, React DevTools (profiler, component inspection), and reading a minified stack trace back to source
- Package management: pnpm's strict linking versus npm's hoisting, lockfile discipline, workspaces, `overrides`, audit triage, provenance and integrity, and dependency review before adoption (size, maintenance, transitive graph, licence, types)
- Release engineering for libraries: changesets, semantic versioning discipline, changelogs, canary releases, publishing with provenance, and testing the packed artefact (Part 4)
- CI shape for JavaScript projects: install with a frozen lockfile, type-check, lint, unit and component tests, build, and the heavier browser or integration suites — parallelised, cached, and kept under the team's patience threshold
- Editor and DX: TypeScript language-server performance, path aliases that work in every tool (a recurring source of pain), auto-imports, and keeping `tsconfig` in sync with the bundler's resolution
- AI-assisted work in this ecosystem specifically: generated code tends to hallucinate APIs and outdated patterns in a fast-moving stack, so type-check, lint, and test gates matter more than elsewhere (`L18-cs-software-engineering.md` Part 14)

**Intuition anchors**
- Type checking, linting, and tests are three different guarantees, and none substitutes for another: types prevent shape errors, lints prevent known foot-guns, tests prevent behaviour regressions.
- A slow inner loop (type-check, test run, dev-server start) taxes every hour of work. Treat those durations as budgets with owners.

**Mastery checks**
- Explain why `tsc` and your bundler can disagree about module resolution and how to align them.
- Explain what `no-floating-promises` catches and write the bug it prevents.
- Explain why snapshot tests rot and when they are still the right tool.

**Build**
- A complete project baseline: strict `tsconfig`, flat ESLint config with type-aware rules, Vitest with coverage, MSW handlers shared with development, type tests for the public API, changesets-based releases, and a CI pipeline that runs the lot in under five minutes.

**Taste**
- Make the checks fast and automatic, then trust them. Every quality gate that a human must remember to run is a gate that is already failing.

---

## PART 13 — Idiomatic TypeScript & API Design [Core → Deep]

- Naming and shape: descriptive names over abbreviations, consistent casing, types named for the domain rather than the structure (`OrderSummary`, not `DataObject`), avoiding `I`-prefixed interfaces, and one exported concept per file where it aids navigation
- Immutability by default: `const`, `readonly` properties and arrays, `as const` for literal data, non-mutating array methods (`toSorted`, `with`), and structural sharing for updates — with the honest note that deep freezing is rarely worth its cost
- **Error handling patterns**: exceptions for exceptional conditions and typed `Result`-style returns for expected failures; a discriminated-union result type; converting third-party throws at the boundary; `Error.cause` for chaining; never throwing strings; and making retriability and user-facing messages part of the error type
- **Parse, don't validate**: a schema at every boundary (network response, form input, environment variables, storage, message payloads, third-party webhooks), the parsed type flowing inward, and branded types for values that have passed validation
- Making illegal states unrepresentable: discriminated unions over optional-field soup, exhaustive `switch` with a `never` default, branded identifiers, non-empty array types, and state machines for multi-step flows
- Function and module API design (principles in `L18-cs-software-engineering.md` Part 4): options objects over long parameter lists, named boolean options rather than positional flags, overloads only when a union genuinely can't express it, returning data rather than mutating arguments, and designing the call site first
- Typing public APIs for consumers: precise but not hostile types, generics that infer without annotation, `satisfies` to keep literal types while checking shape, JSDoc for documentation that surfaces in editors, declaration files that don't leak internals, and treating type changes as semver-relevant
- Working with third-party types: augmenting rather than forking, narrowing loose library types at your boundary, and writing local `.d.ts` for untyped dependencies rather than sprinkling `any`
- Project conventions worth agreeing once: import ordering and aliases, barrel-file policy, folder structure by feature, where types live (co-located versus a `types` file), and the lint rules that enforce the boundaries
- Anti-idioms to catch in review: `any` as a shortcut, `as` assertions instead of narrowing, non-null `!` on values that genuinely can be null, `@ts-ignore` instead of `@ts-expect-error` with a comment, enums out of habit, classes where a function would do, default exports in large codebases, deep inheritance, and giant union types that should be a map

**Intuition anchors**
- The type system's job is to make the correct call obvious and the incorrect one impossible. If the correct usage needs a comment, the signature is wrong.
- Every boundary is a lie until it's parsed. The network does not respect your interfaces.

**Mastery checks**
- Convert an exception-based API to a discriminated-union result type and say what got better and what got worse.
- Design a function signature that cannot be called with an empty array, in the type system.
- Explain `satisfies` with a case where it beats both an annotation and an assertion.

**Build**
- A small library with an API you'd defend: schema-validated boundaries, branded domain types, discriminated-union errors, inference that works without consumer annotations, type tests, generated documentation, and a published package (Part 4).

**Taste**
- Write the types the domain deserves, validate at every edge, and keep the clever machinery out of application code. Most excellent TypeScript looks unremarkable; that is the point.

---

## PART 14 — Security & Reliability in JavaScript [Core]

*The web attack surface is `L18-cs-web-engineering.md` Part 7; the theory is `L18-cs-fundamentals.md` Part 15. This Part is language- and ecosystem-specific.*

- **Types are not validation**: a `User` type does not stop the server returning `null`; runtime schemas at boundaries are a security control, not a nicety
- **Prototype pollution**: `__proto__`, `constructor`, and `prototype` keys in merged or parsed objects; deep-merge utilities as the classic vector; `Object.create(null)` for dictionaries, `Object.hasOwn`, `Map` for untrusted keys, and schema validation that rejects unknown keys
- Injection in JavaScript: `eval`, `new Function`, `setTimeout` with a string, dynamic `import` of user-controlled paths, template injection, `child_process.exec` with interpolated arguments (use `execFile`/`spawn` with an argument array), SQL through string concatenation, and unsafe deserialisation
- **ReDoS**: catastrophic backtracking in user-facing regexes, the patterns that cause it (nested quantifiers, alternation with overlap), input length limits, and linear-time engines as the safe path
- Randomness and crypto: `Math.random` is not secure; `crypto.getRandomValues` and `crypto.randomUUID`; timing-safe comparison for secrets; and the rule against hand-rolled crypto (`L18-cs-fundamentals.md` Part 15)
- Secrets and the client bundle: environment variables inlined at build time are public; anything shipped to a browser or an app binary is readable; the server is the only place a secret exists
- **Supply chain**, the ecosystem's sharpest edge: a deep transitive graph, install scripts, typosquatting, dependency confusion between private and public registries, compromised maintainers and stolen tokens, lockfile integrity, `--ignore-scripts` as a default posture, provenance verification, minimal dependencies as a security strategy, and a policy for adding one
- Reliability in the language: unhandled rejections and uncaught exceptions (fail fast and restart in Node rather than limping on), error boundaries in UI, timeouts on every network call, back-pressure in streams, bounded caches and queues, and memory-leak classes from Part 7
- Node-specific hardening: path traversal in file serving, SSRF through user-supplied URLs, `JSON.parse` on unbounded input, rate limiting, request-size limits, and running with least privilege in containers
- Privacy in client code: telemetry minimisation, PII in logs and error reports, session-replay redaction, and consent gating what loads at all

**Intuition anchors**
- In this ecosystem, your attack surface is your dependency tree plus every boundary where untrusted data becomes structured data.
- "It type-checks" says nothing about what arrives at runtime. Validate, bound, and time-limit everything that crosses a boundary.

**Mastery checks**
- Demonstrate prototype pollution through a naive deep merge and fix it two ways.
- Explain how a build-time environment variable ends up in a public bundle and what belongs there instead.
- Explain dependency confusion and the registry configuration that prevents it.

**Build**
- A hardening pass on a real project: schema validation at every boundary, a prototype-pollution-safe merge, `execFile` instead of `exec`, ReDoS-safe patterns with input limits, dependency audit with install scripts disabled, secret scanning in CI, and a written report of what each control stops.

**Taste**
- Add dependencies reluctantly and validate inputs religiously. The two disciplines together prevent most of what actually goes wrong in JavaScript systems.

---

## PART 15 — Taste Development [Deep → Lifelong]

**What good looks like:** small modules with clear boundaries; types that describe the domain and make wrong states impossible; boundaries validated at runtime; async code that is parallel where it can be, cancellable where it should be, and never floating; components that are boring and predictable; dependencies few and justified; and code that a newcomer can follow without knowing your framework's folklore.

**Sources worth following:** the **TC39 proposals** repository (the language's design conversation, with rationales and rejected alternatives) · the **TypeScript release notes** and design-meeting notes · MDN and the ECMAScript specification · V8 and JavaScriptCore engineering blogs · Node, Deno, and Bun release notes · React's documentation (the current version is unusually good at explaining *why*) and the React Working Group discussions · Dan Abramov, Ryan Florence and Kent C. Dodds (React patterns, with disagreement encouraged), Rich Harris and Ryan Carniato (reactivity models), Matt Pocock (TypeScript technique), Anders Hejlsberg's talks on the type system, Lin Clark's illustrated explanations of engines and WASM, Addy Osmani on performance patterns

**Deliberate exercises**
- **Build the small version**: a promise implementation, a mini-React, a simple bundler, a tiny signals library, a schema validator. Each one permanently removes a category of mystery
- **Predict, then check**: before running, write the output order of an async snippet; before profiling, name the bottleneck; before compiling, predict the inferred type
- **Read the emitted output** of TypeScript, your bundler, and your framework's compiler on a component you wrote
- **Delete a dependency a month** from a real project and write what it cost to replace
- **Read one TC39 proposal a week**, including its rejected alternatives
- **Type-golf, then un-golf**: solve a type challenge, then write the boring version you'd actually ship and compare maintainability
- **Review your own code from six months ago** for `any`, floating promises, effect misuse, and derived state

**Anti-taste:** `any` as a habit · assertions instead of narrowing · effects deriving state · `useMemo` everywhere (or, in a compiled codebase, at all) · class components in new code without reason · a state library for server data · a dependency for three lines · barrel files that break tree shaking · default exports in large codebases · `Date` arithmetic by hand · chasing framework releases while ignoring language features · writing types nobody else on the team can modify

---

## PART 16 — Professional Growth [Lifelong]

- Separate the timescales: the language and web standards compound over decades; runtimes over years; frameworks over a few years; tools over months. Spend your learning budget in that proportion, and let the fast layer churn without you
- Participation: TC39 proposal discussions, TypeScript issues with minimal reproductions, framework RFCs, `DefinitelyTyped` contributions, and maintaining a small package — the fastest route to understanding API design under real constraints
- Evidence that carries weight: a published library with real users and excellent types, a performance or migration case study with numbers, an open-source contribution to a tool you use, and a codebase whose type safety and test suite you can demonstrate
- Career shapes in this ecosystem: product engineer, full-stack, platform/DX (build, types, tooling), design engineer (`L18-cs-design-engineering.md`), mobile with React Native (`L18-cs-app-engineering.md`), library author, and runtime or framework engineering
- Interviews: closures, `this`, the event loop and output ordering, promise combinators, TypeScript narrowing and generics, React rendering and effect semantics, debugging a live page or process, and system design (`L18-cs-software-engineering.md`)
- Avoiding churn burnout: adopt one major version behind for production, evaluate by cost of migration rather than novelty, and keep a personal policy for when a framework change is worth a rewrite (usually: never, unless the platform is ending)

---

## Capstone Projects

1. **A mini-React** — elements, reconciliation with keys, hooks with a queue, a commit phase (Part 8)
2. **A promise and async toolkit from scratch** — a spec-compliant promise, plus pool, retry, timeout, single-flight, and cancellation via `AbortSignal` (Part 3)
3. **A schema validator with type inference** — runtime parsing that produces the static type, branded outputs, good error messages (Parts 6, 13)
4. **A published package done properly** — ESM with correct `exports`, types, tree-shakeable, type tests, changesets releases, verified by installing the tarball (Parts 4, 12)
5. **A typed API layer** — schemas as the single source of truth, template-literal route types, a client with cancellation and retry, contract tests (Parts 3, 6, 13)
6. **A strict-mode migration** — take a real JavaScript or loose TypeScript codebase to `strict` plus `noUncheckedIndexedAccess` with zero `any`, documenting every design change forced (Parts 5, 6)
7. **A performance study** — hidden-class and allocation analysis on a hot path, a heap-snapshot leak hunt, a worker offload, and a WASM comparison (Part 7)
8. **A React Native feature with a custom native module** — TurboModule with Codegen, Reanimated gesture, profiled on a mid-range device (Part 9)
9. **Framework comparison** — the same app in React and a signals framework, with a written analysis of the models (Parts 8, 10)
10. **Flagship** — a product shipped and operated, with this file's language discipline and the relevant L18 file's engineering discipline

---

## Resource Library

**Primary:** MDN · the ECMAScript specification and **TC39 proposals** · the TypeScript handbook and release notes · Node, Deno, and Bun documentation · React documentation (including the "you might not need an effect" and rules-of-React sections) · React Native's architecture documentation · V8 and JavaScriptCore blogs

**Books:** *You Don't Know JS Yourself* (Simpson, free) for semantics · *JavaScript: The Definitive Guide* (Flanagan) as reference · *Eloquent JavaScript* (Haverbeke, free) for beginners · *Effective TypeScript* (Vanderkam) — the best TypeScript book · *Programming TypeScript* (Cherny) · *Node.js Design Patterns* (Casciaro & Mammino) · *JavaScript: The Good Parts* read historically, not as advice

**Courses and practice:** Type Challenges (for the type system, with the un-golf discipline from Part 15) · Matt Pocock's TypeScript material · Frontend Masters courses on JavaScript internals, TypeScript, and Node · Exercism's TypeScript track · `T1-coding-typescript-javascript.md` for the structured programme

**Code to read:** Preact (a complete React-compatible renderer small enough to read) · Solid's reactive core · Zod or Valibot (type inference in practice) · TanStack Query (cache design) · Node's standard library (streams and events) · Hono or Elysia (web-standard servers) · any well-typed library you already depend on

---

## Suggested Learning Order

1. **Part 0 → Part 1** — the language itself, deliberately, before any framework; the semantics museum build is the fastest route
2. **Part 2 → Part 3** — the standard library and the event loop; async is where most professional bugs live
3. **Part 5** — TypeScript's working subset, applied to real code with `strict` on from the start
4. **Part 4** — modules and packaging, as soon as you have more than one file or one consumer
5. **Part 8** — React mechanics (or your framework's equivalent), with the mini-React build to remove the magic
6. **Part 12 → Part 13** — tooling, testing, and idiom, on a project you maintain
7. **Part 6** — advanced types, when a library boundary or a domain invariant actually needs them
8. **Part 11** — runtimes, when you own a server or a build
9. **Part 7 → Part 14** — engines, performance, and security, once you have production traffic
10. **Part 9 or Part 10** — React Native or framework literacy, by where your work is heading
11. **Parts 15–16** — continuous: one proposal a week, one dependency deleted a month, one small implementation a quarter

**Rough scale (for planning, not promises):** for someone already writing React and TypeScript daily, the gap between working fluency and real command of this file — semantics, the event loop, the type system's mechanics, engines, and packaging — is typically a few hundred focused hours, most of it spent on Parts 1, 3, 5, and 8 and on the from-scratch builds rather than on new frameworks.
