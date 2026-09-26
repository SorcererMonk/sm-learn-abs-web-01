# HTML & CSS → Training Programme
## T1: Coding · Markup Drills · Layout Reps · Copywork Studio · Real-World Briefs · Motion Studies · End-to-End Builds · Taste Forge

> The training counterpart to `L1-coding-html-css.md`. HTML and CSS have a specific training hazard: they are easy enough to *get something on screen* that you can work for years without understanding the cascade, the layout algorithms, or the accessibility tree. You fix every bug by adding another declaration until it looks right at your viewport. It then breaks at another width, in another language, with another piece of content. This programme is built to close exactly that gap, and to train the second half of the craft most developers never train at all: **the design eye**.
>
> Three outcomes: **muscle memory** (writing semantic, accessible, responsive, resilient markup and layout without lookup, and translating a design into CSS almost mechanically), **intuition** (predicting which rule wins, how a layout will resolve, where a stacking context traps you, and how a page will look at 320 px before you resize), and **taste** (your own design and code patterns: your tokens, your layout primitives, your motion language, your standards, and a visual voice that is yours).
>
> Pair with `T1-coding-typescript-javascript.md` for behaviour and `T18-cs-web-engineering.md` for the platform, performance, and delivery half. `L#` refers to a Part of the L file.

---

## 1. How to Train

**Session shapes**

| Shape | Length | Use |
|---|---|---|
| **Drill** | 20–40 min | Section 3. One behaviour, from memory, timed, platform only. Then delete it. |
| **Prediction set** | 15 min | Section 11. Ten snippets. Predict the winning value, the layout, or the stacking order before rendering. |
| **Copywork** | 60–90 min | Section 5. Recreate a world-class screen from a screenshot, without viewing its source. Then compare. |
| **Screen rep** | 90 min | Section 6. Build a real screen to the hostile spec. |
| **Brief** | 2–4 h | Section 7. A realistic client problem with constraints and a twist. Design and build it. |
| **Motion study** | 45–60 min | Section 3 D7 + Section 5. Recreate one interaction's timing and easing exactly, then design a reduced-motion variant. |
| **From-scratch build** | 90 min–half day | Section 4. Rebuild a piece of the ecosystem (a reset, a primitive library, a token pipeline). |
| **Trial** | 60–90 min | Section 9. Adversarial: hostile content, zoom, RTL, no-JS, legacy rescue, email. |
| **Build** | Half day+ | Section 8. Advance an end-to-end application one rung. |
| **Forge** | 30–45 min, weekly | Section 12. Standards, swipe file, critique journal, scored predictions. |

**Rules of the room**
1. **HTML first, unstyled, validated.** Every drill, rep, and build starts with markup that passes the Nu HTML Checker and reads correctly with CSS turned off. No styling until the document makes sense.
2. **No framework, no CSS library in drills.** Plain HTML and CSS (plus the minimum JavaScript to flip state). Frameworks and Tailwind are allowed in builds, never in drills, because drills train the platform underneath them.
3. **Resize, zoom, flip, before "done".** Drag from 280 px to 2560 px, zoom to 200% and 400%, switch to `dir="rtl"`, emulate forced colours and reduced motion, and tab through with the keyboard. If any of those break, it isn't done.
4. **Predict before you render** (Section 11). Which rule wins, where the item lands, which element is on top. Log it.
5. **Real content only.** No lorem ipsum. Use real copy, real names (long and short), real images of awkward aspect ratios, and real data extremes.
6. **Tokens, not magic numbers.** After White belt, every colour, space, size, radius, shadow, and duration comes from your token set. Any raw value must be justified in a comment.
7. **Numbers or it didn't happen.** Claims about accessibility, performance, or zoom need evidence: an axe scan, a screen-reader note, a trace, a Lighthouse run, or a screenshot at 400%.
8. **One repo plus one live site.** Keep `htmlcss-training/` with `drills/`, `copywork/`, `briefs/`, `reps/`, `builds/`, `primitives/`, `tokens/`, `standards.md`, `predictions.md`, `swipe/`, `critique.md`, and `LOG.md`. Keep a deployed personal site you keep improving, because it is your permanent portfolio and your field lab.

**Weekly minimum:** 4 drills · 2 prediction sets · 1 copywork · 1 screen rep or brief · 1 build session · 1 forge entry · 5 critique-journal entries. Trials and from-scratch builds fortnightly.

---

## 2. The Belt Ladder

Cold, timed, no framework, hostile spec applied (Section 6), zero axe violations.

| Belt | Gate | Covers |
|---|---|---|
| **White** | In 45 min: a semantic, validated article page (header, nav, main, article with figure and table, aside, footer) with a working no-JS contact form, keyboard-complete, readable unstyled, then styled with a reset, a type scale, and a readable measure. | L# 1–3, 7, 8, 14 |
| **Yellow** | In 60 min: a responsive landing page from a provided design (hero, features grid, testimonials, pricing, FAQ with `<details>`, footer) using flex and grid, **no media queries except one**, fluid type with `clamp()`, and zero overflow from 280 px to 2560 px. | L# 11–13 |
| **Orange** | In 90 min: a component set (button, input, select, checkbox, radio, switch, card, dialog, popover menu, tabs, toast) on native elements, with every state designed (hover, focus-visible, active, disabled, invalid, loading), a token file, and light and dark themes with `light-dark()`. | L# 3, 7, 9, 15, 19 |
| **Green** | In 2 h: recreate a provided world-class screen (Section 5 list) at 95% visual fidelity from a screenshot, with a fluid layout that survives hostile content and RTL, and a written diff against the original's CSS. | L# 10–15, 18 |
| **Blue** | In 2 h: a motion pass on an existing page: dialog and popover enter/exit with `@starting-style`, an accordion animating to `height: auto`, a scroll-driven reading progress and reveal, a same-document view transition between list and detail, all compositor-only (proven by trace) with a complete reduced-motion mode. | L# 16, 17, 21 |
| **Brown** | In 3 h: a server-rendered mini-app (a template engine, SQLite, one CRUD resource) with PRG forms, accessible server-side validation errors, CSRF tokens, cookie sessions, escaped output, security headers, and a print stylesheet, enhanced with htmx or a small script without breaking the no-JS path. | L# 3, 22, 25 |
| **Black** | Over a quarter: design and build a real product or client site end to end. That means the brief, references, Figma exploration with variables matching your tokens, a design system package, the site with field Core Web Vitals green at p75, a WCAG 2.2 AA audit with a screen-reader pass, RTL and forced-colours support, an email template and a PDF output from the same tokens, and a public case study. | all |

**The Design-Eye Ladder** (runs in parallel; judged by a peer or a mentor, or by you after a 48-hour break, against a written rubric)

| Rung | Gate |
|---|---|
| **1 — See** | Given ten screens, correctly name the primary hierarchy device (size, weight, colour, space, position) and one flaw in each, in 20 minutes. |
| **2 — Subtract** | Redesign a cluttered screen using only spacing, weight, and value changes (no new colours, no new elements), and have it judged clearer by three people. |
| **3 — System** | Produce a style tile (type pair, scale, palette in OKLCH, spacing scale, radius and shadow scale, motion tokens) for a fictional brand, and apply it to three different screens that feel like one product. |
| **4 — Voice** | Produce three distinct visual directions for the same brief (e.g., editorial, playful, technical), each internally consistent, and argue which fits the brief best. |
| **5 — Signature** | A portfolio of ten original pieces that a stranger can recognise as yours, with case studies that show reasoning, not just results. |

---

## 3. Drill Bank

**D1 — HTML & semantics (from memory, validated)**
| Drill | Target |
|---|---|
| Write a complete `<head>` for a blog post (charset, viewport, title, description, canonical, icons, OG, JSON-LD, colour-scheme) | 10 min |
| Mark up a news article page with correct landmarks and heading outline; verify with a screen reader's landmark and heading lists | 20 min |
| Mark up a complex data table (two header levels, row headers, caption, footer totals) that announces correctly | 20 min |
| Mark up a recipe with `<time>`, lists, a figure, microdata or JSON-LD, and a print-friendly structure | 20 min |
| Rewrite a `div`-soup page (provided) into semantic HTML with zero `div`s that carry meaning | 25 min |
| Predict and verify the DOM for five malformed snippets (Part 1 parser museum) | 15 min |
| Write alt text for ten images in context (decorative, functional, informative, complex chart, logo link) | 15 min |

**D2 — Forms & native interactive elements**
| Drill | Target |
|---|---|
| Checkout address + payment form with correct types, `autocomplete`, `inputmode`, grouping, and labels; complete it with autofill and keyboard only | 25 min |
| Validation UX: `:user-invalid` styling, inline errors via `aria-describedby`, an error summary that moves focus, no-JS server fallback stubbed | 30 min |
| Modal `<dialog>` with a form returning a value, backdrop, focus return, and animated entry/exit | 20 min |
| Popover menu anchored to its button with anchor positioning and a flip fallback | 25 min |
| Exclusive accordion with `<details name>`, styled marker, and animated open to `height: auto` | 20 min |
| Custom checkbox, radio, and switch that keep native inputs and pass forced-colours | 25 min |
| Customisable `<select>` with rich options and a progressive-enhancement fallback | 25 min |

**D3 — Cascade & selectors**
| Drill | Target |
|---|---|
| Write a modern reset from memory, in `@layer reset`, and justify each line | 15 min |
| Given a stylesheet with a specificity war (provided), refactor it into layers and `:where()` with identical rendering | 30 min |
| Ten `:has()` selectors for real problems (form-level invalid state, card with image, quantity queries, theme switch, scroll lock) | 20 min |
| Component styled only through state attributes (`[aria-expanded]`, `[aria-current]`, `[data-state]`, `:checked`, `:open`) | 20 min |
| `@scope` with a donut boundary around user content inside a card | 15 min |
| `@property` animated gradient border and a conic progress ring | 20 min |
| Custom-property component API: a button whose padding, radius, colours, and icon gap are themeable from outside | 20 min |

**D4 — Layout algorithms**
| Drill | Target |
|---|---|
| The twelve *Every Layout* primitives from memory (Stack, Box, Center, Cluster, Sidebar, Switcher, Cover, Grid, Frame, Reel, Imposter, Icon) | 40 min total |
| Holy-grail page layout with `grid-template-areas` that collapses in narrow containers | 15 min |
| Full-bleed article layout with named lines and three breakout widths | 15 min |
| Card row aligned with subgrid (title, body, and button rows aligned across cards) | 15 min |
| Fix five flexbox overflow bugs (provided): `min-width: auto`, long URLs, images, `<pre>`, nested flex | 20 min |
| Magazine cover: overlapping text and image in one grid cell, `mix-blend-mode` headline, no absolute positioning | 25 min |
| Stacking-context puzzle (provided): a dropdown trapped under a sticky header; fix without raising any `z-index` | 15 min |
| Sticky sidebar and sticky table header that both actually stick; explain each failure you hit | 20 min |

**D5 — Responsive & intrinsic**
| Drill | Target |
|---|---|
| Fluid type and space scale (Utopia-style) with `clamp()` that passes 200% zoom | 20 min |
| One card component with container queries used in a sidebar and a main column at the same time | 20 min |
| Style query variant (`--layout: compact`) driving a component's descendants | 15 min |
| Mobile full-screen hero and bottom sheet with correct `svh`/`dvh`, safe-area insets, and keyboard behaviour | 20 min |
| Convert a page to logical properties and verify it in RTL and in vertical writing mode for one section | 20 min |
| Responsive data table: three strategies (scroll region, reflowed cards, priority columns) | 30 min |

**D6 — Typography & colour**
| Drill | Target |
|---|---|
| Set a long-form article (family, scale, line heights, measure, spacing, links, quotes, code, tables with tabular numbers) | 30 min |
| Zero-CLS web-font loading with a metric-adjusted fallback, proven with the layout-shift overlay | 20 min |
| 11-step OKLCH tonal scale for a brand colour + a tinted neutral scale; verify contrast pairs | 20 min |
| Derive hover, active, subtle, border, and focus colours from one token with relative colour syntax | 15 min |
| Dark mode palette designed (not inverted) with a no-flash persisted toggle | 25 min |
| Layered realistic shadow elevation scale (5 levels) tinted to the background hue | 15 min |
| Gradient text, a grain overlay via SVG `feTurbulence`, and a frosted-glass bar with a fallback | 25 min |

**D7 — Motion**
| Drill | Target |
|---|---|
| Button press, hover lift, and focus-ring transition with duration and easing tokens | 10 min |
| Toast stack: enter, auto-dismiss with pause on hover and focus, exit, reduced-motion variant | 25 min |
| Spring-like easing with `linear()` and a side-by-side comparison with `cubic-bezier` | 15 min |
| FLIP list reorder with WAAPI | 25 min |
| Scroll-driven reading progress bar and reveal-on-scroll with `view()` and `animation-range` | 15 min |
| Shared-element view transition from a thumbnail grid to a detail view | 25 min |
| Line-drawing SVG checkmark with `stroke-dashoffset` | 10 min |
| Recreate a named interaction exactly (e.g., a well-known app's tab indicator or a sheet opening) from a screen recording, frame by frame | 40 min |

**D8 — SVG & graphics**
| Drill | Target |
|---|---|
| Hand-write five icons with `<path>` on a 24×24 grid, `currentColor`, correct `viewBox` | 25 min |
| Build a `<symbol>` sprite and use icons accessibly beside text and standalone | 15 min |
| Optimise an exported SVG by hand (then compare with SVGO) and keep it theme-aware | 15 min |
| Accessible SVG bar chart from a data array, with a data-table alternative | 30 min |
| SVG filter effects: duotone, grain, and a displacement "liquid" hover | 25 min |
| Crisp Canvas 2D drawing at device-pixel ratio with a resize handler | 20 min |

**D9 — Diagnosis reflexes** (each under 8 minutes)
Find why a declaration is inactive · find the rule that won in Computed and explain why · find the stacking context trapping an element · find the containing block of a `position: fixed` element that scrolls · find why `position: sticky` fails · find the overflowing element causing horizontal scroll · find the source of a layout shift · find why a grid column blows out · find why text doesn't truncate · find why a font is faux-bolded · find why a `:hover` style sticks on touch · read an element's accessible name and role in the accessibility tree · find why a focus ring is invisible in forced colours.

**D10 — Design reflexes** (each under 10 minutes)
Squint-test a screen and name the first three things you see · rewrite three button labels and an error message · fix a screen's spacing to a 4/8 scale · reduce a palette to one accent · choose a type pairing for a given brief and justify it · name every missing state of a component · critique one screen in three sentences using correct vocabulary · redesign one card with better hierarchy · sketch three layout options for a section on paper.

---

## 4. From-Scratch Builds

The highest-value exercise for turning "I use it" into "I understand it". One per fortnight.

| Build | Removes the mystery of |
|---|---|
| **A modern CSS reset + base layer**, documented line by line | user-agent styles and defaults |
| **A layout-primitive library** (the twelve primitives as classes or custom elements, configurable by custom properties) | intrinsic layout |
| **A token pipeline** (DTCG JSON → CSS custom properties with light/dark/brand modes, via Style Dictionary or your own script) | design tokens |
| **A mini utility framework** (a tiny Tailwind: generate utilities from a token scale into a `utilities` layer, with purging) | utility-first CSS |
| **A classless stylesheet** that makes any semantic HTML look good (like Pico/Simple.css) | styling semantics directly |
| **A theming engine** (brand colour in → OKLCH palettes, contrast-checked, light and dark, via relative colour) | colour systems |
| **A fluid type-and-space scale generator** (two viewports, two ratios → `clamp()` tokens) | fluid design |
| **A motion token system** (durations, easings including `linear()` springs, and named patterns such as enter, exit, emphasise, with a reduced-motion map) | motion design systems |
| **An accessible component set on native elements** (dialog, popover menu, tabs, disclosure nav, combobox, toast, tooltip) | the APG and native behaviour |
| **A static-site generator** (Markdown + templates + layouts + partials → HTML, with metadata and feeds) | templating and the server side of HTML |
| **An HTML email framework** (a few table-based components, inlining, dark-mode handling, Outlook fixes) | email rendering |
| **A print/PDF pipeline** (HTML + `@page` + Paged.js → invoice and résumé PDFs) | paged media |

**Protocol:** build it from your own understanding first, without reading an existing implementation. Then read the real one (Open Props, Pico, Tailwind, Style Dictionary, Every Layout, Eleventy, MJML, Paged.js) and write a page on what it handles that you didn't.

---

## 5. Copywork Studio

Painters learn by copying masters. Designer-developers learn spacing, type, colour, and motion the same way. **One recreation a week.**

**Protocol**
1. Take a full-page screenshot (desktop and mobile) and, for motion, a screen recording. **Don't open DevTools on the original.**
2. Recreate it in plain HTML and CSS: semantic markup first, then layout, type, colour, and details. Match to within a few pixels at one width, then make it fluid.
3. Overlay your screenshot on the original (at 50% opacity, or with a diff tool) and fix the differences.
4. *Now* open the original's DevTools: compare tokens, layout techniques, fonts, easing curves, and breakpoints. Write down three things they did better and one thing you did better.
5. Run the hostile spec (Section 6) on your version. The original often fails it, and that's part of the lesson.
6. **Redesign pass (monthly):** take one recreation and improve it with a written rationale.

**Target list** (rotate categories)
- *Product UI:* Linear's issue list, Stripe's dashboard, Vercel's deployment page, GitHub's pull-request view, Notion's page with a sidebar, Figma's layers panel, Things 3 (web recreation), Arc's sidebar
- *Marketing:* stripe.com home, apple.com product page, linear.app home, a Framer or Webflow showcase site, a Swiss-style agency site
- *Editorial:* a long-form NYT/Guardian/Pudding feature, a Medium-style article, a magazine-style homepage with a complex grid
- *Commerce:* a product detail page, a cart and checkout, a faceted listing
- *Forms and flows:* a GOV.UK multi-step service, a sign-up flow, a settings page
- *Data:* an analytics dashboard with charts and tables, a pricing comparison table
- *Motion:* a tab indicator, a sheet or drawer, a command palette opening, a like animation, a page transition, a scroll-driven story section
- *Email:* a well-designed transactional email and a newsletter
- *Print:* a beautifully set résumé, an invoice, a poster in the International Typographic Style

---

## 6. Screen Reps

One per week, 90 minutes, building a real screen. **The hostile spec every rep must pass:**

- HTML validates, reads correctly unstyled, and has correct landmarks and a heading outline
- Keyboard-complete with a visible, designed `:focus-visible` on every interactive element; axe with zero violations; sensible screen-reader traversal
- All states designed: loading, empty, error, success, disabled, and long-content; no lorem ipsum
- From 280 px to 2560 px with no horizontal scroll and no overlap; 200% and 400% zoom (reflow at 320 CSS px); text-spacing override (WCAG 1.4.12) survives
- `dir="rtl"` renders correctly with appropriate mirroring; one long-language (German) and one short-language (Chinese or Japanese) string set tested
- `prefers-reduced-motion`, `prefers-color-scheme` (both themes designed), and `forced-colors: active` all survivable
- Tokens only: no raw colours, spaces, or durations outside the token file
- Zero unexpected CLS; images sized; fonts metric-matched; animations compositor-only
- Primary action works without JavaScript (or degrades explicitly and honestly)
- Touch targets ≥ 24×24 CSS px (44×44 on primary mobile actions)

**Rep list:** a pricing page with a comparison table and a monthly/yearly toggle · a product listing with faceted filters as a GET form · a product detail page with a gallery and variant selector · a multi-step checkout · a settings page with toggles, grouped forms, and a danger zone · a dashboard with KPI cards, a chart, and a data table · an inbox or chat layout with a resizable sidebar · a comments thread with nested replies · a blog article with footnotes, code, and a table of contents that highlights on scroll · a documentation page with sidebar navigation and search · an onboarding flow · an error/404/offline page trio · a calendar or booking picker · a media gallery with a lightbox (`<dialog>`) · a user profile with an avatar upload.

---

## 7. Real-World Brief Bank

Each brief is a realistic client problem with **constraints** (what you must respect) and a **twist** (the thing that goes wrong in real projects). Design first, with references, sketches, and a style tile, then build. Every brief ends with a one-page case study: the problem, decisions, trade-offs, what you'd change, and screenshots at three widths. Two per month.

| # | Brief | Constraints | Twist |
|---|---|---|---|
| 1 | **Local bakery site** — menu, hours, location, pre-order form | Owner edits the menu in a Markdown file; must work on a 5-year-old Android on 3G | The menu has 80 items and prices change weekly; the form must work with JS off |
| 2 | **Restaurant menu for QR codes** | Loads under 1 s on mobile data; readable in dim light; allergen filters | Menu in English, Hindi, and Arabic (RTL) from the same template |
| 3 | **Portfolio for a photographer** | Images are the content; must look premium; fast | 400 photos of every aspect ratio; client wants "masonry" and a lightbox |
| 4 | **SaaS marketing page** | Brand guide provided (logo, two colours, one font); needs pricing, FAQ, and testimonials | Legal adds a cookie banner and a 900-character disclaimer late; marketing adds a third pricing tier the day before launch |
| 5 | **Government-style service form** (apply for a permit) | WCAG 2.2 AA mandatory; one question per page; works without JS; error summary | Users include screen-reader users, older people on large text, and people on library computers with IE-era habits |
| 6 | **Event landing page with countdown and schedule** | Schedule across time zones; add-to-calendar; speakers grid | The schedule changes hourly on the day; the page must print as a one-page handout |
| 7 | **E-commerce product detail page** | Variant selector (size, colour), gallery, reviews, sticky add-to-cart on mobile | Out-of-stock variants, a 40-character product name in German, and a sale price with a strikethrough that must be announced correctly |
| 8 | **Admin dashboard** | Dense data tables, filters in the URL, charts, dark mode | Columns can be 3 or 30; numbers must align; must work at 1280 px *and* on an iPad |
| 9 | **Newsletter + email template** | Same brand as the website; renders in Outlook for Windows, Gmail, and Apple Mail; dark mode | Images are blocked by default for half the audience |
| 10 | **Résumé that prints perfectly** | One HTML source → responsive web page + A4/Letter PDF | Must fit exactly two pages; no orphaned headings |
| 11 | **Non-profit donation page** | High trust, fast, accessible; amount presets and a custom amount; monthly toggle | Donors on older iPhones; payment embed you don't control causes layout shift |
| 12 | **Documentation site** | Sidebar navigation, search, code blocks with copy, versioning, dark mode | 300 pages of Markdown; headings deep enough to need an on-page TOC with scroll-spy |
| 13 | **Data story / scrollytelling** (a public dataset) | A narrative with charts that animate as you scroll | Must be fully readable with motion off and on a screen reader; charts need text alternatives |
| 14 | **Design system for a 3-product company** | Tokens, 25 components, docs, two brands | Product B uses React, Product C uses plain server-rendered HTML; the system must serve both (web components or CSS-only) |
| 15 | **Legacy rescue** — a 2014 Bootstrap 3 site | Keep the content and URLs; modernise design, performance, and accessibility | No build step allowed on the client's server; one week |
| 16 | **Multi-language news homepage** | A dense, editorial grid; breaking-news banner; live-updated section | English and Japanese (with a vertical-text feature section); headlines vary from 3 to 20 words |
| 17 | **Booking/appointment picker** | Calendar, time slots, time-zone clarity, confirmation email | Must be fully keyboard- and screen-reader-operable; slots disappear while the user is choosing |
| 18 | **Agency showcase site** (the "award-grade" brief) | Signature motion, custom type, page transitions, a WebGL moment | Must pass the hostile spec, hit green Core Web Vitals on a mid-range phone, and have a full reduced-motion mode |
| 19 | **Internal tool, server-rendered** (inventory CRUD) | No SPA; htmx or plain forms; sessions; role-based views | Three people edit the same item at once; validation errors must survive round trips |
| 20 | **Landing page A/B variants** | Two visual directions from one component set | Must share 90% of the CSS; the variant switch cannot cause a flash |
| 21 | **Accessible chart component** | Bar, line, and donut from the same data API; theming via tokens | Forced-colours mode and colour-blind users; must print in greyscale |
| 22 | **White-label widget** embedded on unknown sites | Style-isolated (shadow DOM or iframe), themeable by the host via custom properties | Host pages have aggressive global CSS (`* { box-sizing: content-box !important }`) and a `z-index: 999999` header |
| 23 | **Kiosk/TV interface** (a museum guide) | D-pad navigation, 10-foot typography, high contrast | Low-power hardware; no mouse; must work if the network drops |
| 24 | **Your own brand** | Name, logo concept, type, palette, voice, personal site, CV, email signature, and OG images | Everything from one token set; it has to feel like *you* |

---

## 8. Build Ladder (End-to-End Applications)

Each rung is a complete, deployed, end-to-end application or artefact, and each builds on the previous one where possible. Log every rung with a case study.

| # | Build | Forces |
|---|---|---|
| 1 | **Personal site v1**: semantic HTML, a reset, a type scale, one layout, dark mode, deployed on a static host with a custom domain | L# 1–2, 6, 8, 14 |
| 2 | **A static blog engine**: Markdown → HTML with templates and layouts, feeds, sitemap, per-page metadata and generated OG images, print stylesheet | L# 6, 22, 23 |
| 3 | **A responsive marketing site** for a real or fictional product: fluid type and space, layout primitives, container-query components, zero media-query sprawl | L# 11–13 |
| 4 | **A component library on native elements** with tokens, every state designed, light/dark/forced-colours, and a docs page per component | L# 3, 7, 15, 19 |
| 5 | **A design-token pipeline + Figma library**: DTCG JSON → CSS, a Figma file with matching variables and auto-layout components, two brands | L# 18, 19 |
| 6 | **A server-rendered CRUD app** (e.g., a reading list or inventory): templates, SQLite, PRG forms with server validation and accessible errors, sessions, CSRF, escaped output, security headers | L# 3, 22, 25 |
| 7 | **Enhance rung 6 with hypermedia**: htmx or Turbo for partial updates, view transitions between pages, optimistic UI that degrades cleanly | L# 17, 20, 22 |
| 8 | **An e-commerce front** (catalogue, faceted filters as GET forms, product page, cart, checkout form) with art-directed images and zero CLS | L# 3, 4, 13, 21 |
| 9 | **A dashboard** with accessible SVG charts, dense data tables (sorting and pagination in the URL), density modes, and dark mode | L# 5, 12, 15, 24 |
| 10 | **An award-grade storytelling site**: kinetic type, scroll-driven chapters, cross-document view transitions, a WebGL or SVG-filter hero with fallback, full reduced-motion mode, green vitals on a mid-range phone | L# 14–17, 21 |
| 11 | **A transactional email set + PDF documents** (welcome, receipt, password reset; an invoice PDF) from the same tokens as rung 4 | L# 23 |
| 12 | **Internationalise an existing build**: RTL (Arabic or Hebrew), a CJK locale with an appropriate font and line height, pseudo-localisation tests, locale-aware server output | L# 14, 22, 24 |
| 13 | **Harden an existing build**: CSP with nonces (including styles), sanitised user content, isolated upload origin, visual-regression and axe in CI across engines, themes, and locales | L# 24, 25 |
| 14 | **Design system package v1**: rung 4's components shipped as a versioned package (CSS + web components) consumed by rung 6 (server-rendered) and a framework app | L# 19, 20 |
| 15 | **Flagship**: a real client or product site designed and built end to end (brief, research, Figma, design system, build, content, launch), operated for three months with field vitals, an accessibility audit, a case study, and a v2 redesign of one section based on real usage | all |

---

## 9. Trials

- **The unstyled trial.** Disable all CSS on your latest build. Can someone complete every task? Fix the markup until they can.
- **The hostile-content trial.** Feed a component library extreme content: empty strings, 400-character names, unbroken URLs, 1 and 10,000 items, square/tall/panoramic images, German and Japanese strings, and RTL. Screenshot every break and fix the class of bug, not the instance.
- **The zoom-and-spacing trial.** 400% zoom plus the WCAG text-spacing bookmarklet on every page of a site. Nothing may be clipped or overlap.
- **The keyboard-only day.** Use your own site for all primary flows with the mouse unplugged. Then do it again with a screen reader and your eyes closed.
- **The forced-colours trial.** Windows High Contrast (or emulation) across the whole site: icons, focus rings, buttons, custom controls, charts.
- **The specificity-war rescue.** Inherit a stylesheet (provided, or from an old project) with `!important`s and IDs. Refactor it into layers with zero visual change, proven by visual-regression diffs.
- **The Bootstrap/jQuery legacy rescue.** Modernise a legacy page to native CSS layout, native elements (`<dialog>`, `<details>`, popover), and modern tokens, with byte and vitals deltas measured.
- **The no-JavaScript trial.** Rebuild an interaction you'd normally script (tabs, accordion, modal, tooltip, carousel, theme switch, form validation UI) with HTML and CSS only. Write down exactly what still needs JavaScript and why.
- **The Outlook trial.** Make a designed email render acceptably in classic Outlook for Windows. Keep a log of every hack.
- **The print trial.** Print a long article, an invoice, and a data table on real paper. Fix every break, orphan, and wasted page.
- **The 50 KB trial.** A complete, beautiful landing page in under 50 KB total transfer (HTML + CSS + fonts + images, excluding one hero image). Document every decision.
- **The constraint trials.** The same page five ways: one font size and weight only; greyscale only; no borders or shadows; no images; one colour plus black and white. Critique which constraints *improved* it.
- **The Figma round-trip.** Get a design from a designer (or a Figma Community file), build it, then send back annotated screenshots of every place the design didn't survive real content, with proposed fixes.
- **The time-box rebuild.** Rebuild your own personal site from scratch in 4 hours, and compare it with the current version.

---

## 10. Read & Reimplement

**Monthly:** read a small, excellent codebase or stylesheet; reimplement one part from notes; diff; write one page.

**Targets:** a modern CSS reset (Josh Comeau's, Andy Bell's) · the Chromium user-agent stylesheet (`html.css`) for one element family · Open Props (tokens as custom properties) · Pico CSS (classless styling of semantic HTML) · Every Layout's primitives · Tailwind v4's generated CSS for one component (layers, `@theme`, utilities) · GOV.UK Frontend components (the accessibility decisions in the code comments) · Radix Colors' scale construction · Style Dictionary's transforms · Utopia's fluid-scale maths · MJML's output for one component · Paged.js's handling of running headers · htmx's attribute processing (for the server-rendered track) · a Codrops demo's CSS and motion code · the CSS of a site you recreated in Section 5.

**Also read, as design documents rather than code:** one CSSWG issue thread a month (container queries, `@scope`, masonry, and `if()` all have fascinating ones), one WHATWG HTML pull request for a new element or attribute, the ARIA APG pattern for a widget you're building, and one design system's contribution and accessibility guidelines.

---

## 11. Prediction Sets

Twice a week, fifteen minutes, ten items. Write the answer, then render. Score in `predictions.md`.

- **Cascade sets:** given several rules across layers, origins, scopes, and specificities, predict the winning value, and name the cascade step that decided it.
- **Specificity sets:** compute specificity triples for selectors using `:is()`, `:where()`, `:not()`, `:has()`, and nesting.
- **Inheritance and keyword sets:** predict the computed value after `inherit`, `initial`, `unset`, `revert`, `revert-layer`, or an invalid `var()`.
- **Box and flow sets:** predict margin collapsing, BFC effects, inline baseline gaps, and percentage resolution.
- **Flex sets:** predict final item sizes (grow and shrink maths by hand), wrapping, and alignment, including `min-width: auto` effects.
- **Grid sets:** predict track sizes, auto-placement results, `auto-fill` vs `auto-fit`, and implicit tracks.
- **Positioning and stacking sets:** predict the containing block, sticky behaviour, and which element paints on top.
- **Responsive sets:** predict what a component looks like at 320 px, 768 px, and in a 300 px container, and at 200% zoom.
- **Accessibility-tree sets:** predict each element's role and accessible name, and what a screen reader announces.
- **Parser sets:** predict the DOM produced by malformed HTML.
- **Visual sets (design eye):** before looking at a critique or test result, predict which of two variants users will find clearer, and why.

Target: above 85% on cascade, flex, grid, and stacking sets before you consider Parts 8–12 internalised; above 80% on accessibility-tree sets before Part 7.

---

## 12. Taste Forge

- **`standards.md`** — your house rules: HTML conventions, the layer order, naming, when a raw value is allowed, your reset, your layout primitives, token tiers, the states every component must have, focus-style rules, motion rules (durations, easings, reduced-motion policy), the browser-support policy, the hostile spec, and what you refuse in review. Each rule cites the bug, trial, or critique that produced it.
- **`tokens/`** — your personal design language as tokens: type pairs and scales, palettes, spacing, radii, shadows, motion. Revise it after every brief. Over a year, it *becomes your style*.
- **`primitives/`** — your own layout-primitive library, refined through use. Your code patterns live here.
- **Swipe file (`swipe/`)** — screenshots and recordings of interfaces, type, colour, and motion you love, each with a note on *why* it works. Weekly additions; monthly review for patterns in what you collect.
- **Critique journal (`critique.md`)** — one screen a day, three sentences: what works, what doesn't, what you'd change. Use the vocabulary (hierarchy, rhythm, contrast, balance, alignment, density, consistency).
- **Redesign club** — monthly, redesign a screen from a product you use, with a written rationale, and ask two people which they prefer and why.
- **Feature of the week** — one new or unfamiliar CSS/HTML feature, a tiny demo, its Baseline status, and its fallback.
- **The deletion pass** — monthly: delete a dependency, a font weight, a colour, a breakpoint, a `z-index`, and an unnecessary `div` from your own site. Measure what changed.
- **Defend a heresy.** Argue properly for: no CSS framework ever, Tailwind for everything, no design system for a small team, BEM over `@scope`, tables for a layout, no dark mode, no animation at all, only system fonts. Then decide with evidence.

---

## 13. Assessment & Graduation

Trained when, with artefacts:
1. Every Section 3 drill passes cold within its time target, validated, axe-clean, with no framework.
2. You can take a screen through the full hostile spec in one 90-minute rep, repeatedly.
3. Prediction accuracy exceeds 85% on cascade, flex, grid, and stacking sets over 100+ items, and 80% on accessibility-tree sets.
4. You have completed at least eight Section 4 from-scratch builds, including the reset, the primitive library, the token pipeline, and the accessible component set.
5. You have 20+ copywork recreations, each with a written diff against the original, and five redesigns with rationale.
6. You have completed at least eight Section 7 briefs with case studies, including one accessibility-critical, one multilingual with RTL, one email, and one award-grade motion brief.
7. A site you built and operate has green field Core Web Vitals at p75, passes a WCAG 2.2 AA audit including a screen-reader pass, and survives RTL, forced colours, 400% zoom, and no-JS for primary tasks.
8. You have shipped a server-rendered application with PRG forms, accessible server-side validation, escaped templates, and security headers.
9. Your design system package is consumed by at least two different kinds of application (server-rendered HTML and a framework app).
10. You have reached rung 4 of the Design-Eye Ladder, and strangers can identify a coherent style across your portfolio.
11. You can explain the cascade, the flex and grid algorithms, stacking contexts, the containing block, and the accessibility tree to a competent engineer from another field in ten minutes each.
12. `standards.md` exists, revised at least five times, and each rule is traceable to an incident, trial, or critique.

---

## 14. Spaced Schedule & Logbook

**Weekly:** Mon D1/D2 drill + prediction set · Tue D3/D4 drill + critique entry · Wed build rung · Thu D5/D6 drill + prediction set · Fri copywork or screen rep · Sat brief (fortnightly), trial, or from-scratch build · Sun forge (swipe file, standards, tokens) + log review.

**Cadence:** weekly, score predictions, re-run one older drill cold, add to the swipe file, and one feature of the week. Monthly, one redesign, the deletion pass, one read-and-reimplement, an unstyled review and a resize-and-break session on your live site, and one `standards.md` revision. Quarterly, re-attempt the belt gate cold, a full audit of your site (accessibility, performance, forced colours, RTL, print), a review of browser release notes, Baseline, and Interop for features you can now ship or fallbacks you can delete, and a Design-Eye rung attempt. Annually, rebuild your personal site from scratch with everything you've learned and write the retrospective.

**Spaced repetition (facts):** the cascade order (all seven steps) · specificity rules for `:is`/`:where`/`:not`/`:has`/nesting · what creates a stacking context · what changes the containing block of `position: fixed` · the sticky failure modes · margin-collapsing rules · `flex` shorthand values · `1fr` = `minmax(auto, 1fr)` · `auto-fill` vs `auto-fit` · the input types and key `autocomplete` tokens · accessible-name precedence · the ARIA rules · WCAG criteria you keep failing (contrast ratios, 1.4.4, 1.4.10, 1.4.12, 2.4.7, 2.4.11, 2.5.8) · compositor-only properties · easing and duration tokens · `@page` and fragmentation properties · email client quirks · HTML auto-escaping contexts · your own tokens.

**Logbook** (`LOG.md`):

```
## 2026-10-02 · Copywork · 85 min · linear.app issue list (desktop + mobile)
Fidelity ~92% at 1440; fluid down to 320 without overflow.
Misses: row height 2px off (they use 1.5rem rows with text-box-trim;
I used padding). Their greys are OKLCH with a slight blue hue —
mine were flat grey and looked dead next to theirs.
Easing on the hover highlight: theirs ~120ms linear-ish; mine 200ms ease — felt sluggish.
Hostile spec: theirs truncates titles without a full-text path; mine keeps
full title in the link's accessible name. Mine wins on RTL (logical props).
Rule → standards.md: neutrals always carry a hue (chroma 0.005–0.015).
Prediction set: 9/10 on grid auto-placement; miss was dense packing order.
```

**Monthly roll-up:** drills at target · prediction accuracy by set type · copywork count and average fidelity · briefs completed · axe violations open on your live site · field vitals at p75 · tokens and standards revisions · Design-Eye rung · one change for next month.

---

## 15. If You Only Have Thirty Days

Two hours a day, six days a week, on one real site you deploy. This plan assumes you can already put a basic page on screen. It targets the understanding and the eye underneath.

| Week | Focus | Outcome |
|---|---|---|
| 1 | L# 0–3, 7, 8; D1, D2, D3 drills daily; parser and cascade prediction sets; Build rung 1 | Semantic, validated, keyboard-complete pages; a reset and layer architecture you can explain; the cascade predicted, not guessed |
| 2 | L# 9–13; D4, D5 drills; all twelve layout primitives; two copywork recreations; Build rung 3 | Flex, grid, and positioning predicted by hand; a fluid, container-query-driven responsive site that survives the hostile spec |
| 3 | L# 14, 15, 18; D6, D10 drills; a style tile; one brief (e.g., #1 or #4); Build rung 4 started | A token set (type, colour in OKLCH, space, elevation) and a component set with every state; Design-Eye rung 2 attempted |
| 4 | L# 16, 17, 22; D7 drills; one motion study; Build rung 6 (server-rendered CRUD) | Micro-interactions and page transitions with reduced-motion support; a deployed server-rendered app with accessible forms; the first case study published |

Then the permanent loop: four drills, two prediction sets, one copywork, one rep or brief, and one forge entry a week, against a site whose field data and accessibility you actually watch.

**If you have twelve weeks instead:** repeat the thirty-day plan, then weeks 5–8 cover L# 4–6, 19–21 (media, SVG, metadata, architecture, the JavaScript boundary, and performance) with Build rungs 5, 7, 8, and 9 and two more briefs. Weeks 9–12 cover L# 23–25 (email, print, resilience, security) with Build rungs 10–13, the Outlook, print, and 50 KB trials, and the Brown belt gate. Start the Flagship (rung 15) in week 12.
