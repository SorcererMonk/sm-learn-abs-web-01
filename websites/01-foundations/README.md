# 01 · Foundations: HTML & CSS, from the parser to taste

A learning website that turns two curriculum files into something you can read, poke and practise:

- **`L1-coding-html-css.md`**: 28 parts (0–27) from how the HTML parser recovers from errors to typography, colour, motion, design systems, server-rendered HTML, security and taste. Every part is a lesson at `/learn/<part>/`.
- **`T1-coding-html-css.md`**: the training programme, rendered as an interactive **dojo** at `/dojo/` with drill timers, belt trackers, probes, checklists and a logbook that exports to Markdown.

Every top-level topic of every part has its own section with a short explanation plus a live demo, an editable playground or an exercise with a model answer. Each lesson ends with the part's intuition anchors, mastery checks (with answers), a build project broken into steps, the taste note and a short quiz. Progress (done lessons, ticked exercises, dojo belts) stays in your browser.

## Run it

```bash
cd websites
npm install                 # once, installs every site's dependencies
npm run start:01            # dev server on http://localhost:4321 (opens a browser)
```

Or from this folder: `npm start` (dev), `npm run build && npm run preview` (production build).

The Part 22 backend example runs on its own, with no dependencies beyond Node 22:

```bash
npm run guestbook           # http://localhost:4400 · node:http + node:sqlite
```

## What's inside

| Area | Where | Notes |
| --- | --- | --- |
| Lessons (28) | `src/content/lessons/*.mdx` | One `##` section per source topic, in source order; typed front matter (anchors, checks, build steps, taste, quiz) validated by `lessonSchema` |
| Dojo (T1) | `/dojo/` | Rendered straight from the training file; timers, belts, probes, schedule, logbook |
| Start, capstones, path, resources | `/start/`, `/capstones/`, `/path/`, `/resources/` | The remaining sections of L1, rendered from source |
| Coverage | `/coverage/`, [COVERAGE.md](./COVERAGE.md) | Generated topic ↔ page ↔ demo matrix |
| Demos (site) | `src/components/demos/` | Parser lab, DOM/box/accessibility trees, heading outline, script timeline, rendering pipeline, responsive-image picker, viewBox lab, head audit, cascade lab, specificity calculator, flex calculator, server lab (HTTP/PRG/CSRF), escape lab, sanitiser lab, hostile-content harness |
| Demos (shared) | `../shared/components/demos/` | Fluid type scale, type setter, variable-font and OpenType labs, palette and contrast labs (OKLCH, WCAG 2, APCA), easing lab (springs → `linear()`), squint test, token lab, critique journal |
| Teaching libraries | `src/lib/` | Pure, unit-tested implementations behind the demos: accessible-name computation, specificity, the cascade sort, flex "resolve flexible lengths", srcset selection, head audit, escaping by context, allowlist sanitiser, auto-escaping `html` template, a mini HTTP server |
| Backend example | `examples/guestbook/server.ts` | PRG form, CSRF bound to an HttpOnly session cookie, SQLite, pagination, Atom feed, streaming, security headers; tested over real HTTP |
| Playgrounds | everywhere | Sandboxed `srcdoc` iframes (`allow-scripts` only, `allow-forms` where a lesson needs submission, never `allow-same-origin`), rendered at build time so they work without JavaScript |

## Stack

- **Astro 7** (static output) with **MDX** content collections; no UI framework. Client behaviour is plain TypeScript modules, lazily imported only on pages that use them (`shared/client/boot.ts`).
- **CSS**: cascade layers (`reset, tokens, base, layout, components, motion, site, demos, print`), design tokens compiled from one DTCG file (`shared/tokens/tokens.json`) to custom properties, OKLCH colour with `light-dark()`, Utopia-style fluid type and space, the Every Layout primitives, logical properties throughout.
- **Motion**: duration tokens 150 / 250 / 400 ms, standard/out/in easings and a spring compiled to `linear()`; transform and opacity only; everything behind `prefers-reduced-motion`; cross-document view transitions and scroll-driven reveals.
- **Fonts**: Fraunces and Instrument Sans, self-hosted variable woff2, preloaded, with metric-matched fallbacks (zero layout shift).
- **Images**: the site uses no raster images: illustrations are CSS and inline SVG, so there is nothing to convert to WebP/AVIF. The responsive-images lesson teaches the `<picture>`/AVIF/WebP pipeline with its own demo.
- **Tooling**: TypeScript (strict), ESLint (typescript-eslint, astro), Prettier, Vitest (+ happy-dom), Playwright + axe-core, Lighthouse.

## Quality gates

| Check | Command | Result at last run |
| --- | --- | --- |
| Coverage, no gaps | `npm run coverage -- --check` | 329/329 topics complete, 0 problems |
| Types | `npm run check` | 0 errors, 0 warnings |
| Unit tests (this site + shared) | `npm test` | 369 passing |
| JS budget, < 150 KB gzipped per page | `npm run budget` | largest page ≈ 8 KB initial + 5 KB lazy |
| End-to-end: every page, desktop + 360 px | `npm run test:e2e` | 76 passing: no console errors in any frame, axe WCAG 2.2 A/AA clean, no horizontal overflow at 360 px, all internal links and anchors resolve, skip link and theme toggle work |
| Lighthouse (mobile, simulated slow 4G) | `npm run lighthouse -- /learn/14-typography/` | all 36 pages: performance 96–100, accessibility 100, best practices 100, SEO 100 ([LIGHTHOUSE.md](./LIGHTHOUSE.md)) |
| Everything above | `npm run verify` | |

Accessibility beyond automated checks: semantic landmarks and heading order, a skip link, visible `:focus-visible` rings, keyboard-operable demos (native controls throughout), `aria-live` results, forced-colours support, reduced motion, 200% text and 360 px reflow.

## Coverage

<!-- coverage:start -->
**329 of 329 topics complete** across 29 parts/programmes. Generated by `npm run coverage` from the source Markdown and the lesson files; a topic is *Complete* only when its page section exists and contains a demo or exercise (see `shared/lib/coverage.ts`).

| Topic | Source MD | Website | Page/Component | Demo/Exercise | Status |
|---|---|---|---|---|---|
| PART 0: Orientation, Toolchain & Mental Models (8/8 topics) | `L1-coding-html-css.md` | Foundations | `/learn/00-orientation/` | ParserLab, Exercise (Try), Playground, TreesLab, PipelineStepper; Build/Analysis project · 3 mastery checks | Complete |
| PART 1: HTML: The Language, the Parser & the Document (9/9 topics) | `L1-coding-html-css.md` | Foundations | `/learn/01-html-language-parser/` | Exercise (Try), ParserLab, Playground, ScriptTimeline; Build/Analysis project · 4 mastery checks | Complete |
| PART 2: HTML Semantics & the Content Model (9/9 topics) | `L1-coding-html-css.md` | Foundations | `/learn/02-semantics-content-model/` | ParserLab, Exercise (Try), TreesLab, HeadingOutline, Playground; Build/Analysis project · 4 mastery checks | Complete |
| PART 3: Forms & Native Interactive Elements (9/9 topics) | `L1-coding-html-css.md` | Foundations | `/learn/03-forms-native-elements/` | Playground, Exercise (Try); Build/Analysis project · 4 mastery checks | Complete |
| PART 4: Media, Embeds & Responsive Images (9/9 topics) | `L1-coding-html-css.md` | Foundations | `/learn/04-media-responsive-images/` | Playground, ResponsiveImagePicker, Exercise (Try); Build/Analysis project · 4 mastery checks | Complete |
| PART 5: SVG, Canvas & Graphics on the Web (14/14 topics) | `L1-coding-html-css.md` | Foundations | `/learn/05-svg-canvas-graphics/` | ViewBoxLab, Playground, Exercise (Try); Build/Analysis project · 4 mastery checks | Complete |
| PART 6: The Head, Metadata & Discoverability Markup (10/10 topics) | `L1-coding-html-css.md` | Foundations | `/learn/06-head-metadata/` | HeadAudit, Exercise (Try), Playground; Build/Analysis project · 4 mastery checks | Complete |
| PART 7: Accessible Markup & the Accessibility Tree (11/11 topics) | `L1-coding-html-css.md` | Foundations | `/learn/07-accessible-markup/` | TreesLab, Exercise (Try), Playground; Build/Analysis project · 4 mastery checks | Complete |
| PART 8: CSS Core: The Cascade, Inheritance, Values & Custom Properties (14/14 topics) | `L1-coding-html-css.md` | Foundations | `/learn/08-cascade-values-custom-properties/` | Playground, CascadeLab, SpecificityCalc, Exercise (Try); Build/Analysis project · 5 mastery checks | Complete |
| PART 9: Selectors, Nesting & Scoping (11/11 topics) | `L1-coding-html-css.md` | Foundations | `/learn/09-selectors-nesting-scope/` | Playground, Exercise (Try); Build/Analysis project · 4 mastery checks | Complete |
| PART 10: The Visual Formatting Model: Boxes, Flow, Positioning & Stacking (15/15 topics) | `L1-coding-html-css.md` | Foundations | `/learn/10-visual-formatting-model/` | Playground; Build/Analysis project · 5 mastery checks | Complete |
| PART 11: Flexbox (10/10 topics) | `L1-coding-html-css.md` | Foundations | `/learn/11-flexbox/` | Playground, FlexCalc, Exercise (Try); Build/Analysis project · 4 mastery checks | Complete |
| PART 12: Grid, Subgrid & Masonry (13/13 topics) | `L1-coding-html-css.md` | Foundations | `/learn/12-grid-subgrid-masonry/` | Playground, Exercise (Try); Build/Analysis project · 5 mastery checks | Complete |
| PART 13: Responsive, Intrinsic & Fluid Design (11/11 topics) | `L1-coding-html-css.md` | Foundations | `/learn/13-responsive-intrinsic-fluid/` | Playground, FluidScaleLab, Exercise (Try); Build/Analysis project · 5 mastery checks | Complete |
| PART 14: Typography on the Web (16/16 topics) | `L1-coding-html-css.md` | Foundations | `/learn/14-typography/` | Playground, Exercise (Try), VariableFontLab, OpenTypeLab, TypeSetter; Build/Analysis project · 4 mastery checks | Complete |
| PART 15: Colour, Backgrounds & Visual Effects (17/17 topics) | `L1-coding-html-css.md` | Foundations | `/learn/15-colour-backgrounds-effects/` | Playground, PaletteLab, ContrastLab; Build/Analysis project · 5 mastery checks | Complete |
| PART 16: Transitions, Animations & Motion Design (17/17 topics) | `L1-coding-html-css.md` | Foundations | `/learn/16-transitions-animations-motion/` | Playground, EasingLab; Build/Analysis project · 5 mastery checks | Complete |
| PART 17: Scroll, Page & Spatial Motion: Scroll-Driven Animations, View Transitions & Beyond (8/8 topics) | `L1-coding-html-css.md` | Foundations | `/learn/17-scroll-view-transitions/` | Playground, Exercise (Try); Build/Analysis project · 4 mastery checks | Complete |
| PART 18: Visual & Interaction Design Fundamentals for the Designer-Developer (19/19 topics) | `L1-coding-html-css.md` | Foundations | `/learn/18-visual-interaction-design/` | Exercise (Try), Playground, SquintTest; Build/Analysis project · 4 mastery checks | Complete |
| PART 19: CSS Architecture, Design Tokens & Design Systems (14/14 topics) | `L1-coding-html-css.md` | Foundations | `/learn/19-css-architecture-tokens-systems/` | Playground, Exercise (Try), TokenLab; Build/Analysis project · 4 mastery checks | Complete |
| PART 20: The HTML/CSS ↔ JavaScript Boundary & Web Components (9/9 topics) | `L1-coding-html-css.md` | Foundations | `/learn/20-js-boundary-web-components/` | Playground, Exercise (Try); Build/Analysis project · 3 mastery checks | Complete |
| PART 21: Rendering Performance, Tooling & Debugging for HTML/CSS (12/12 topics) | `L1-coding-html-css.md` | Foundations | `/learn/21-rendering-performance-debugging/` | Exercise (Try), Playground, PipelineStepper; Build/Analysis project · 4 mastery checks | Complete |
| PART 22: Server-Rendered HTML: Forms, Templates, Hypermedia & the Backend of Markup (10/10 topics) | `L1-coding-html-css.md` | Foundations | `/learn/22-server-rendered-html/` | ServerLab, Exercise (Try), EscapeLab, Playground, Header, CartButton, Code, SanitizerLab; Build/Analysis project · 4 mastery checks | Complete |
| PART 23: HTML & CSS Beyond the Screen: Email, Print, PDF & Other Targets (7/7 topics) | `L1-coding-html-css.md` | Foundations | `/learn/23-beyond-the-screen/` | Playground, Exercise (Try); Build/Analysis project · 3 mastery checks | Complete |
| PART 24: Resilience: Cross-Browser, Internationalisation, Defensive CSS & Testing (9/9 topics) | `L1-coding-html-css.md` | Foundations | `/learn/24-resilience-cross-browser-i18n/` | Playground, HostileContent, Exercise (Try); Build/Analysis project · 4 mastery checks | Complete |
| PART 25: Security & Privacy at the Markup Layer (8/8 topics) | `L1-coding-html-css.md` | Foundations | `/learn/25-security-privacy-markup/` | Playground; Build/Analysis project · 4 mastery checks | Complete |
| PART 26: Taste Development (4/4 topics) | `L1-coding-html-css.md` | Foundations | `/learn/26-taste-development/` | Playground, Exercise (Try), CritiqueJournal; Build/Analysis project · 3 mastery checks | Complete |
| PART 27: Professional Growth (7/7 topics) | `L1-coding-html-css.md` | Foundations | `/learn/27-professional-growth/` | Playground, Exercise (Try); Build/Analysis project · 3 mastery checks | Complete |
| Training programme (15 sections) | `T1-coding-html-css.md` | Foundations | `/dojo/` | timers, belts, checklists, probes, logbook; every drill, exercise, build and trial is trackable | Complete |

Full topic-level matrix: [COVERAGE.md](./COVERAGE.md).
<!-- coverage:end -->
