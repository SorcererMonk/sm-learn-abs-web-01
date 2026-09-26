# HTML & CSS → World-Class Designer-Developer of the Web's Presentation Layer
## L1: Coding · A Complete Concept Map: Markup → Cascade → Layout → Type & Colour → Motion → Design → Systems → Taste

> This is the **language** file for HTML and CSS, the two languages every pixel on the web passes through. It covers how markup is parsed into a document and an accessibility tree, how the cascade decides every value, how the layout algorithms (flow, flex, grid, positioning, anchor positioning) resolve sizes, and how typography, colour, effects, and motion are produced. It also covers the visual and interaction design fundamentals a designer-developer needs to make those choices well, how CSS scales into architectures and design systems, and how HTML is produced on the server and delivered to screens, inboxes, printers, and PDFs. It stops where other files take over. JavaScript semantics, TypeScript, and framework mechanics are in `L1-coding-typescript-javascript.md`. The browser as a runtime, rendering strategy, performance budgets, caching, security headers, and delivery are in `L18-cs-web-engineering.md`. Organisation-scale design practice (running a design-system team, research programmes, product design process) is in `L18-cs-design-engineering.md` if you have it. This file still carries every design fundamental you need to build beautiful things alone. The training counterpart is `T1-coding-html-css.md`.
>
> **Currency stamp (September 2026):** HTML is a WHATWG **living standard** and CSS ships as independent modules, not "CSS3" or "CSS4". **Baseline** (newly available vs widely available) is the shared vocabulary for "can I ship this". **Interop 2026** focuses on container style queries, **anchor positioning**, typed `attr()`, `contrast-color()`, the standardised `zoom` property, custom highlights, dialogs and popovers, media pseudo-classes, **scroll-driven animations**, scroll snap, the CSS `shape()` function, and **view transitions**. Expect these to land consistently across engines through the year. Already normal: container size queries, `:has()`, native nesting, `@layer`, subgrid, `oklch()` and relative colour syntax, `color-mix()`, `light-dark()`, `text-wrap: balance`/`pretty`, `@starting-style` and `transition-behavior: allow-discrete`, the Popover API, and `<dialog>`. **`@scope`** reached Baseline Newly Available in late 2025. Same-document view transitions are Baseline; cross-document view transitions still lag in at least one engine. Moving fast, with uneven support: **customisable `<select>`** (`appearance: base-select`), invoker commands (`command`/`commandfor`), `interestfor`, CSS `if()`, custom functions (`@function`), `sibling-index()`/`sibling-count()`, `corner-shape`, `interpolate-size`/`calc-size()`, `reading-flow`, CSS carousels (`::scroll-marker`, `::scroll-button()`), scroll-state container queries, and masonry-style layout (being specified as grid "lanes"). Check Baseline and the release notes before designing around any of these. **WCAG 2.2 AA** is the legal baseline in most markets. The European Accessibility Act has applied since June 2025.

---

## How To Use This Document

**Depth ladder — apply to every bullet:** **L1** Name it · **L2** Use it correctly · **L3** Choose it over alternatives · **L4** Explain the mechanism (what the parser, cascade, or layout algorithm actually does) · **L5** Rebuild a minimal version (a reset, a layout primitive, a component, a design-token pipeline) · **L6** Teach it and critique misuse.

**Tier tags:** **[Core]** every web developer · **[Deep]** senior designer-developer depth · **[Frontier]** new or moving fast.

**Each Part closes with:** *Intuition anchors* · *Mastery checks* · *Build* · *Taste*.

**The HTML/CSS learning loop:**
1. **Write the HTML first, alone, and read it unstyled.** If the document makes sense with no CSS (headings, order, links, forms), the hardest parts of accessibility, SEO, and resilience are already done. CSS is applied to a document. It is not a substitute for one.
2. **Ask "which algorithm is in charge?"** Almost every CSS confusion is an algorithm confusion. Is this element in normal flow, a flex item, a grid item, absolutely positioned, or inside an inline formatting context? Which cascade layer, specificity, and origin produced this value? Name the algorithm before you touch a property.
3. **Live in the inspector.** Use the Computed panel (not the Styles panel) for the value that actually won, the grid and flex overlays, the box-model diagram, "inactive CSS" hints, the accessibility tree, and the Rendering panel's emulations. Guessing at CSS is the slowest way to write it.
4. **Resize everything.** Drag the viewport from 280 px to 2560 px, zoom to 200% and 400%, put in long German words and short Japanese strings, and flip to RTL and forced-colours. A layout that survives this is designed. A layout that only works at 1440 px is a screenshot.
5. **Learn from the specs and from masters.** MDN for reference, the CSS specifications for mechanism (they are more readable than their reputation), and study the CSS of sites and design systems you admire, the way painters copy masters.
6. **Design and build in one loop.** The designer-developer's advantage is that there is no handoff. Sketch, build in the browser, look, critique, and change. The browser is your design tool, and Figma is where you think fast.

**Relationship to the other files:** `L1-coding-typescript-javascript.md` is the language partner for behaviour. `L18-cs-web-engineering.md` Parts 1, 2, 5, 6, and 8 give the engineering context that this file's markup and styling feed into: the rendering pipeline, platform APIs, performance, accessibility process, and SEO. When a topic appears in both, this file owns *authoring* (how to write it correctly and beautifully) and L18 owns *engineering* (how to measure, ship, and operate it).

---

## PART 0 — Orientation, Toolchain & Mental Models [Core]

- What HTML actually is: a **markup language whose specification includes its own parser**. The WHATWG HTML Living Standard defines the elements, their semantics, the DOM they produce, and exactly how every malformed document is recovered. "Invalid HTML still renders" is by design, not luck
- What CSS actually is: a **declarative, rule-based language for assigning values to properties on boxes**, resolved by the cascade and then fed into layout algorithms. You never tell CSS what to do step by step. You state constraints and preferences, and algorithms resolve them. The mindset shift from imperative code is the first real lesson
- The three trees to keep in your head: the **DOM** (what the parser built), the **box tree** (what CSS generates from it: some elements produce no box, some produce several, pseudo-elements add boxes), and the **accessibility tree** (what assistive technology sees, derived from the DOM plus ARIA plus some CSS). Bugs live in the gaps between them
- The pipeline in one line: bytes → tokens → DOM → style (cascade + computed values) → box tree → layout → paint → composite (full mechanics in `L18-cs-web-engineering.md` Part 1)
- How standards happen: WHATWG (HTML, DOM, Fetch, URL), the W3C CSS Working Group (modules at levels: Selectors 4, Color 5, Cascade 6…), browser engines (Blink, WebKit, Gecko), standards positions, origin trials, **Baseline**, the annual **Interop** project, and **caniuse** plus MDN compat tables as the day-to-day lookup
- Toolchain for this file: a code editor with Emmet, a formatter (Prettier or Biome), **Stylelint**, the **Nu HTML Checker** (validator.w3.org/nu), all three browser engines installed (Chrome, Firefox, Safari or a WebKit build via Playwright), the Firefox grid/flex inspectors, a screen reader, a local static server with live reload, and **Figma** (or Penpot) for exploring designs
- Reading the sources that matter: **MDN** first; the CSS specs for mechanism (learn the property "propdef" tables: initial value, applies to, inherited, percentages, computed value, animation type); the HTML spec's element entries (content categories, content model, permitted ARIA); CSS-Tricks almanac and guides; web.dev *Learn HTML* / *Learn CSS* / *Learn Design*
- Where "HTML and CSS" end: they describe documents and presentation. Behaviour is JavaScript, data is the server, and design judgement is yours. But every year the platform moves behaviour into HTML and CSS (dialogs, popovers, invokers, accordions, carousels, scroll animations, view transitions, anchored tooltips), and the modern designer-developer reaches for the declarative version first

**Intuition anchors**
- HTML answers *what is this?* CSS answers *how should it look and where should it go?* When you make HTML answer the second question (a `<table>` for layout, `<br>` for spacing, `<h3>` because it looks right), both languages get worse.
- CSS is not "styling". It is a constraint system with several layout engines inside. Learn the engines and CSS stops being unpredictable.

**Mastery checks**
- Explain the difference between the DOM, the box tree, and the accessibility tree. Give one element that appears in the DOM but not the box tree, and one pseudo-element in the box tree but not the DOM.
- Explain what "Baseline widely available" means and how you'd decide whether to ship a feature without a fallback.
- Read the propdef table for `line-height` on MDN or in the spec, and explain what each row tells you.

**Build**
- A "web-standards lab" repository: a live-reload dev server, Stylelint and a formatter configured, an HTML-validation script, a page that opens in all three engines, and a `NOTES.md` where every surprising behaviour gets a spec citation.

**Taste**
- Learn the platform, not a framework's dialect of it. Tailwind classes, CSS-in-JS APIs, and component-library props all compile down to the same cascade and the same layout algorithms. The person who knows those outlasts every tool.

---

## PART 1 — HTML: The Language, the Parser & the Document [Core → Deep]

- Document anatomy: `<!doctype html>` (and what it switches: **standards mode** vs **quirks** vs **limited-quirks** mode, and the layout differences quirks mode still causes), `<html lang>`, `<head>`, `<body>`, and the elements whose tags are optional (`html`, `head`, `body`, `tbody`, closing `</p>`, `</li>`) because the parser infers them
- Syntax precisely: elements, tags, attributes (quoted, unquoted, boolean attributes where presence means true and `="false"` is still true), character references (`&amp;`, `&lt;`, `&nbsp;`, numeric references), comments, **void elements** (`img`, `input`, `br`, `meta`, `link`, `source`, `hr`, `wbr`, `area`, `col`, `embed`, `track`, `base`), and why `<div />` is not self-closing in HTML (the slash is ignored on non-void elements)
- **The parsing algorithm**: the tokeniser's states, tree construction's insertion modes, implied end tags (`<p><div>` closes the `<p>`), the adoption agency algorithm for misnested formatting tags, **foster parenting** (text inside a `<table>` jumps out before it), `<template>` content as an inert document fragment, and raw-text elements (`script`, `style`, `textarea`, `title`). Why `innerHTML` and the parser can produce DOMs you didn't write
- The DOM that results: nodes (element, text, comment, document, fragment), whitespace text nodes and the inline-block gap they cause, attributes vs properties (`value` attribute vs `.value` property, `class` vs `className`), and IDs creating global variables (history, and a reason to avoid bare-ID reliance)
- Encoding: UTF-8 always, `<meta charset="utf-8">` within the first 1024 bytes, byte-order marks, and mojibake as a server/header problem
- **Global attributes** you must know cold: `id`, `class`, `lang`, `dir`, `title` (and why it is a poor accessibility tool), `hidden` (including `hidden="until-found"` for find-in-page), **`inert`**, `tabindex`, `contenteditable`, `draggable`, `spellcheck`, `translate`, `autofocus`, `inputmode`, `enterkeyhint`, `autocapitalize`, `popover`, `data-*` (and `dataset`), `nonce`, `part`, `slot`, `accesskey` (and why to avoid it), `style` (and why to rarely use it)
- Scripts and styles in the document: `<script>` with `defer`, `async`, `type="module"`, `nomodule` (legacy), import maps, `blocking="render"`; `<style>` and `<link rel="stylesheet">` with `media` (non-matching media still downloads but doesn't block rendering); `<noscript>`; and where each should go (the loading consequences are in `L18-cs-web-engineering.md` Part 5)
- **Validation and conformance**: valid vs conforming vs "works", what the Nu HTML Checker catches (nesting errors, duplicate IDs, missing `alt`, invalid attributes, interactive content inside `<a>` or `<button>`), and why conformance matters for accessibility and the parser's predictability
- Writing HTML well: indentation, attribute order conventions, one element per concern, meaningful class names, and templating hygiene (Part 22)

**Intuition anchors**
- The HTML parser never fails. It always produces *a* DOM. Invalid markup doesn't error, it silently becomes a different document than the one you meant, and that document is what screen readers, CSS selectors, and JavaScript see.
- Boolean attributes are about presence. `disabled="false"` disables.

**Mastery checks**
- Predict the DOM for `<p>Hello <div>world</div></p>` and explain the result.
- Predict what happens to text written directly inside `<table>` before the first `<tr>`, and name the algorithm.
- Explain why there's a gap between two `inline-block` elements and four ways to remove it, with the trade-off of each.
- Name ten void elements and explain what the parser does with `<br></br>`.

**Build**
- A "parser museum": twenty malformed snippets, each with your predicted DOM, the actual DOM from DevTools, and the spec step that explains the difference. Run each through the Nu checker.

**Taste**
- Write HTML that would pass validation even though browsers don't require it. Conformance is cheap and makes the document predictable for every consumer: parsers, crawlers, assistive technology, and the next developer.

---

## PART 2 — HTML Semantics & the Content Model [Core]

- **Content categories and content models**: metadata, flow, sectioning, heading, phrasing, embedded, interactive, and palpable content; the "content model" line in every element's spec entry; **transparent** content models (`<a>`, `<ins>`, `<del>`, `<map>`); and why interactive content cannot nest (no `<button>` in an `<a>`, no `<a>` in an `<a>`)
- **Document structure and landmarks**: `<header>`, `<nav>`, `<main>` (one visible per page), `<aside>`, `<footer>`, `<section>` (needs a heading to be meaningful, becomes a region landmark only when named), `<article>` (self-contained, syndicatable), `<search>`, `<address>` (contact information, not postal addresses in general), and how each maps to an ARIA landmark role
- **Headings**: `<h1>`–`<h6>` as the page's real outline. The "document outline algorithm" was never implemented and has been removed from the spec, so heading *levels* are the structure. One `<h1>` per page is a sound convention, levels shouldn't skip, `<hgroup>` handles subtitle groups, and styling never decides the level
- **Text-level semantics**, each with its real meaning: `<p>`, `<em>` (stress emphasis) vs `<i>` (alternate voice, terms, foreign phrases), `<strong>` (importance) vs `<b>` (attention without importance), `<small>` (side comments, fine print), `<s>` (no longer accurate) vs `<del>`/`<ins>` (edits, with `datetime`), `<u>` (unarticulated annotation, rarely right), `<mark>` (relevance highlight), `<q>` and `<blockquote cite>` with `<cite>` (the title of a work), `<abbr title>`, `<dfn>`, `<code>`, `<kbd>`, `<samp>`, `<var>`, `<pre>`, `<time datetime>` (machine-readable dates and durations), `<data value>`, `<sub>`/`<sup>`, `<br>` (line breaks that belong to content: poems, addresses) vs spacing, `<wbr>`, `<bdi>`/`<bdo>` for bidirectional text, `<ruby>`/`<rt>`/`<rp>` for East Asian annotations
- **Grouping content**: `<ul>`, `<ol>` (`start`, `reversed`, `type`), `<li value>`, `<dl>`/`<dt>`/`<dd>` (key–value groups, allowed to be wrapped in `<div>`), `<figure>`/`<figcaption>` (self-contained content with a caption, not only images), `<hr>` (a thematic break, not a line), `<div>` (the element of last resort, fine when no semantics apply), and `<menu>` (a list of commands, semantically a `<ul>`)
- **Links**: `href` forms (absolute, relative, root-relative, protocol-relative as a legacy trap, `mailto:`, `tel:`, `sms:`, fragment `#id`, **text fragments** `#:~:text=`), `target` and the modern implicit `noopener` for `_blank`, `rel` values (`noopener`, `noreferrer`, `nofollow`, `ugc`, `sponsored`, `me`, `external`, `author`, `license`, `prev`/`next`), `download`, `hreflang`, `type`, `ping`, `referrerpolicy`; links vs buttons (a link *goes somewhere* and changes the URL, a button *does something*); link text that makes sense out of context ("Read the pricing guide", never "click here")
- **Tables for tabular data**: `<caption>`, `<thead>`/`<tbody>`/`<tfoot>`, `<th>` with `scope` (`col`, `row`, `colgroup`, `rowgroup`), `headers`/`id` for complex tables, `<colgroup>`/`<col>` for column styling, `abbr` on headers, sortable-table semantics (`aria-sort`), responsive table strategies (horizontal scroll in a labelled focusable region, reflow to cards, prioritised columns), and never tables for layout (except in email, Part 23)
- **Sectioning in practice**: page shell patterns (header/nav/main/footer), article cards (heading inside, one primary link, "block link" patterns done accessibly), repeated components with landmarks named via `aria-labelledby`, breadcrumbs as `<nav aria-label="Breadcrumb">` with `<ol>` and `aria-current="page"`
- **Microformats and machine-readable semantics**: `h-card`, `h-entry`, and the IndieWeb, alongside JSON-LD (Part 6), as the two ways machines read meaning from your markup

**Intuition anchors**
- Choose elements by *meaning*, then style them freely. Every semantic element is a promise to browsers, assistive technology, search engines, reader modes, and translation tools, and each of them rewards the promise.
- `<div>` and `<span>` are not bad. They are honest about having no meaning. Where meaning exists, they hide it.

**Mastery checks**
- Mark up a news article page (site header, primary navigation, article with byline and publication time, pull quote, figure with caption, related links aside, comments section, footer), explain every element choice, and list the resulting landmarks.
- Explain `<em>` vs `<i>` vs `<strong>` vs `<b>` with a sentence where each is correct.
- Mark up a pricing comparison table with row and column headers that a screen reader announces correctly, and verify it with one.
- Explain why a `<button>` inside an `<a>` is invalid and what users experience.

**Build**
- "Semantics without style": five pages (blog post, recipe, product page, documentation page, dashboard) written in HTML only, validated, navigated with a screen reader by headings and landmarks, then printed with browser default styles. Each must be fully usable unstyled.

**Taste**
- If you can't name what a piece of content *is*, the design isn't finished. Semantic markup forces clarity of content structure, and that clarity shows up in the visual design too.

---

## PART 3 — Forms & Native Interactive Elements [Core → Deep]

- **The form as a protocol**: `<form action method enctype>`, `GET` (idempotent, bookmarkable, search and filters) vs `POST` (mutations), `application/x-www-form-urlencoded` vs `multipart/form-data` (files) vs `text/plain`, what is submitted (`name` attributes on successful controls only; disabled controls are excluded; unchecked checkboxes send nothing), submitter buttons with `name`/`value`, `formaction`/`formmethod`/`formnovalidate` overrides, the `form` attribute to associate controls outside the element, and the form working with **no JavaScript at all**
- **Every input type and what it buys you**: `text`, `email`, `url`, `tel`, `password`, `number` (and why it is wrong for credit cards, PINs, and postcodes: use `inputmode="numeric"`), `search`, `date`, `time`, `datetime-local`, `month`, `week`, `color`, `range`, `checkbox`, `radio`, `file` (`accept`, `multiple`, `capture`), `hidden`, `submit`/`reset`/`button`/`image`. Mobile keyboards, autofill, validation, and accessibility all come from choosing the right one
- `<label>` (explicit `for`/`id` and implicit wrapping; bigger click target; the accessible name), `<fieldset>`/`<legend>` for groups (radio groups, address blocks), `<fieldset disabled>`, `<select>` with `<option>`/`<optgroup>` and `multiple`, `<textarea>` (with `field-sizing: content` for auto-grow **[Frontier]**), `<datalist>` for suggestions, `<output for>`, `<meter>` (a gauge within a known range) vs `<progress>` (task completion, indeterminate when valueless), `<button type>` (the default is `submit`, a classic bug inside forms)
- **Autofill and `autocomplete` tokens**: `name`, `given-name`, `email`, `tel`, `street-address`, `postal-code`, `country`, `cc-number`, `cc-exp`, `one-time-code`, `username`, `current-password`, `new-password`, `webauthn`; section and shipping/billing prefixes. The single biggest improvement to form completion, and a WCAG 2.2 criterion (1.3.5)
- **Constraint validation**: `required`, `pattern`, `min`/`max`/`step`, `minlength`/`maxlength`, type-based validation, the Constraint Validation API (`validity`, `checkValidity`, `reportValidity`, `setCustomValidity`), `novalidate` for custom UI, `:invalid` vs **`:user-invalid`** (only after interaction, which fixes the "red before typing" problem), `:user-valid`, `:placeholder-shown`, `:required`, `:in-range`, and why client validation is UX only (the server re-validates, Part 22)
- **Accessible form patterns**: visible labels (placeholder is not a label), hint text via `aria-describedby`, required indication in text not just colour or an asterisk, inline errors tied to fields, an **error summary** with links that move focus to fields, `aria-invalid`, not disabling submit buttons (explain instead), sensible tab order, grouping, one question per page for complex flows (the GOV.UK pattern), and redundant-entry avoidance (WCAG 3.3.7)
- **Native interactive elements**, the declarative components the platform now ships:
  - **`<details>`/`<summary>`**: disclosure with no JavaScript, the `open` attribute, exclusive accordions via a shared **`name`**, styling `::marker` and `::details-content`, find-in-page auto-expansion
  - **`<dialog>`**: `show()` vs `showModal()`, the **top layer**, `::backdrop`, focus handling and inertness of the rest of the page when modal, `<form method="dialog">` returning values, `closedby` for light-dismiss behaviour **[Frontier]**, and why `<dialog>` replaced hand-rolled modals
  - **The Popover API**: `popover` (`auto`, `manual`, `hint`), `popovertarget` and `popovertargetaction`, light dismiss, the top layer without modality, `:popover-open`, entry/exit animation with `@starting-style` and `allow-discrete`, and pairing with **anchor positioning** (Part 10) for menus and tooltips
  - **Invoker commands** **[Frontier]**: `commandfor` + `command` (`show-modal`, `close`, `request-close`, `toggle-popover`, custom `--commands`) for declarative button → element wiring, and **`interestfor`** for hover/focus-triggered UI such as tooltips and previews
  - **Customisable `<select>`** **[Frontier]**: `appearance: base-select`, `::picker(select)`, `<selectedcontent>`, rich option content, and the progressive-enhancement story for engines without it
- Styling form controls: `appearance: none` and rebuilding with care, `accent-color` for the quick win, `color-scheme` so native controls follow dark mode, `::file-selector-button`, `::placeholder`, custom checkboxes and radios that keep the native input (visually replaced, not removed), focus styles that meet WCAG 2.4.11/2.4.13, and minimum target sizes (WCAG 2.5.8: 24×24 CSS px)
- File uploads in HTML: `accept`, `multiple`, drag-and-drop as enhancement, previews, and the server side (Part 22)

**Intuition anchors**
- A form is an API that browsers, password managers, autofill, and assistive technology already know how to use. Every custom control you build instead has to re-earn that trust one behaviour at a time.
- The platform now ships dialogs, popovers, accordions, and (soon everywhere) selects. Your job has shifted from building them to styling them.

**Mastery checks**
- Build a checkout address form with correct types, `autocomplete` tokens, labels, grouping, and validation. Complete it using only browser autofill and a keyboard.
- Explain `:invalid` vs `:user-invalid` and the UX problem the latter solves.
- Explain what `showModal()` does to the rest of the page that `show()` doesn't, and what the top layer is.
- Explain why `type="number"` is wrong for a credit-card field and what to use instead.

**Build**
- A "native components gallery": an exclusive accordion, a modal dialog with a form that returns a value, a popover menu anchored to its button, a tooltip with `interestfor` (or a fallback), a customised `<select>` with a progressive-enhancement fallback, and a multi-step form with an error summary. Zero lines of JavaScript where the platform allows it, and a note on each place where it didn't.

**Taste**
- Reach for the native element first, style it second, and replace it last. The platform's version gets keyboard support, accessibility, mobile behaviour, and future improvements for free, and yours never will.

---

## PART 4 — Media, Embeds & Responsive Images [Core → Deep]

- **`<img>` properly**: `alt` as the text alternative (describe function and content in context; empty `alt=""` for purely decorative images; never the filename; complex images get a longer description nearby), `width`/`height` attributes so the browser reserves the **aspect ratio** and avoids layout shift, `loading="lazy"` below the fold (and *never* on the LCP image), `decoding="async"`, `fetchpriority="high"` for the hero, `referrerpolicy`, `crossorigin`
- **Responsive images**: resolution switching with `srcset` + `x` descriptors (fixed-size images on dense screens), width switching with `srcset` + `w` descriptors + **`sizes`** (the layout width, which you must describe honestly; `sizes="auto"` with lazy images **[Frontier]**), **`<picture>`** for *art direction* (different crops per breakpoint via `media`) and *format switching* (`type="image/avif"` → WebP → JPEG). How the browser actually picks a candidate
- **Image formats and when**: AVIF (best compression, slower encode), WebP (universal fallback), JPEG (photos, progressive), PNG (lossless, transparency, screenshots), **SVG** (vectors, icons, illustrations: Part 5), GIF (never, use video), JPEG XL (under investigation, check support); quality settings, chroma subsampling, and a pipeline that generates variants automatically (build step or image CDN)
- CSS images: `background-image` vs content images (content goes in HTML with `alt`, decoration goes in CSS), `image-set()`, `object-fit` (`cover`, `contain`) and `object-position` for cropping in layout, `aspect-ratio` for boxes, placeholder strategies (dominant colour, blur-up LQIP, BlurHash/ThumbHash, `content-visibility`)
- **`<video>` and `<audio>`**: `controls`, `autoplay` (only with `muted`, and `playsinline` for iOS), `loop`, `poster`, `preload`, multiple `<source>` formats (MP4/H.264 baseline, WebM/VP9/AV1), `<track kind="captions|subtitles|descriptions|chapters">` with **WebVTT**, `::cue` styling, background videos done responsibly (a pause control per WCAG 2.2.2, reduced-motion, data cost), replacing GIFs with muted looping video, and adaptive streaming (HLS/DASH) as a library concern
- Media accessibility: captions for all prerecorded audio in video (WCAG 1.2.2), transcripts, audio description, no autoplaying audio, and the media pseudo-classes (`:playing`, `:paused`, `:muted`, `:buffering`) for styling states **[Frontier]**
- **`<iframe>`**: `loading="lazy"`, `title` (required for accessibility), **`sandbox`** with explicit permission tokens (`allow-scripts`, `allow-same-origin` and the danger of combining them), `allow` (the Permissions Policy for the frame), `srcdoc`, `referrerpolicy`, responsive embeds with `aspect-ratio`, and **facades** for heavy third-party embeds (YouTube, maps: a static preview that loads the real embed on click)
- Other embeds: `<object>`/`<embed>` (legacy), `<map>`/`<area>` image maps (rare, accessible when used correctly), `<canvas>` (Part 5), `<math>` (**MathML Core**, now in every engine), and `<portal>`/`<fencedframe>` as frontier curiosities
- Favicons and app icons: SVG favicon with dark-mode media query inside, `apple-touch-icon`, the manifest's maskable icons, and the minimal set that actually matters (Part 6)

**Intuition anchors**
- `srcset` and `sizes` are you *telling the browser the layout* before CSS has loaded, so it can choose the right file early. If `sizes` lies, the browser downloads the wrong image, however good your intentions.
- Alt text is not a description of pixels. It is the text that would replace the image if images didn't exist. Ask "what would I write here instead?"

**Mastery checks**
- Write the `<picture>` markup for a hero that is a wide crop on desktop and a square crop on mobile, served as AVIF with WebP and JPEG fallbacks, with correct `sizes`, dimensions, and priority.
- Write alt text for the same image used three ways: a product photo, a decorative divider, and a chart in a report.
- Explain why lazy-loading the hero image hurts LCP.
- Explain what `sandbox="allow-scripts allow-same-origin"` effectively grants to same-origin content.

**Build**
- A media-heavy photo essay: art-directed responsive images generated by a build script, a captioned video with a transcript, a YouTube facade, zero layout shift under throttling, and alt text reviewed by reading the page with images turned off.

**Taste**
- Images are usually the heaviest and most emotional part of a page. Treat them as design (crop, art direction, quality) and as engineering (format, size, priority) at the same time. Most sites fail at one or the other.

---

## PART 5 — SVG, Canvas & Graphics on the Web [Core → Deep]

- **SVG as a language**: an XML vocabulary embedded in HTML; the **coordinate system** (user units), **`viewBox`** (the camera) vs `width`/`height` (the viewport), **`preserveAspectRatio`** (`xMidYMid meet`/`slice`), and why understanding the viewBox solves most SVG scaling bugs
- Shapes and paths: `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, and **`<path d>`** with its commands (`M`, `L`, `H`, `V`, `C`, `S`, `Q`, `T`, `A`, `Z`, with absolute vs relative casing). Read a path by hand once and icons stop being black boxes
- Painting: `fill`, `stroke`, `stroke-width`, `stroke-linecap`/`linejoin`, `stroke-dasharray`/`dashoffset` (the "line drawing" animation), `vector-effect: non-scaling-stroke`, `paint-order`, `fill-rule`, linear and radial gradients, patterns, markers, `opacity` vs `fill-opacity`
- Structure and reuse: `<g>`, `<defs>`, **`<symbol>` + `<use>`** (icon sprites), `transform` on elements, `<clipPath>`, `<mask>`, and `<foreignObject>`
- **SVG filters**: `feGaussianBlur`, `feColorMatrix`, `feTurbulence` + `feDisplacementMap` (grain, noise, liquid distortion), `feComposite`, `feMorphology`, `feBlend`, `feDropShadow`, filter regions, and using SVG filters from CSS (`filter: url(#grain)`). This is the source of most "how did they do that texture" effects
- SVG text: `<text>`, `<textPath>` (text on a curve), and the accessibility and selection trade-offs vs HTML text
- **Styling and theming SVG with CSS**: presentation attributes vs CSS (CSS wins), **`currentColor`** for icons that inherit text colour, custom properties crossing into inline SVG (but not into `<img src="icon.svg">`), and `<use>` shadow-tree styling limits
- **Ways to include SVG** and their consequences: inline (styleable, scriptable, adds DOM weight), `<img>` (cached, no styling from the page, safer), CSS `background-image` or `mask-image` (icons coloured with `background-color`), `<object>`, and sprite files, with a decision table for icons, logos, illustrations, and charts
- **Accessible SVG**: `role="img"` + `<title>` (+ `<desc>`) or `aria-label` for meaningful graphics, `aria-hidden="true"` for decorative icons next to text, `focusable="false"` (legacy IE), and data visualisations with text alternatives or data tables
- Optimising SVG: SVGO, removing editor metadata, precision rounding, `viewBox` kept (never strip it), and exporting clean SVG from Figma/Illustrator
- **SVG animation**: CSS transitions and animations on SVG properties, stroke-drawing, `transform-box: fill-box` for sane transform origins, SMIL (`<animate>`, `<animateMotion>`) as a legacy option that still works, path morphing (matching point counts; libraries for the rest)
- **Canvas 2D**: an immediate-mode bitmap you draw into with JavaScript (paths, fills, images, text, compositing), device-pixel-ratio scaling for crisp output, `OffscreenCanvas` in workers, and canvas accessibility (a canvas is an image; provide the content elsewhere)
- **Beyond** (literacy, with depth in the TS/JS file and specialist sources): WebGL and **Three.js** / React Three Fiber for 3D, GLSL fragment shaders (a function run per pixel: the basis of gradients, noise, and generative backgrounds), **WebGPU** **[Frontier]**, Lottie and **Rive** for designer-authored vector animation, and Spline for 3D scenes. When each is worth its bytes and main-thread cost
- **Choosing the medium**: HTML+CSS for UI and text, SVG for resolution-independent shapes and charts up to a few thousand elements, Canvas for many thousands of moving objects or pixel manipulation, and WebGL/WebGPU for 3D, shaders, and heavy particle work

**Intuition anchors**
- The `viewBox` is a camera pointed at an infinite canvas. `width`/`height` is the size of the photo you print. Almost every "my SVG is the wrong size/cropped/blurry" bug is a mismatch between the two.
- SVG is retained mode (a DOM you can style and query). Canvas is immediate mode (pixels you paint and forget). Choose based on whether you need to talk to the shapes later.

**Mastery checks**
- Hand-write an SVG icon (a checkmark in a circle) with paths, make it inherit text colour, and make it accessible in two contexts (standalone, and beside a text label).
- Explain `viewBox="0 0 100 50"` with `preserveAspectRatio="xMidYMid slice"` in a 300×300 box.
- Build a grain/noise texture with `feTurbulence` and apply it as an overlay.
- Explain when an inline SVG sprite beats `<img>` icons and when it doesn't.

**Build**
- An icon system and a chart: 20 hand-optimised icons in a `<symbol>` sprite coloured by `currentColor`, plus an accessible SVG line chart generated from data (axes, labels, a data-table alternative, and an animated line-draw that respects reduced motion).

**Taste**
- Learn to read and hand-edit SVG. The designer-developer who can open an exported icon, delete 80% of it, and make it theme-aware owns a superpower that most teams outsource.

---

## PART 6 — The Head, Metadata & Discoverability Markup [Core]

*Search mechanics, crawling, and rendering-strategy consequences are in `L18-cs-web-engineering.md` Part 8. This Part is the markup you write.*

- The minimal correct `<head>`, in order: `<meta charset="utf-8">`, **`<meta name="viewport" content="width=device-width, initial-scale=1">`** (and never `maximum-scale=1`/`user-scalable=no`, which break zoom and WCAG; `viewport-fit=cover` for notches; `interactive-widget=resizes-content` for on-screen keyboards **[Frontier]**), `<title>`, then the critical resource hints, then styles and scripts
- **`<title>` and `<meta name="description">`** as user-facing copy: unique per page, front-loaded with the distinctive part, and read aloud by screen readers on navigation
- **`<link rel>`** vocabulary: `stylesheet`, `icon` (SVG + PNG fallback), `apple-touch-icon`, `manifest`, **`canonical`**, `alternate` (with `hreflang` for translations, `type` for RSS/Atom feeds), `preload` (with correct `as` and `crossorigin` for fonts), `preconnect`, `dns-prefetch`, `modulepreload`, `prefetch`, `me`, `license`, `search` (OpenSearch)
- **`<meta>`** vocabulary: `robots` (`noindex`, `nofollow`, `max-image-preview`), **`color-scheme`** (so the browser paints the right default canvas and form controls before CSS loads), `theme-color` (with `media` for light/dark), `referrer`, `generator` (don't), `format-detection` (iOS phone links), and `http-equiv` (CSP via meta has limits; prefer headers)
- **Social previews**: Open Graph (`og:title`, `og:description`, `og:image` at 1200×630 with `og:image:alt`, `og:url`, `og:type`, `og:site_name`), Twitter/X card tags, per-route generation, and **generating OG images from HTML/CSS** (Satori or headless rendering, Part 23)
- **Structured data**: JSON-LD `<script type="application/ld+json">` with schema.org types (`Article`, `Product`, `BreadcrumbList`, `Organization`, `Person`, `Event`, `FAQPage`, `Recipe`), the honesty rule (markup must match visible content), and validation with Google's Rich Results Test and the Schema Markup Validator
- **Speculation rules** `<script type="speculationrules">` for prefetching and prerendering likely navigations, and the analytics/side-effect caveats of prerendering **[Frontier]**
- The web app manifest (name, icons including maskable, `display`, `theme_color`, `background_color`, `start_url`, shortcuts), with installability details in `L18-cs-web-engineering.md` Part 13
- `lang` on `<html>` (and on inline foreign phrases) for pronunciation, hyphenation, font selection, spell-checking, and translation. `dir` for right-to-left documents
- Head management in frameworks: per-route titles and metas, React 19's hoisting of `<title>`/`<meta>`/`<link>`, and why server-rendered metadata matters for social scrapers that don't run JavaScript

**Intuition anchors**
- The `<head>` is the page's contract with machines: browsers (charset, viewport, colour scheme, hints), crawlers (title, canonical, structured data), and social platforms (Open Graph). Humans never see it, but every one of those machines acts on it before a pixel renders.

**Mastery checks**
- Write the complete `<head>` for a blog post from memory, and justify the order.
- Explain what `<meta name="color-scheme" content="light dark">` changes before any CSS loads.
- Write JSON-LD for a product with price, availability, and reviews, and validate it.
- Explain why `user-scalable=no` is an accessibility failure.

**Build**
- A head-and-metadata generator for a static site: per-page titles, descriptions, canonicals, OG images rendered from an HTML template, JSON-LD per content type, feeds, sitemap, and a test that fails the build when any page is missing required metadata.

**Taste**
- Write titles and descriptions like headlines, because they are what people read in search results, tabs, bookmarks, and share cards. Metadata is copywriting with a strict character limit.

---

## PART 7 — Accessible Markup & the Accessibility Tree [Core → Deep]

*The WCAG framework, testing process, and legal context are in `L18-cs-web-engineering.md` Part 6. This Part is how to author accessible HTML and CSS.*

- **The accessibility tree**: every node's **role**, **name**, **description**, **state**, and **value**; how browsers compute it from HTML semantics, ARIA, and some CSS (`display: none` and `visibility: hidden` remove nodes; `content` in pseudo-elements contributes to names; `display: contents` historically dropped roles from some elements; list styling removal drops list semantics in Safari unless `role="list"`); and how to read it in DevTools
- **Accessible name computation**: the precedence order (`aria-labelledby` → `aria-label` → native label (`<label>`, `alt`, `<caption>`, `<legend>`, `<figcaption>`) → content → `title`); why icon-only buttons need a name; and "label in name" (WCAG 2.5.3: the visible text must be part of the accessible name)
- **The rules of ARIA**: (1) don't use ARIA if a native element exists; (2) don't change native semantics unless you must; (3) every interactive ARIA control must be keyboard-operable; (4) don't put `role="presentation"`/`aria-hidden="true"` on focusable elements; (5) every interactive element needs an accessible name. "No ARIA is better than bad ARIA"
- ARIA vocabulary that is genuinely needed: `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-expanded`, `aria-controls`, `aria-current`, `aria-pressed`, `aria-selected`, `aria-checked`, `aria-invalid`, `aria-errormessage`, `aria-live` (`polite`/`assertive`) and `role="status"`/`alert`, `aria-hidden`, `aria-busy`, `aria-haspopup`, `aria-sort`, `role="list"`, `role="region"`; and the widget roles you should mostly get from native elements or headless libraries
- **The ARIA Authoring Practices Guide (APG)** patterns and keyboard models: tabs (arrow keys + roving tabindex), menu button, disclosure navigation (usually better than an ARIA "menu"), combobox, listbox, tree, grid, carousel, dialog, and the rule that site navigation is almost never `role="menu"`
- **Focus and keyboard**: tab order follows DOM order (so CSS reordering with `order`, grid placement, `flex-direction: row-reverse`, or absolute positioning can break it; `reading-flow` **[Frontier]** is the emerging fix), `tabindex="0"` and `"-1"` only, **`:focus-visible`** styles that are clearly visible (WCAG 2.4.7, 2.4.11, 2.4.13), skip links, `inert` for off-screen or background content, focus not obscured by sticky headers (`scroll-padding-top`), and managing focus after dynamic changes
- **Hiding content correctly**, three different intents: hidden from everyone (`hidden`, `display: none`), hidden visually but available to screen readers (the **visually-hidden** utility class: clip-path, 1 px, `overflow: hidden`, never `display: none`), and hidden from assistive technology but visible (`aria-hidden="true"` for decorative duplicates)
- **CSS that affects accessibility**: colour contrast (4.5:1 text, 3:1 large text and UI parts and focus indicators), not using colour alone, `prefers-reduced-motion`, **`forced-colors: active`** (Windows High Contrast: system colours, borders reappear, background images vanish, `forced-color-adjust`), `prefers-contrast`, text-spacing overrides (WCAG 1.4.12: layouts must survive increased line, letter, word, and paragraph spacing), **reflow at 320 CSS px** (1.4.10), **resize text to 200%** (1.4.4) and why `px` font sizes and `vw`-only fluid type fail it, `content` alt text syntax (`content: "★" / "Rating"`), and hover-revealed content that is dismissible, hoverable, and persistent (1.4.13)
- Target size (2.5.8: 24×24 CSS px minimum, 44×44 as the comfortable norm), pointer cancellation, dragging alternatives (2.5.7), and consistent help (3.2.6)
- Dynamic content: live regions that exist in the DOM *before* content changes, status messages (4.1.3), loading states with `aria-busy`, and announcing SPA navigation
- Testing your markup: axe DevTools, the DevTools accessibility pane and full-page accessibility tree, **a real screen reader** (VoiceOver with rotor, NVDA with browse mode, TalkBack), keyboard-only passes, forced-colors emulation, and zoom to 400%

**Intuition anchors**
- You are always shipping two interfaces: the visual one and the accessibility tree. Semantic HTML writes the second one for you. Every `<div>` with a click handler leaves a hole in it.
- ARIA changes what assistive technology is *told*, never what the browser *does*. `role="button"` doesn't add keyboard support. It adds a promise you now have to keep.

**Mastery checks**
- Compute the accessible name of five elements by hand (an icon button with `aria-label`, a link with an image, an input with both `<label>` and `aria-labelledby`, a `<figure>`, a `<fieldset>`), then check them in DevTools.
- Explain why removing list styles in Safari can remove list semantics, and the fix.
- Build a visually-hidden class, explain each declaration, and explain why `display: none` is wrong for it.
- Explain three ways CSS layout can make keyboard order diverge from visual order.

**Build**
- A "tabs, disclosure, and dialog" trio, built first with native elements where possible and then as custom APG-conformant widgets, each tested with a screen reader and keyboard, with an accessibility-tree screenshot of each state.

**Taste**
- Design focus states as deliberately as hover states. They are the hover state for everyone not using a mouse, and a visible, beautiful focus ring is a mark of craft.

---

## PART 8 — CSS Core: The Cascade, Inheritance, Values & Custom Properties [Core → Deep]

- Anatomy: rules, selectors, declaration blocks, declarations, properties, values, at-rules, comments; shorthand vs longhand (and how shorthands silently reset longhands you didn't mention: `background` resets `background-size`, `font` resets `line-height`); invalid declarations are dropped individually (the basis of fallback-by-repetition)
- **The cascade, in order**: (1) **origin and importance** (user-agent → user → author for normal declarations; reversed for `!important`; transitions and animations have their own positions), (2) **context** (shadow DOM encapsulation), (3) **element-attached styles** (`style` attribute), (4) **cascade layers**, (5) **specificity**, (6) **scope proximity** (`@scope`), (7) **order of appearance**. Most people only know steps 5 and 7, and that is why CSS feels arbitrary to them
- **Specificity** exactly: the (ID, CLASS, TYPE) triple; attributes and pseudo-classes count as classes; pseudo-elements as types; `*` and combinators count zero; `:is()`/`:not()`/`:has()` take their most specific argument; **`:where()` is always zero** (the tool for low-specificity defaults); inline styles sit above all selectors; `!important` jumps origins, it doesn't add specificity; and nesting behaves like `:is()`
- **`@layer`**: declaring order up front (`@layer reset, base, components, utilities;`), anonymous vs named layers, nested layers, `@import url() layer(x)` to put third-party CSS in a low layer, **unlayered styles beat all layered styles** (for normal declarations), `!important` reverses layer order (so resets can protect themselves), and `revert-layer`. Layers turn specificity wars into an explicit, reviewable ordering
- **Inheritance**: which properties inherit (mostly text-related: `color`, `font-*`, `line-height`, `letter-spacing`, `text-align`, `visibility`, `cursor`, custom properties) and which don't (box model, backgrounds, borders, layout); the explicit keywords **`inherit`**, **`initial`** (the spec initial, not the browser default, e.g. `display: initial` is `inline`), **`unset`**, **`revert`** (back to the user-agent style), **`revert-layer`**; and `all: unset`/`all: revert` for component resets
- **The value pipeline**: declared → cascaded → specified → **computed** (relative units resolved where possible, keywords resolved, what inherits) → **used** (after layout: percentages against real sizes) → actual (rounded to device pixels). `getComputedStyle` returns resolved values, a historical mix of computed and used values
- **Units**: absolute (`px` as the reference pixel of 1/96 inch, which is not a device pixel), font-relative (`em` compounding, `rem` from the root, `ch`, `ex`, `cap`, `ic`, `lh`, `rlh`), viewport (`vw`/`vh`, and the mobile-address-bar-aware **`svh`/`lvh`/`dvh`**, `vi`/`vb`, `vmin`/`vmax`), **container units** (`cqi`, `cqb`, `cqw`, `cqh`, `cqmin`, `cqmax`), percentages (and what each property's percentage resolves against: padding and margin percentages resolve against the *containing block's width*, even vertically), `fr`, angles (`deg`, `turn`, `rad`), time, resolution (`dppx`, `x`)
- **Math and functions**: `calc()` (mixing units; whitespace rules around `+`/`-`), **`min()`/`max()`/`clamp()`**, stepped values (`round()`, `mod()`, `rem()`), `abs()`/`sign()`, trigonometry (`sin()`, `cos()`, `atan2()`: circular layouts without JavaScript), `pow()`/`sqrt()`/`hypot()`/`log()`/`exp()` (modular type scales in pure CSS), `var()`, `env()` (safe-area insets, keyboard insets), typed **`attr()`** **[Frontier]**, `progress()` **[Frontier]**, `sibling-index()`/`sibling-count()` for staggering **[Frontier]**, and `calc-size()` **[Frontier]**
- **Custom properties** in depth: they are cascaded and inherited like any property, resolved at computed-value time, and scoped to the element tree (not global variables); `var(--x, fallback)`; the **guaranteed-invalid value**; **invalid at computed-value time** (a bad `var()` makes the property `unset`, it doesn't fall back to the previous declaration); using them as component APIs and theme hooks; changing them from JavaScript (`style.setProperty`); and the performance note that changing a variable on `:root` restyles everything that depends on it
- **`@property`**: registering a custom property with a `syntax` (`<length>`, `<color>`, `<angle>`, `<percentage>`, `<number>`, `*`), `inherits`, and `initial-value`. It makes the property **animatable and interpolable** (animated gradients, conic progress rings), type-checked, and optionally non-inheriting (a performance win for deep trees)
- **Conditional CSS**: `@media`, `@supports` (including `selector()` and `font-tech()`), `@container` (Part 13), CSS `if()` with `style()`, `media()`, and `supports()` tests **[Frontier]**, and custom functions via `@function` **[Frontier]**. Also the retired hacks these replace (the "space toggle" custom-property trick, `@supports` negation workarounds)
- The at-rule inventory: `@charset`, `@import` (render-blocking waterfalls, so prefer `<link>` or bundling), `@namespace`, `@media`, `@supports`, `@container`, `@layer`, `@scope`, `@font-face`, `@font-feature-values`, `@font-palette-values`, `@keyframes`, `@property`, `@counter-style`, `@page`, `@starting-style`, `@view-transition`, `@position-try`, `@function`
- Counters and generated content: `counter-reset`, `counter-increment`, `counter()`/`counters()`, `@counter-style` for custom list markers (in any language or symbol system), `content` with strings, `attr()`, `open-quote`, images, and alt text
- **Resets and defaults**: what the user-agent stylesheet does (read it once: Chromium's `html.css`), normalize.css's history, the **modern reset** (box-sizing inheritance, removing default margins deliberately, `img { display: block; max-width: 100% }`, form elements inheriting fonts, `text-wrap: pretty` on paragraphs, reduced-motion defaults), and why a reset lives in the lowest layer

**Intuition anchors**
- The cascade is a sorting algorithm. For each property on each element, gather every declaration that applies, sort by origin → context → style attribute → layer → specificity → proximity → order, and take the first. Nothing else happens.
- Custom properties are not Sass variables. Sass variables are replaced at build time. Custom properties live in the cascade, inherit through the DOM, and change at runtime, which is why they can theme, animate, and respond to context.

**Mastery checks**
- Compute the specificity of ten selectors, including `:is(#a, .b) p`, `:where(.x) .y`, and `a:not(.c, #d)`.
- Explain why a rule in an unlayered stylesheet beats a more specific rule inside `@layer components`, and design a layer order for reset, third-party, base, components, utilities, and overrides.
- Explain "invalid at computed-value time" with an example where the fallback you expected doesn't happen.
- Explain the difference between `initial`, `unset`, `revert`, and `revert-layer` on `display` for a `<div>`.
- Explain why `padding-top: 50%` produces a box whose height depends on its width.

**Build**
- Your own reset + base layer, written from scratch and documented line by line with the bug each line prevents, followed by a "cascade lab" page that demonstrates each cascade step winning over the next.

**Taste**
- Keep specificity flat and ordering explicit: classes and `:where()` for almost everything, layers for ordering, and IDs and `!important` essentially never in author CSS. The best CSS codebases are the ones where you can predict the winner by reading.

---

## PART 9 — Selectors, Nesting & Scoping [Core → Deep]

- **Basic selectors**: type, class, ID, universal, and **attribute selectors** (`[attr]`, `=`, `~=`, `|=`, `^=`, `$=`, `*=`, with `i`/`s` case flags). Attribute selectors on `aria-*` and `data-*` are an excellent way to style state (`[aria-expanded="true"]`, `[data-variant="primary"]`)
- **Combinators**: descendant (space), child (`>`), next-sibling (`+`), subsequent-sibling (`~`), and the column combinator (`||`, rare). Selectors are matched **right to left** by engines, which is why the rightmost part (the "key selector") matters for performance in huge DOMs
- **Structural pseudo-classes**: `:root`, `:empty`, `:first-child`/`:last-child`/`:only-child`, `:nth-child(An+B [of S])` (the `of S` filter is powerful), `:nth-last-child`, `:nth-of-type` family, and quantity queries (`li:nth-last-child(n+5)`, "style when there are five or more")
- **Logical pseudo-classes**: `:is()` (forgiving list, specificity of the highest argument), **`:where()`** (zero specificity), `:not()` (complex selectors allowed now), and **`:has()`**, the "parent selector" and far more: relational, quantity, and sibling-lookahead styling (`form:has(:user-invalid)`, `.card:has(img)`, `h2:has(+ p)`, `body:has(dialog[open])` for scroll locking) with its invalidation-cost caveats in huge, frequently mutating DOMs
- **User-action pseudo-classes**: `:hover` (and gating it with `@media (hover: hover)` so touch devices don't get sticky hovers), `:active`, `:focus`, **`:focus-visible`**, **`:focus-within`**, `:target`, `:visited` (and its privacy restrictions: only colour properties apply)
- **Input and state pseudo-classes**: `:checked`, `:indeterminate`, `:default`, `:disabled`/`:enabled`, `:read-only`/`:read-write`, `:required`/`:optional`, `:valid`/`:invalid`, **`:user-valid`/`:user-invalid`**, `:in-range`/`:out-of-range`, `:placeholder-shown`, `:autofill`, `:open` (details, dialog, select), `:popover-open`, `:modal`, `:fullscreen`, `:picture-in-picture`, media states (`:playing`, `:paused`, `:muted`), `:defined` (custom elements), `:state()` (custom element states), `:dir()`, `:lang()`, `:any-link`, `:link`, `:local-link` **[Frontier]**, `:active-view-transition`
- **Pseudo-elements**: `::before`/`::after` (need `content`; not on replaced elements like `<img>` or `<input>`), `::marker`, `::placeholder`, `::selection`, `::first-line`, `::first-letter` (and `initial-letter` for drop caps), `::backdrop`, `::file-selector-button`, `::cue`, `::details-content`, `::picker()`, `::scroll-marker`/`::scroll-button()` **[Frontier]**, `::target-text`, `::spelling-error`/`::grammar-error`, the **`::highlight()`** pseudo-element with the **Custom Highlight API** (styling arbitrary text ranges for search results or syntax colouring without wrapping spans), and the `::view-transition-*` tree (Part 17)
- **Shadow DOM selectors**: `:host`, `:host()`, `:host-context()` (not universally supported, so avoid it), `::slotted()` (top-level slotted nodes only), and `::part()` for exposing styling hooks (Part 20)
- **Native CSS nesting**: `&` and its meaning, nesting without `&` for descendant rules, nested at-rules (`@media` inside a rule), the rule that nested selectors behave like `:is()` for specificity (a surprise with IDs in lists), and when nesting harms readability (keep it to two or three levels)
- **`@scope`**: `@scope (.card) { … }` for proximity-based styling, the **donut scope** `@scope (.card) to (.card-content)` to stop styles leaking into slotted or nested content, `:scope` inside, scope proximity as a cascade step (the nearer scope root wins ties), inline `<style>` scoping to its parent element, and scope as a native alternative to BEM naming or CSS Modules
- Selector performance in practice: rarely the bottleneck compared with layout and paint; the actual costs are huge DOMs, invalidation from `:has()` and sibling combinators on frequently changing subtrees, and universal-selector-heavy rules on every mutation. Measure with DevTools' selector stats before optimising

**Intuition anchors**
- `:has()` turns CSS from "style an element based on its ancestors" into "style an element based on anything related to it". Half of the JavaScript that toggled classes for styling is now a selector.
- `:where()` is how you write defaults that anyone can override with a single class. `:is()` is how you group without repetition, and it quietly raises specificity to the highest argument.

**Mastery checks**
- Write selectors for: a card that has an image, a form containing an invalid field after interaction, a list with more than five items, the label of a checked checkbox, and a heading immediately followed by a paragraph.
- Explain why `.nav a:hover` misbehaves on touch devices and fix it properly.
- Explain donut scope with a component that contains user-authored content.
- Explain the specificity trap when nesting inside a selector list that contains an ID.

**Build**
- A "no-JavaScript interactions" gallery driven only by selectors: a theme switcher via `:has(input:checked)`, a CSS-only tab set with radio inputs (and an honest note on its accessibility limits vs `<details>` or real tabs), form-level validity styling, quantity-aware grids, and a scoped component library using `@scope`.

**Taste**
- Style state through the attributes that already express it (`[aria-expanded]`, `[aria-current]`, `:checked`, `:open`, `:user-invalid`) instead of inventing parallel classes. When the style and the semantics use the same source of truth, they can't disagree.

---

## PART 10 — The Visual Formatting Model: Boxes, Flow, Positioning & Stacking [Core → Deep]

- **The box model**: content, padding, border, margin; `box-sizing: content-box` (the default) vs `border-box` (the sane choice); `outline` (outside the box, no layout effect, with `outline-offset`); how `width: auto` fills the containing block for blocks but shrink-wraps for floats, absolute elements, and inline-blocks
- **`display` as two values**: outer display type (`block`, `inline`, `run-in`) and inner display type (`flow`, `flow-root`, `flex`, `grid`, `table`, `ruby`), plus `list-item`, `contents` (the box disappears, children remain), and `none`. Writing `display: inline flex` makes the model explicit
- **Normal flow**: block formatting contexts (BFCs: what creates them, such as `display: flow-root`, `overflow` other than visible/clip, floats, absolute positioning, flex/grid items, `contain: layout`, and what they do: contain floats, stop margin collapsing through them, and avoid float overlap) and inline formatting contexts (line boxes, the **baseline**, `vertical-align` and the "mysterious gap under images" caused by baseline alignment, the strut, and `line-height` on inline boxes)
- **Margin collapsing** rules: adjacent vertical margins between siblings, a parent and its first/last child (when there's no border, padding, or BFC separating them), and empty blocks. Never horizontally, never in flex or grid, and never through a BFC. Knowing these ends the "why is there space above my header" genre of bug. Modern practice (`gap`, owl selectors `* + *`, stack layouts) avoids relying on collapsing
- **Sizing**: `width`/`height`, `min-*`/`max-*` (which beat `width`/`height`), **logical sizing** (`inline-size`, `block-size`), **intrinsic keywords** (`min-content`, `max-content`, `fit-content`, `fit-content(<length>)`, `stretch` **[Frontier]**), **`aspect-ratio`**, percentage heights needing a definite parent height, and the "`height: 100%` doesn't work" family of bugs
- **Overflow**: `visible`, `hidden`, **`clip`** (no scroll container, so it doesn't break `position: sticky`), `scroll`, `auto`, per-axis overflow and the rule that `visible` pairs are coerced, `overflow-clip-margin`, **scroll containers** and their consequences, `scrollbar-gutter: stable` to prevent layout shift, `scrollbar-width`/`scrollbar-color`, `text-overflow`, `overscroll-behavior` (scroll chaining in modals and drawers)
- **The containing block** (the most important concept most developers never learn): for static and relative elements it's the nearest block container; for `absolute` it's the nearest *positioned* ancestor's padding box; for `fixed` it's the viewport, **unless an ancestor has `transform`, `filter`, `perspective`, `contain: paint/layout`, `backdrop-filter`, or `will-change` on those**, which is why a fixed element suddenly scrolls with its parent
- **Positioning**: `static`, `relative` (offset without affecting flow; establishes a containing block), `absolute` (out of flow), `fixed`, and **`sticky`** (and its five failure modes: an ancestor with `overflow` other than visible/clip, no inset specified, the sticky element being as tall as its container, a flex/grid `align-items: stretch` parent, and a table-parts quirk); inset properties (`inset`, `inset-inline`, `inset-block`); centring with `position: absolute; inset: 0; margin: auto`
- **Anchor positioning** **[Frontier → Baseline-bound]**: `anchor-name`, `position-anchor`, the `anchor()` function in inset properties, `anchor-size()`, **`position-area`** (the 3×3 grid shorthand), `@position-try` and `position-try-fallbacks` (`flip-block`, `flip-inline`) for collision handling, `position-visibility`, implicit anchors from popovers and `interestfor`, and the polyfill for older engines. This replaces Floating UI/Popper for tooltips, menus, and callouts
- **Stacking contexts and `z-index`**: z-index only works on positioned elements (and flex/grid items); **what creates a stacking context** (root, `position` + `z-index`, `opacity < 1`, `transform`, `filter`, `mix-blend-mode`, `isolation: isolate`, `will-change`, `contain: paint/layout`, `container-type: size`, `backdrop-filter`, `mask`, `clip-path`, fixed/sticky positioning); the painting order within a context (backgrounds → negative z → blocks → floats → inlines → z-auto/0 positioned → positive z); why `z-index: 9999` "doesn't work" (it's trapped in a parent's context); `isolation: isolate` as the clean fix; and the **top layer** (dialogs, popovers, fullscreen), which sits above every stacking context
- **Floats** as they are used today: wrapping text around images, `shape-outside` with `shape-margin` for editorial layouts (text wrapping around a circle or an image's alpha channel), clearing, and why floats are no longer a layout system
- **Multi-column layout**: `columns`, `column-width`, `column-count`, `column-gap`, `column-rule`, `column-span: all`, `break-inside: avoid`. It's good for text and lists of cards in magazine layouts, and needs care with reading order on screens
- **Containment**: `contain: layout | paint | size | inline-size | style | content | strict`, what each promise allows the browser to skip, and **`content-visibility: auto`** with `contain-intrinsic-size` for skipping off-screen rendering (Part 21)
- Tables as a layout algorithm: `table-layout: fixed` vs `auto`, `border-collapse`, `border-spacing`, sticky table headers, and `display: table` as a legacy technique
- Writing modes and logical properties as part of the formatting model: `writing-mode` (`horizontal-tb`, `vertical-rl`, `vertical-lr`), `direction`, and why **logical properties** (`margin-inline-start`, `padding-block`, `inset-inline-end`, `border-start-start-radius`) make layouts work in RTL and vertical scripts automatically

**Intuition anchors**
- Every positioned, sized, or stacked element is resolved against *something*: a containing block, a formatting context, or a stacking context. When CSS "ignores" you, find the something.
- `z-index` is not a global number line. It is a number inside a box, and boxes nest. Draw the stacking-context tree and the bug becomes obvious.

**Mastery checks**
- Explain three causes of margin collapse, and three ways to stop it without adding content.
- Debug a `position: sticky` header that doesn't stick. Name every cause you'd check in order.
- Explain why a `position: fixed` modal inside a transformed carousel slide scrolls with the slide.
- Build a tooltip with anchor positioning that flips when it would overflow the viewport, and explain the fallback strategy for engines without support.
- Explain the painting order inside a stacking context and predict which of five overlapping elements is on top.

**Build**
- A "formatting model lab": interactive demos of BFCs, margin collapsing, inline baseline alignment, containing-block resolution, every sticky failure mode, a stacking-context visualiser (outline every context), and an anchor-positioned popover menu with fallbacks, each annotated with the spec rule.

**Taste**
- Stop fighting the flow and use it. Most layouts need no positioning at all, and every `position: absolute` is a small promise that content will never change size. Keep those promises rare.

---

## PART 11 — Flexbox [Core → Deep]

- The model: a **one-dimensional** layout along a **main axis** with a **cross axis**, set by `flex-direction` (`row`, `column`, and the `-reverse` variants, with their accessibility caveat) and `writing-mode`; `flex-wrap` turning one line into several (each line laid out independently)
- **The `flex` shorthand** fully understood: `flex-grow`, `flex-shrink`, `flex-basis`; the common values (`flex: 1` = `1 1 0%`, `flex: auto` = `1 1 auto`, `flex: none` = `0 0 auto`, `flex: initial` = `0 1 auto`); `flex-basis` vs `width` (basis wins in the main axis; `auto` basis falls back to width, then content size)
- **The flex layout algorithm**, at mechanism depth: determine each item's flex base size and hypothetical main size → collect items into lines → **resolve flexible lengths** (distribute positive free space by grow factors, or negative space by *shrink factor × base size*, which is why big items shrink more) → clamp by min/max and redistribute → cross sizes → alignment
- **The automatic minimum size** (`min-width: auto` on flex items resolving to the content's min-content size): the single most common flexbox bug (text refusing to truncate, a `<pre>` blowing out the layout, an image not shrinking). The fix is `min-width: 0` or `overflow: hidden` on the item, and the reason is worth remembering
- **Alignment**: `justify-content` (main axis: `flex-start`, `center`, `space-between`, `space-around`, `space-evenly`, `start`/`end`, `safe`/`unsafe` keywords to avoid data loss on overflow), `align-items` and `align-self` (cross axis: `stretch` the default, `baseline`, `first baseline`/`last baseline`), `align-content` (multi-line), and **auto margins** (`margin-inline-start: auto` pushes an item to the end, the cleanest "push the last nav item right" technique)
- **`gap`** (row and column) instead of margins on children
- `order` and its accessibility cost (visual order ≠ DOM order ≠ focus order, WCAG 1.3.2 and 2.4.3), and `reading-flow: flex-visual` **[Frontier]**
- Flexbox patterns worth writing from memory: navigation bars, media objects (image + text), centred content, sticky footers (`min-height: 100dvh` column flex with `flex: 1` main), input groups (input + button), equal-height cards, "cluster" wrapping tag lists, a sidebar that wraps below a content threshold (the Every Layout **Sidebar**), and a switcher (horizontal → vertical at a container width, without media queries, using `flex-basis: calc((threshold - 100%) * 999)`)
- When flexbox is the wrong tool: two-dimensional alignment (use grid), consistent column tracks across rows (grid), and "grid-like" wrapping where the last row should align with the others (grid with `auto-fill`)
- Flexbox in other engines: **Yoga** (React Native's flexbox subset, different defaults: `flex-direction: column`, `flex-shrink: 0`) and Figma's **auto layout** (flexbox with designer vocabulary: hug = `fit-content`, fill = `flex: 1`, fixed), which makes design-to-code translation almost mechanical

**Intuition anchors**
- Flexbox is *content-out*: items say how big they want to be, and the container negotiates. Grid is *layout-in*: the container defines tracks, and items are placed into them. Pick the one that matches who should be in charge.
- When a flex item refuses to shrink, it isn't flexbox being stubborn. It's `min-width: auto` protecting content from being crushed. Decide whether the content may be crushed, then say so with `min-width: 0`.

**Mastery checks**
- Given three items with bases 100/200/300 px and `flex-shrink: 1` in a 400 px container, compute the final sizes by hand, then verify.
- Explain why a long URL inside a flex item overflows its container, and fix it two ways.
- Build a responsive "switcher" that goes vertical below a container width without any media or container queries, and explain the math.
- Explain the difference between `align-items`, `align-content`, and `justify-content` in a wrapping flex container.

**Build**
- A flexbox pattern library: nav bar, media object, input group, cluster, sidebar, switcher, sticky footer, and card footers pinned to the bottom, each resilient to long content, RTL, and 200% zoom, with a Figma auto-layout equivalent side by side.

**Taste**
- Let content decide sizes wherever possible. Fixed widths on flex items are usually a sign you wanted grid, or that you haven't decided what should happen when the content changes.

---

## PART 12 — Grid, Subgrid & Masonry [Core → Deep]

- The model: **two-dimensional** layout where the container defines **tracks** (rows and columns), lines, cells, and areas, and items are **placed** onto that structure, automatically or explicitly
- **Track sizing**: fixed lengths, percentages, **`fr`** (a share of the *remaining* space), `auto`, `min-content`, `max-content`, `fit-content()`, **`minmax(min, max)`**, and `repeat()`. The trap: `1fr` means `minmax(auto, 1fr)`, so long content blows out a column. The fix is **`minmax(0, 1fr)`**
- **Responsive without media queries**: `repeat(auto-fill, minmax(min(100%, 16rem), 1fr))` vs **`auto-fit`** (auto-fit collapses empty tracks so items stretch; auto-fill keeps them), and the `min(100%, …)` guard against overflow on narrow screens
- **Placement**: line numbers (including negative numbers from the end), `span`, **named lines** (`[content-start]`), **`grid-template-areas`** (ASCII-art layouts that double as documentation), `grid-area`, implicit tracks (`grid-auto-rows`, `grid-auto-columns`), `grid-auto-flow` (`row`, `column`, `dense`, and the reading-order cost of `dense`)
- **Overlap and layering**: placing several items in the same cell (hero text over an image without `position: absolute`), `z-index` on grid items, and the "stack" pattern `grid-template-areas: "stack"` for overlays
- **Alignment** in two dimensions: `justify-items`/`align-items`/`place-items`, `justify-self`/`align-self`, `justify-content`/`align-content` for the whole grid, and `gap`
- **Subgrid**: `grid-template-columns: subgrid` / `rows: subgrid` so nested components align to the parent's tracks (card headers, bodies, and footers aligned across a row of cards; form labels and inputs aligned across fieldsets), line names inheritance, and gaps in subgrids
- **The "full-bleed" layout**: named lines like `[full-start] minmax(1rem, 1fr) [content-start] minmax(0, 65ch) [content-end] minmax(1rem, 1fr) [full-end]`, so any child can break out to full width. It's the modern layout for articles and marketing pages
- **The grid sizing algorithm** at mechanism depth: resolve intrinsic track sizes (items spanning one track first, then spanning items), maximise tracks, expand flexible (`fr`) tracks, stretch `auto` tracks, and why percentage and intrinsic sizes interact surprisingly
- **Masonry** **[Frontier]**: the long-running specification debate (a grid mode vs a separate display type), the resolution toward "grid lanes", what shipped where, and today's fallbacks (CSS columns for simple cases, grid with `dense` for approximations, JavaScript for true masonry)
- Grid for page layout vs component layout: macro layouts (header/sidebar/main/footer via areas), component internals (card, form row, dashboard tile), and 12-column design grids translated into CSS with named lines instead of utility classes
- Grid inspection: the Firefox and Chrome grid overlays (line numbers, names, area names, track sizes). Use them constantly
- Accessibility: visual placement doesn't change reading or focus order, so keep DOM order meaningful and use placement for presentation only

**Intuition anchors**
- Grid is a spreadsheet you draw on, then drop content into. If you find yourself doing arithmetic on widths, you probably wanted `fr`, `minmax()`, or named lines.
- Subgrid is how components agree on alignment without knowing about each other: the parent owns the tracks, and the children borrow them.

**Mastery checks**
- Build a classic "holy grail" layout with `grid-template-areas` that reflows to a single column on narrow containers, and explain every track size.
- Explain `auto-fill` vs `auto-fit` with a case where the difference is visible.
- Explain why a column containing a long code block overflows with `1fr` and not with `minmax(0, 1fr)`.
- Build a row of cards whose titles, bodies, and buttons align across cards regardless of content length, using subgrid.
- Explain the full-bleed named-line layout and let one image break out to full width.

**Build**
- A layout portfolio: an editorial article with full-bleed breakouts, a magazine cover with overlapping type and imagery, a dashboard with named areas, a pricing section with subgrid-aligned cards, a photo wall (masonry fallback strategy), and a 12-column marketing grid. Each must be resilient to content changes and verified with the grid inspector.

**Taste**
- Design the grid first, then place content. Strong layouts, in print and on the web, come from a few consistent tracks used with discipline, not from each component inventing its own spacing.

---

## PART 13 — Responsive, Intrinsic & Fluid Design [Core → Deep]

- The philosophy arc: fixed-width → fluid → **responsive** (Ethan Marcotte, 2010: fluid grids, flexible images, media queries) → mobile-first → **intrinsic web design** (Jen Simmons: content-driven sizing with grid, flex, `minmax`, and `min()`/`max()`) → **component-responsive** (container queries). The modern goal is *layouts that respond to the space they're given, not the device they're on*
- **Media queries** properly: range syntax (`@media (width >= 48rem)`), breakpoints in `em`/`rem` so they respect user font size, breakpoints set **by content** (where the design breaks) rather than by device list, mobile-first `min-width` layering, and the media features that matter beyond width: `hover`, `pointer`, `any-hover`, `any-pointer`, `orientation`, `resolution`, **`prefers-color-scheme`**, **`prefers-reduced-motion`**, `prefers-contrast`, `prefers-reduced-transparency`, `prefers-reduced-data` **[Frontier]**, **`forced-colors`**, `dynamic-range`, `color-gamut`, `display-mode` (installed PWAs), `scripting`, and `print`
- **Container queries**: `container-type: inline-size` (size containment on the inline axis) or `size`, `container-name` and the `container` shorthand, `@container card (width > 30rem)`, **container query units** (`cqi` for fluid type inside components), the containment side effects (a size container can't size itself by its children in that axis), and designing components that adapt wherever they're placed
- **Style queries** (`@container style(--variant: compact)`), a container's custom property driving descendants' styles, and **scroll-state queries** (`@container scroll-state(stuck: top)`, `snapped`, `scrollable`) for styling sticky headers when they stick **[Frontier]**
- **Fluid typography and space**: `clamp(min, preferred, max)` with a preferred value mixing `rem` and `vw` (or `cqi`) so it still scales with user zoom (WCAG 1.4.4; pure `vw` type fails), **Utopia**-style fluid type and space scales generated from two viewport widths and two ratios, fluid spacing tokens, and the line-length consequences
- **Viewport realities on mobile**: `100vh` vs the dynamic address bar (`svh`, `lvh`, `dvh`, and when each is right), `env(safe-area-inset-*)` with `viewport-fit=cover`, the on-screen keyboard (`interactive-widget`, the VirtualKeyboard API, the visual viewport), `-webkit-text-size-adjust` for landscape text inflation, and 300 ms tap delays (gone with a correct viewport meta)
- **Intrinsic layout primitives** (from *Every Layout* by Heydon Pickering and Andy Bell), each a small CSS algorithm you should be able to write from memory: **Stack** (vertical rhythm with `* + *`), **Box**, **Center** (max-width + auto margins + intrinsic centring), **Cluster** (wrapping flex with gap), **Sidebar**, **Switcher**, **Cover** (vertically centred hero with header/footer), **Grid** (`auto-fit` + `minmax(min())`), **Frame** (aspect-ratio crop), **Reel** (horizontal scroller), **Imposter** (centred overlay), and **Icon** (inline icons sized to text with `1cap`/`1ex`). Composition of primitives replaces most media queries
- **Responsive typography, images, and components together**: art direction (Part 4), different content priorities per size (not hiding content from mobile users), progressive disclosure, touch vs pointer affordances (`@media (pointer: coarse)` for larger targets), and hover-dependent UIs with non-hover fallbacks
- **Logical properties and internationalised layouts**: `margin-inline`, `padding-block`, `inset-inline-start`, `border-inline-end`, `text-align: start`, `float: inline-start`, logical `resize` and `overflow-inline`, and designing once for LTR, RTL, and vertical writing modes
- The standardised **`zoom`** property **[Frontier]** and its interaction with layout and container queries; browser zoom vs pinch zoom vs text-only zoom; testing at 200% and 400% (the reflow criterion at 320 CSS px)
- Testing responsive work: DevTools device mode (a starting point, not a device), responsive design mode in Firefox and Safari, real devices (at least one small Android, one iPhone, one tablet), resizing continuously rather than jumping between presets, and visual regression at a range of widths

**Intuition anchors**
- Breakpoints are where *your content* breaks, not where devices are. Resize slowly; the moment it looks wrong is your breakpoint.
- Media queries ask "how big is the screen?" Container queries ask "how big is my space?" Components live in spaces, not screens, so most component-level responsiveness belongs in container queries.

**Mastery checks**
- Write a fluid type scale with `clamp()` that passes 200% zoom, and explain why a pure-`vw` scale fails.
- Build a card that is horizontal in wide containers and stacked in narrow ones, and place it in a sidebar and a main column simultaneously.
- Write the Stack, Sidebar, Switcher, and Cover primitives from memory, and explain the algorithm behind each.
- Explain `svh` vs `dvh` and choose one for a full-screen mobile hero and for a bottom sheet.
- Convert a layout to logical properties and verify it in RTL.

**Build**
- A responsive system with no device breakpoints: a Utopia-style fluid type and space scale, the twelve layout primitives as a tiny library, three components using container queries (card, media object, pricing tier), a style query driving a compact variant, and a demo page that works from 280 px to 2560 px, at 400% zoom, and in RTL.

**Taste**
- Design for ranges, not for sizes. Every fixed pixel value is a bet about the viewport, the font size, the language, and the content, and the web will eventually call every one of those bets.

---

## PART 14 — Typography on the Web [Core → Deep]

- **Why typography dominates**: most interfaces are mostly text. Type choice, size, spacing, and measure decide readability, hierarchy, and brand more than any other decision. "Web design is 95% typography" (Oliver Reichenstein) is an exaggeration worth taking seriously
- **Anatomy and vocabulary**: baseline, x-height, cap height, ascender, descender, counter, stroke contrast, serif/sans/slab/mono/display/script classifications, optical sizes, weights and widths, tracking vs kerning, leading, measure, widows and orphans, rivers, ligatures, and old-style vs lining vs tabular figures
- **Font stacks and generic families**: `serif`, `sans-serif`, `monospace`, `system-ui`, `ui-sans-serif`/`ui-serif`/`ui-monospace`/`ui-rounded`, `math`, `emoji`, `fangsong`; system-font stacks as the zero-cost, native-feeling option; and fallback chains per script (CJK, Arabic, Devanagari)
- **`@font-face`** precisely: `src` with `woff2` (the only format you need now), `format()`/`tech()`, `font-weight`/`font-style`/`font-stretch` ranges for variable fonts, **`unicode-range`** subsetting (load Latin, Cyrillic, and Greek on demand), **`font-display`** (`swap`, `fallback`, `optional`, `block` and their FOUT/FOIT trade-offs), and the **metric overrides** `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` for making a fallback font occupy the same space (zero-CLS font loading)
- **Loading strategy**: self-hosting vs third-party (privacy, caching partitioned by site means no cross-site cache benefit), `preload` with `crossorigin` for the one or two critical files, subsetting with `glyphhanger`/`pyftsubset`, the CSS Font Loading API (`document.fonts.ready`), and budget discipline (two families, few weights; variable fonts often beat several static files)
- **Variable fonts**: registered axes (`wght`, `wdth`, `slnt`, `ital`, `opsz`) mapped to high-level properties (`font-weight: 437`, `font-stretch`, `font-style: oblique 10deg`, `font-optical-sizing: auto`), custom axes (`GRAD` for grade without reflow, `CASL`, `SOFT`) via `font-variation-settings` (which doesn't inherit piecemeal: use custom properties to compose it), and animating axes for expressive typography
- **OpenType features**: prefer high-level properties (`font-variant-numeric: tabular-nums lining-nums slashed-zero`, `font-variant-ligatures`, `font-variant-caps: small-caps`/`all-small-caps`, `font-variant-alternates` with `@font-feature-values`, `font-variant-east-asian`, `font-kerning`, `font-variant-position`), and fall back to `font-feature-settings` (`"ss01"`, `"cv05"`, `"case"`, `"frac"`) for stylistic sets and character variants. **Tabular numbers in tables and counters** is the single most impactful feature
- `font-synthesis` (preventing faux bold and italic), `font-size-adjust` (keeping x-height consistent across fallbacks), colour fonts (COLRv1) with `@font-palette-values` and `font-palette`, and emoji rendering across platforms
- **Setting text**: `font-size` in `rem` with a fluid scale (Part 13), a **modular scale** (ratios like 1.2 minor third, 1.25 major third, 1.333 perfect fourth, 1.618 golden) and when to break it, **unitless `line-height`** (≈1.4–1.6 for body, tighter ≈1.05–1.2 for large headings, because line height should *decrease* as size increases), **measure** of 45–75 characters (`max-inline-size: 65ch`), paragraph spacing vs indentation, `letter-spacing` (open up small caps and uppercase; tighten large display type slightly; never track lowercase body text), and `word-spacing`
- **Line breaking and wrapping**: **`text-wrap: balance`** for headings (evenly sized lines), **`text-wrap: pretty`** for paragraphs (avoids orphans, better rag), `text-wrap-mode`/`white-space-collapse`/`white-space` (`nowrap`, `pre`, `pre-wrap`, `pre-line`, `break-spaces`), `overflow-wrap: anywhere`/`break-word` vs `word-break: break-all`/`keep-all` (CJK), **`hyphens: auto`** (needs a correct `lang`), `hyphenate-limit-chars` **[Frontier]**, `&shy;` and `<wbr>`, and `line-break: strict` for CJK
- **Truncation**: single-line `text-overflow: ellipsis` (needs `overflow: hidden` + `white-space: nowrap` + a width), multi-line **`line-clamp`** / `-webkit-line-clamp`, the accessibility of truncated content (full text available via the link or a disclosure), and fade-out masks as an alternative
- **Vertical rhythm and trimming**: baseline grids on the web (pragmatic rather than pixel-strict), the `lh`/`rlh` units for rhythm-based spacing, and **`text-box-trim`/`text-box-edge`** (leading trim: removing the extra space above caps and below baselines so text aligns optically with icons and boxes) **[Frontier → Baseline-bound]**
- Decoration and detail: `text-decoration-thickness`, `text-underline-offset`, `text-decoration-skip-ink`, `text-underline-position: under`, `text-decoration-color` for beautiful links; `text-transform` (and its i18n pitfalls: uppercase German ß, Turkish dotted i, so write copy in the right case and transform only for style); `hanging-punctuation`; `initial-letter` for drop caps; `text-emphasis` for East Asian emphasis marks; `text-indent` with `each-line`/`hanging`; `quotes` and smart quotes/dashes/ellipses in content (typographer's quotes, en and em dashes, non-breaking spaces before units)
- **Writing modes and international typography**: `writing-mode` for vertical Japanese/Chinese/Mongolian, `text-orientation`, `text-combine-upright` (tate-chū-yoko), bidirectional text (`dir`, `unicode-bidi`, `<bdi>`), Arabic and Indic shaping (never letter-space connected scripts), script-appropriate line heights (Devanagari and Thai need more), and Noto as the pan-script fallback
- **Typographic design**: pairing (contrast in one dimension, harmony in others; a superfamily as the safe choice), hierarchy with the fewest variables (size, weight, colour, case, space: change one or two per level), type as brand, display vs text faces, reading typography vs interface typography, and the canon: *The Elements of Typographic Style* (Bringhurst), *Thinking with Type* (Lupton), Butterick's *Practical Typography*
- Sourcing type: Google Fonts, Fontsource (npm self-hosting), foundries and licensing (desktop vs web licences, pageview limits), Fontshare, and open-source families worth knowing (Inter, Source, IBM Plex, Literata, Fraunces, Recursive, Atkinson Hyperlegible)

**Intuition anchors**
- Line height, measure, and size are one system, not three settings: wider measure needs more line height, bigger text needs less. Change one and re-tune the others.
- Readers don't notice good typography. They notice reading being easy. Every typographic decision is judged by whether nobody comments on it.

**Mastery checks**
- Set a long-form article that's comfortable on a phone and on a 27" monitor: family, fluid scale, line height, measure, paragraph spacing, headings, links, quotes, code, and tables. Justify each number.
- Load a variable font with zero layout shift using a metric-adjusted fallback, and prove it with the Layout Shift regions overlay.
- Explain `text-wrap: balance` vs `pretty` and where each belongs.
- Explain why a German headline in `text-transform: uppercase` may be wrong, and what to do.

**Build**
- A type specimen site for a font you love: the full character set, a variable-axis playground driven by sliders (with CSS custom properties), OpenType feature toggles, a fluid scale demo, long-form reading samples in three scripts (Latin, a CJK language in vertical mode, and Arabic or Hindi), and a zero-CLS loading strategy.

**Taste**
- Pick fewer fonts and set them better. Most amateur typography has too many sizes, too many weights, and too little line height. Most professional typography has restraint and obsessive spacing.

---

## PART 15 — Colour, Backgrounds & Visual Effects [Core → Deep]

- **Colour science for CSS**: the eye and perception (luminance, hue, chroma), **colour spaces** vs **gamuts** (sRGB, Display-P3, Rec. 2020), why HSL is *not* perceptually uniform (a yellow and a blue at the same "lightness" look nothing alike), and why **OKLCH/OKLab** are the modern authoring spaces (perceptually uniform lightness, predictable chroma, hue that doesn't drift)
- **Colour syntax**: named colours, hex (with alpha), `rgb()`/`hsl()`/`hwb()` in modern space-separated syntax with `/ alpha`, `lab()`/`lch()`, **`oklab()`/`oklch()`**, `color(display-p3 …)`, `transparent`, **`currentColor`**, and `none` components
- **Wide gamut**: authoring P3 colours with `oklch()`, `@media (color-gamut: p3)`, gamut mapping (what browsers do with out-of-gamut colours) and why vivid brand colours look different on different screens
- **Colour functions**: **`color-mix(in oklch, a 30%, b)`** (and why the interpolation space matters), **relative colour syntax** (`oklch(from var(--brand) calc(l + 0.1) c h)` to derive hover, pressed, and subtle variants from one token), **`light-dark()`** with `color-scheme` for single-declaration theming, **`contrast-color()`** for automatic accessible text on arbitrary backgrounds, and system colours
- **Building palettes**: tonal scales (50–950) generated in OKLCH with even lightness steps, chroma that tapers at the extremes, neutral scales with a hint of brand hue (never pure grey), semantic colours (success, warning, danger, info), state colours (hover, active, disabled, focus), data-visualisation palettes (categorical, sequential, diverging; colour-blind-safe), and tools (Radix Colors, Tailwind's OKLCH palette, Leonardo, Huetone)
- **Colour theory for designers**: hue, saturation, value; value contrast carries hierarchy (squint test); harmonies (monochromatic, analogous, complementary, split-complementary, triadic) as starting points; the 60-30-10 proportion rule; colour psychology and cultural meaning (with humility); brand colour vs UI colour (the brand colour is rarely right for large surfaces or body text); and restraint (one accent)
- **Contrast and accessibility**: WCAG 2 contrast ratio (4.5:1, 3:1) and its known flaws (it overrates dark-on-dark and underrates some light-on-dark), **APCA** (the perceptual contrast algorithm proposed for WCAG 3, not yet normative: use it as a design aid, and meet WCAG 2 for compliance), non-text contrast for UI components and focus indicators (1.4.11), and never using colour alone (1.4.1)
- **Dark mode done properly**: `color-scheme` (native controls and scrollbars), `prefers-color-scheme` plus a user toggle that persists and avoids a flash (a blocking inline script or server-side cookie), a separate dark palette (not inversion: lower saturation, avoid pure black for large surfaces, raise surfaces with *lighter* colours for elevation instead of shadows, re-check every contrast pair), images and illustrations in dark mode (`<picture>` with `prefers-color-scheme`, dimming photos slightly), and `light-dark()` to keep it in one place
- **Forced colours and high contrast**: system colour keywords (`Canvas`, `CanvasText`, `LinkText`, `ButtonFace`, `ButtonText`, `Highlight`, `GrayText`, `AccentColor`), `forced-color-adjust: none` (rarely, carefully), transparent borders that become visible in forced colours, and SVG icons using `currentColor` so they survive
- **Backgrounds**: multiple layers, `background-size` (`cover`, `contain`), `background-position` with edge offsets, `background-repeat` (`space`, `round`), `background-origin`/`background-clip` (including **`background-clip: text`** for gradient text), `background-attachment` (and why `fixed` is janky and broken on iOS), and `image-set()`
- **Gradients**: `linear-gradient`, `radial-gradient` (shape, size keywords, position), **`conic-gradient`** (pie charts, colour wheels, loaders), repeating variants for stripes and patterns, colour stops and hints, **interpolation in `oklch`** (`linear-gradient(in oklch, …)`) to avoid grey dead zones, hue interpolation (`longer hue` for rainbows), easing gradients (scrim gradients over images), banding and noise dithering, and mesh-gradient illusions from stacked radials
- **Borders, radius, outlines**: border styles, `border-image` (and `border-image` with gradients), `border-radius` including elliptical radii and percentage tricks, nested-radius maths (inner radius = outer radius − padding), **`corner-shape`** (`squircle`, `bevel`, `scoop`, `notch`) **[Frontier]**, and outlines as focus rings
- **Shadows and depth**: `box-shadow` (offset, blur, spread, inset, multiple), **layered shadows** for realism (several shadows with increasing blur and decreasing opacity, tinted by the background hue, never pure black), a consistent **light source** and elevation scale, `text-shadow` (legibility on images, glows), and `filter: drop-shadow()` for shadows that follow alpha shapes
- **Filters and blending**: `filter` (`blur`, `brightness`, `contrast`, `grayscale`, `hue-rotate`, `invert`, `saturate`, `sepia`, `drop-shadow`, `url(#svg-filter)`), **`backdrop-filter`** (frosted glass: legibility checks, fallbacks, and GPU cost), `mix-blend-mode` and `background-blend-mode` (`multiply`, `screen`, `overlay`, `difference`, `luminosity`), and `isolation: isolate` to contain blending
- **Masking and clipping**: `clip-path` (`inset()`, `circle()`, `ellipse()`, `polygon()`, `path()`, the responsive **`shape()`** function, `xywh()`, `rect()`), animated clip-paths for reveals, `mask-image` with gradients (fade edges, scroll shadows) and images, `mask-mode`, `mask-composite`, and SVG masks
- **Textures and "premium" surface techniques**: grain/noise overlays (SVG `feTurbulence` or a tiny tiling PNG), glassmorphism with restraint, subtle gradients on "flat" surfaces, inner highlights (a 1 px inset light edge), soft glows, duotones (`mix-blend-mode` or SVG filters), halftones, and the perf cost of each at full-screen size
- Other visual properties: `opacity`, `visibility`, `object-fit`, `image-rendering: pixelated`, `cursor` (including custom cursors and their accessibility), `caret-color`, `accent-color`, `scrollbar-color`, `-webkit-text-stroke` and `paint-order` for outlined type, and `appearance`

**Intuition anchors**
- Define colours in a perceptual space (OKLCH) and derive everything else from a few tokens with relative colour syntax. Palettes built by eyeballing hex codes drift. Palettes built from lightness steps stay coherent.
- Realism comes from layers: several soft shadows, a subtle gradient, a hairline highlight, a touch of noise. Any single effect at high intensity looks cheap. Several at low intensity look expensive.

**Mastery checks**
- Generate an 11-step tonal scale in OKLCH for a brand colour, show where HSL would have produced uneven steps, and verify contrast pairs for text on each step.
- Derive hover, active, subtle-background, and border colours from one `--brand` token using relative colour syntax.
- Explain why pure-black shadows and pure-black dark-mode backgrounds look wrong, and fix both.
- Build a frosted-glass navigation bar with a legible fallback when `backdrop-filter` is unsupported or reduced transparency is requested.
- Style a component for forced-colors mode and verify it in emulation.

**Build**
- A theming engine: brand tokens in OKLCH, generated light and dark palettes via relative colour, `light-dark()` and a persisted no-flash toggle, forced-colors support, a contrast report (WCAG 2 and APCA) generated automatically, and a "surface lab" demonstrating layered shadows, glass, grain, gradient borders, and masks.

**Taste**
- Colour is the fastest way to look amateur and the hardest to fix late. Start in greyscale (hierarchy through value and space alone), add one accent with purpose, and only then add the rest.

---

## PART 16 — Transitions, Animations & Motion Design [Core → Deep]

- **Why motion exists in UI**: to explain change (continuity between states), to direct attention, to give feedback (a press, a success), to express brand, and to make waiting feel shorter. Motion without one of these reasons is decoration that costs performance and accessibility
- **Transitions**: `transition-property`, `-duration`, `-timing-function`, `-delay`, the shorthand with multiple transitions, `transition: all` as an anti-pattern (it transitions things you didn't intend, and costs performance), what is animatable (the propdef's "animation type": discrete vs by computed value), and `transitionend`/`transitionrun` events
- **Entry and exit from `display: none`**: **`@starting-style`** (the "before-open" style so elements animate *in* on first render), **`transition-behavior: allow-discrete`** (so `display` and `overlay` flip at the right moment for exit animations), and animating dialogs and popovers in and out purely in CSS
- **Animating to `auto`**: `interpolate-size: allow-keywords` and `calc-size()` **[Frontier]** for animating `height: auto` (accordions without JavaScript measurement), and the older techniques (grid-template-rows `0fr` → `1fr`, max-height hacks, FLIP)
- **Keyframe animations**: `@keyframes` with percentages, `animation-name`, `-duration`, `-timing-function` (per keyframe too), `-delay` (negative delays to start mid-way), `-iteration-count`, `-direction`, **`-fill-mode`** (`forwards`/`backwards`/`both`), `-play-state`, **`animation-composition`** (`add`, `accumulate`), multiple animations, and events
- **Easing**: `linear`, `ease`, `ease-in` (for exits), `ease-out` (for entrances; the default choice for UI), `ease-in-out` (for on-screen movement), `cubic-bezier()` (read the curve; overshoot with values outside 0–1), **`steps()`** (sprite animation, typewriter effects), and **`linear()`** with many stops for **spring and bounce approximations** in pure CSS. Easing is where motion gets its personality
- **Transforms**: `translate`, `rotate`, `scale`, `skew`, `matrix`; the **individual transform properties** (`translate:`, `rotate:`, `scale:`) that animate independently; transform order (right to left; `rotate` then `translate` ≠ `translate` then `rotate`); `transform-origin` (and `transform-box: fill-box` for SVG); and transforms not affecting layout (siblings don't move)
- **3D**: `perspective` (on the parent) vs `perspective()` (in the transform), `perspective-origin`, `transform-style: preserve-3d`, `backface-visibility`, card flips, cubes, tilt-on-hover, and the flattening triggers (`overflow`, `opacity`, `filter`) that silently break 3D
- **Motion path**: `offset-path` (`path()`, `ray()`, `url()`, basic shapes), `offset-distance` animated, `offset-rotate`
- **Animating custom properties** with `@property` (conic progress rings, gradient angles, animated colour stops, number counters with `counter()`)
- **The Web Animations API (WAAPI)**: `element.animate(keyframes, options)`, `Animation` objects (`play`, `pause`, `reverse`, `finish`, `cancel`, `playbackRate`, `currentTime`), **`finished`** promises for sequencing, `getAnimations()`, `commitStyles()`, `KeyframeEffect`, and timelines. It's the imperative control surface over the same engine CSS uses
- **FLIP** (First, Last, Invert, Play): measure, change layout, invert with a transform, animate the transform to zero. It's the technique behind layout animations (shared-element motion, reordering lists, expanding cards), and view transitions (Part 17) now automate much of it
- **Performance of motion**: animate **`transform` and `opacity`** (compositor-only, off the main thread, cheap) and avoid animating layout properties (`width`, `height`, `top`, `margin`) or paint-heavy ones (`box-shadow` blur, `filter` on large areas, `backdrop-filter`); **`will-change`** sparingly (it creates layers that cost memory; add before and remove after); layer explosion; 60 fps (16.7 ms) and 120 Hz (8.3 ms) frame budgets; and profiling frames in the Performance panel and the Animations inspector
- **Accessibility of motion**: **`prefers-reduced-motion`** (the recommended pattern: reduce, don't remove, by replacing large movements with fades and keeping feedback; gate big motion behind `(prefers-reduced-motion: no-preference)`), vestibular disorders, WCAG 2.3.3 (animation from interactions can be disabled), **2.2.2 Pause, Stop, Hide** (anything that auto-moves for more than 5 s needs a control), **2.3.1 Three Flashes**, and parallax and zoom as the most common triggers
- **Motion design principles** for UI:
  - The **12 principles of animation** (Disney, Thomas & Johnston) translated to interfaces: squash and stretch (subtle, for tactile feedback), anticipation, staging, follow-through and overlapping action, slow in and slow out (easing), arcs, secondary action, timing, exaggeration (sparingly), and appeal
  - **Durations**: micro-interactions 100–200 ms, small transitions 200–300 ms, larger panels 300–500 ms, full-screen transitions up to ~500 ms; exits faster than entrances; distance and size scale duration; nothing the user waits for over ~400 ms without purpose
  - **Choreography**: stagger (with `sibling-index()` **[Frontier]** or custom properties), a hierarchy of motion (primary element moves first), shared direction (things enter from where they come from), and consistent physics across the product
  - **Motion as a system**: duration and easing tokens (`--ease-out-quint`, `--duration-medium`), named motion patterns (enter, exit, expand, emphasise), and documentation like Material motion, Apple's HIG, IBM Carbon motion, and Fluent
- **Springs and physics**: why springs feel natural (velocity-aware, interruptible), stiffness, damping, and mass, approximating springs with `linear()`, and when to reach for libraries (Motion / Framer Motion, React Spring, GSAP) for interruption, gestures, and velocity handoff
- **Micro-interactions** worth mastering: button press (scale 0.97 + shadow change), toggle switches, checkbox ticks (stroke-dashoffset), like-button bursts, input focus transitions, skeleton shimmer (and when a skeleton lies), loading spinners that respect reduced motion, success confirmations, toast entrances, and hover lifts. Each is small, fast, and meaningful

**Intuition anchors**
- Motion is a sentence: something *was* here, *moves*, and *is now* there. If the user can't read the sentence (too fast, too slow, no direction), the motion failed however smooth it was.
- Compositor-only properties are the fast lane. `transform` and `opacity` animate on a separate thread even when the main thread is busy. Everything else competes with your JavaScript for the same 16 ms.

**Mastery checks**
- Animate a `<dialog>` and a popover in *and out* with no JavaScript, including the backdrop, and explain `@starting-style` and `allow-discrete`.
- Write a spring-like easing with `linear()` and compare it to `cubic-bezier` ease-out.
- Explain why animating `height` janks under load while animating `transform: scaleY` doesn't, and when the latter is unacceptable (text distortion).
- Implement FLIP for reordering a list by hand with WAAPI.
- Design a reduced-motion variant for a hero with parallax, a page transition, and an auto-playing carousel.

**Build**
- A micro-interaction library of 20 components (buttons, toggles, checkboxes, inputs, tabs, accordions with `height: auto`, toasts, dialogs, menus, skeletons, progress rings with `@property`, a like button, a copy-to-clipboard confirmation), each with motion tokens, a reduced-motion variant, and a performance trace proving compositor-only animation where claimed.

**Taste**
- Fast, subtle, and purposeful beats slow, bouncy, and impressive. The best UI motion is felt, not watched: users should notice that the interface feels responsive, not that it animates.

---

## PART 17 — Scroll, Page & Spatial Motion: Scroll-Driven Animations, View Transitions & Beyond [Deep → Frontier]

- **Scroll-driven animations**: `animation-timeline` with **`scroll()`** (progress of a scroll container) and **`view()`** (an element's progress through the scrollport); named timelines (`scroll-timeline`, `view-timeline`, `timeline-scope` for sharing across the tree); **`animation-range`** (`entry`, `exit`, `cover`, `contain`, with offsets); running on the compositor where possible; and the patterns: reading-progress bars, reveal-on-scroll, parallax layers, sticky storytelling ("scrollytelling"), image sequences, horizontal-scroll sections, and shrinking headers. They replace most scroll-listener JavaScript and IntersectionObserver-plus-class hacks
- **Scroll snap**: `scroll-snap-type` (`x`/`y`, `mandatory`/`proximity`), `scroll-snap-align`, `scroll-snap-stop: always`, `scroll-padding` and `scroll-margin` (also used to stop sticky headers covering anchor targets), snap events (`scrollsnapchange`, `scrollsnapchanging`) **[Frontier]**, and when mandatory snapping becomes a trap (content taller than the viewport)
- **CSS carousels** **[Frontier]**: `::scroll-marker` and `scroll-marker-group` for dot navigation, `::scroll-button()` for previous/next controls, `:target-current` for the active marker, and the accessibility semantics these generate. Carousels built on scroll containers are accessible by default in a way hand-rolled ones never were
- Scrolling behaviour: `scroll-behavior: smooth` (guarded by reduced motion), `overscroll-behavior: contain` (no scroll chaining from modals and drawers), scroll anchoring (`overflow-anchor`), `scrollbar-gutter`, scroll-state container queries (Part 13), and the critique of **scroll-jacking** and smooth-scroll libraries (Lenis and friends): they're beautiful on trackpads and hostile to keyboard, assistive-technology, and low-power users unless handled carefully
- **View Transitions**:
  - **Same-document**: `document.startViewTransition(updateCallback)`, what happens (snapshot old state, run update, snapshot new, animate between), `view-transition-name` for shared-element transitions (a thumbnail morphing into a hero), `view-transition-class` for styling groups, `match-element` auto-naming **[Frontier]**, the **pseudo-element tree** (`::view-transition`, `::view-transition-group()`, `::view-transition-image-pair()`, `::view-transition-old()`, `::view-transition-new()`), customising with CSS animations, **transition types** for directional navigations, `:active-view-transition`, and reduced-motion handling
  - **Cross-document** (MPA): `@view-transition { navigation: auto; }` on both pages, same-origin requirement, `pageswap`/`pagereveal` events, render blocking with `<link rel="expect" blocking="render">`, and the result that **multi-page sites get app-like transitions with zero framework**. Check current engine support
  - Pitfalls: unique names per snapshot, aspect-ratio changes (use `object-fit` on the image pair), text distortion during morphs, long-running updates freezing the page, and focus/scroll management after the swap
- **Beyond CSS for spatial and expressive motion** (literacy with a clear sense of cost):
  - **GSAP** (timelines, ScrollTrigger, SplitText, Flip, MorphSVG, now free) as the industry's creative-motion workhorse; **Motion** (formerly Framer Motion) for React layout animations and gestures; **Lenis** for smooth scroll; **Theatre.js** for authored timelines
  - **Designer-authored animation**: Lottie (After Effects → JSON), **Rive** (interactive state-machine animations), and their bundle and runtime costs
  - **3D and shaders**: Three.js / React Three Fiber scenes, GLSL fragment shaders for gradients, noise, and distortions, post-processing, WebGPU **[Frontier]**, and the performance and accessibility obligations (pause, fallbacks, reduced motion, battery)
  - **Text effects**: split-text animations (accessible when the original text stays in the accessibility tree and the split spans are `aria-hidden`), kinetic typography, variable-font axis animation, scramble/decode effects, marquees (with pause)
  - **Pointer-driven effects**: custom cursors, magnetic buttons, spotlight/glow following the pointer (a custom property updated on `pointermove`), tilt cards, and the touch and keyboard alternatives each one needs
- **"Awwwards-level" craft** deconstructed: what award-winning sites actually combine (strong typography, a grid, restrained colour, one signature interaction, page transitions, scroll choreography, preloaders that earn their wait, sound design with opt-in), how to study them (DevTools animations panel, slowing down animations, reading their CSS/JS), and the critique: many are inaccessible, heavy, and fragile. Learn the craft and refuse the costs
- **Choosing the tool**: CSS transitions → CSS animations → scroll-driven / view transitions → WAAPI → a motion library → canvas/WebGL. Move right only when the step to the left genuinely can't do it

**Intuition anchors**
- Scroll-driven animations replace time with scroll position as the clock. Everything you know about keyframes still applies. Only the timeline changes.
- A view transition is a screenshot crossfade with superpowers: the browser freezes the old state, applies your change, and animates between images. Most weirdness in view transitions is explained by "these are images, not live elements".

**Mastery checks**
- Build a reading-progress bar and a reveal-on-scroll section with no JavaScript, and explain `animation-range: entry 0% cover 30%`.
- Build a shared-element transition from a grid of thumbnails to a detail view in a single page, then as a cross-document transition between two HTML files.
- Explain why a scroll-snapping carousel with `mandatory` snapping can trap keyboard users, and design the fix.
- Take one GSAP ScrollTrigger effect and reimplement it with native scroll-driven animations. List what you couldn't reproduce.

**Build**
- A scrollytelling story (a data story or product narrative): a sticky visual pinned while text steps scroll past, scroll-driven chart reveals, snapping chapters, cross-document view transitions between chapters, a WebGL or SVG-filter hero with a static fallback, a full reduced-motion mode, and a performance trace at 4× CPU throttling.

**Taste**
- Spectacle is easy to add and hard to justify. Put one memorable motion moment on a page, make everything else quiet and fast, and make the whole experience work perfectly with motion turned off.

---

## PART 18 — Visual & Interaction Design Fundamentals for the Designer-Developer [Core → Deep]

- **The role**: a designer-developer (design engineer) closes the gap between intent and implementation, making design decisions in code, knowing when a design won't survive real content, and being fluent in both Figma and CSS. The superpower is iteration speed without a handoff, and the obligation is design judgement, not just implementation fidelity
- **Perception and Gestalt**: proximity (the most powerful grouping tool, so spacing *is* structure), similarity, common region (cards and backgrounds), continuity, closure, figure–ground, common fate (things that move together belong together), and focal point
- **Visual hierarchy**: size, weight, colour and value contrast, position, space, and depth; de-emphasising secondary content instead of shouting the primary (the *Refactoring UI* lesson); the **squint test** and the **greyscale test**; and one primary action per view
- **Space and layout**: a **spacing scale** (4/8-point base or a geometric scale) used exclusively, more whitespace than feels comfortable at first, internal ≤ external spacing (the space inside a group is smaller than the space between groups), alignment to a small number of edges, grids (columns, gutters, margins; the 12-column grid as a tool, not a religion), optical alignment vs mathematical alignment (icons and round shapes need nudging), and **composition** (balance, asymmetry, tension, rhythm, the rule of thirds, and directional flow: F- and Z-patterns in reading)
- **Typography as design** (mechanics in Part 14): a type scale with 5–7 steps, hierarchy with the fewest variables, pairing, emotional tone of typefaces, and text as the primary interface material
- **Colour as design** (mechanics in Part 15): greyscale first, one accent, semantic colour, colour for meaning not decoration, and dark-mode palettes designed rather than derived
- **Depth, elevation, and surfaces**: an elevation scale (flat, raised, overlay, modal), shadows from one light source, borders vs shadows vs background shifts as separation tools (use the lightest one that works), and the design movements that shaped UI surfaces: skeuomorphism → flat → Material → neumorphism (and its contrast failure) → glassmorphism → today's soft, layered minimalism
- **Iconography and imagery**: consistent icon sets (stroke width, corner radius, grid size, optical size), pairing icons with labels (icons alone are rarely clear), illustration styles and consistency, photography art direction, image treatment for brand, and avatars and empty-state illustrations
- **Interaction design**: affordances and **signifiers** (Norman: what looks clickable must be clickable, and vice versa), feedback for every action, mapping, constraints, and the **states of every component** (default, hover, focus, active/pressed, selected, disabled, loading, error, success, empty, skeleton, read-only, dragged, and "long content")
- **UX laws and heuristics**, used as lenses rather than rules: **Nielsen's 10 usability heuristics**, **Fitts's law** (big, close targets for frequent actions; screen edges are infinite), **Hick's law** (fewer choices, progressive disclosure), **Jakob's law** (users spend most time on *other* sites, so follow conventions), the aesthetic-usability effect, Tesler's law (conservation of complexity), the Doherty threshold (<400 ms feedback), the peak-end rule, the serial-position effect, and cognitive load
- **Information architecture and navigation**: content inventories, card sorting, hierarchies and labels, navigation patterns (top bar, sidebar, tabs, bottom tab bar on mobile, breadcrumbs, mega menus, command palettes), wayfinding (you-are-here signals via `aria-current`), and search vs browse
- **UX writing and microcopy**: clear verbs on buttons ("Save changes", not "OK"), error messages that say what happened and how to fix it, empty states that teach, onboarding copy, tone of voice, and **real content in designs** (lorem ipsum hides every layout problem)
- **Forms and data display as design problems**: single-column forms, label placement, input widths hinting expected length, sensible defaults, tables designed for scanning (alignment: text left, numbers right with tabular figures; zebra stripes vs rules; density modes), charts with honest scales and direct labels, and dashboards with a hierarchy
- **Responsive and adaptive design thinking**: content priority per context, touch vs pointer, one-handed mobile use (thumb zones), and designing the smallest and the largest layouts first
- **Design process for one person**: brief → research (look at 20 references, a "swipe file") → sketches (paper is fastest) → low-fidelity wireframes → a visual direction on one key screen (a "style tile" or "element collage") → build in the browser → critique → iterate. Plus usability testing with five users (Nielsen), hallway testing, and A/B tests for evidence
- **Figma fluency** for developers: frames and constraints, **auto layout** (= flexbox), grids and layout guides, components, variants, and properties (= a component API), **variables and modes** (= design tokens and themes), styles, prototyping, Dev Mode and inspect, exporting assets, plugins (contrast checkers, token exporters), and translating a design faithfully while flagging what won't survive real content
- **Design critique**: giving and receiving it (objective-led: "does this achieve the goal?"), the vocabulary (hierarchy, rhythm, contrast, balance, alignment, density, consistency), critiquing your own work after a break, and defending decisions with reasons rather than taste claims
- **Visual literacy and influences**: the Swiss/International Typographic Style (Müller-Brockmann's grids), Bauhaus, Dieter Rams's ten principles of good design, Massimo Vignelli's canon, Japanese design (ma: negative space), editorial magazine design, brutalism on the web, and contemporary product design (Linear, Stripe, Vercel, Apple, Things, Arc) studied as case studies
- **Brand and identity basics**: logo usage, a brand's type and colour system, voice, and turning a brand guide into tokens and components

**Intuition anchors**
- Spacing *is* grouping. Most layouts that "feel off" have equal space between things that are related and things that aren't. Fix the spacing, and the hierarchy appears.
- Good interface design is mostly subtraction: fewer colours, fewer sizes, fewer borders, fewer words, fewer choices. When stuck, remove something and look again.

**Mastery checks**
- Take a cluttered screen and redesign it using only spacing, weight, and value changes (no new colours, no new elements). Explain each change with a Gestalt principle or heuristic.
- List every state of a text input and a button, and design each.
- Run a heuristic evaluation of a real product against Nielsen's ten heuristics and prioritise the findings.
- Critique a famous landing page's hierarchy using the squint test, and redesign its hero.

**Build**
- A "design eye" portfolio: ten redesigns of real screens (before/after, with written rationale), a style tile for a fictional brand, a Figma file whose auto layout and variables map one-to-one onto your CSS, and a usability test with five people on one of your builds, with findings and fixes.

**Taste**
- Copy masters deliberately, then make it yours. Recreating great interfaces pixel for pixel teaches spacing, type, and restraint faster than any theory. Your own style emerges from what you consistently keep and what you consistently remove.

---

## PART 19 — CSS Architecture, Design Tokens & Design Systems [Deep]

- **Why CSS gets hard at scale**: a global namespace, specificity escalation, ordering dependencies, dead code nobody dares delete, inconsistent values ("47 shades of grey"), and components that break when moved. Every methodology is an answer to some subset of these
- **Methodologies**, their ideas, and what survives today: **OOCSS** (separate structure from skin, container from content), **SMACSS** (base, layout, module, state, theme categories), **BEM** (`block__element--modifier`: flat specificity through naming), **ITCSS** (an inverted triangle of settings → tools → generic → elements → objects → components → utilities, ordered by specificity and reach, and the ancestor of `@layer`), **SUIT CSS**, **Atomic/Functional CSS**, and **CUBE CSS** (Composition, Utility, Block, Exception: embrace the cascade, use layout primitives, and keep blocks small)
- **Utility-first CSS**: Tailwind's model (atomic classes composed in markup, a design-token-driven scale, purging unused styles, v4's CSS-first config with `@theme` and native cascade layers), the trade-offs (co-location and consistency vs verbose markup and abstraction through components), `@apply` and when it's a smell, and the skill of reading Tailwind as CSS
- **Scoping approaches**: naming conventions (BEM), **CSS Modules** (build-time hashed class names), **CSS-in-JS** runtime (styled-components, Emotion: flexible, with runtime cost and server-component friction) vs **zero-runtime** (vanilla-extract, Linaria, Panda CSS, StyleX: typed and extracted at build), framework-scoped styles (Vue, Svelte, Astro), **shadow DOM** encapsulation, and native **`@scope`**. Choose by team, framework, and performance needs
- **Preprocessors and postprocessors**: Sass (still widely used: modules with `@use`, mixins, functions, and maps, with much of it now native), Less (legacy), PostCSS (autoprefixer, custom plugins), **Lightning CSS** (fast transform, minify, and syntax lowering), and deciding what still needs a build step
- **The modern native architecture**: `@layer` for ordering (reset, tokens, base, layout primitives, components, utilities, overrides), custom properties for tokens and component APIs, `@scope` or conventions for component boundaries, nesting for readability, container queries for component responsiveness, and `:where()` for low-specificity defaults. It's a full architecture with zero dependencies
- **Design tokens**: the idea (design decisions as data: colour, type, space, radius, shadow, motion, z-index, breakpoints), **tiers** (primitive/reference tokens like `blue-600` → semantic/system tokens like `color-action-primary` → component tokens like `button-bg`), naming conventions, the **W3C Design Tokens Community Group format** (JSON with `$value`, `$type`, aliases), transformation pipelines (**Style Dictionary**, Tokens Studio, Figma variables export) to CSS custom properties, iOS, and Android, and modes (light/dark, brands, density)
- **Theming**: token swapping per `[data-theme]` or `:root` class, `light-dark()`, multi-brand white-labelling, user-customisable themes (accent pickers with relative colour), density modes (compact/comfortable), and avoiding the flash of the wrong theme
- **Component API design in CSS**: variants (`data-variant`, classes, or props), sizes, states driven by ARIA attributes and pseudo-classes, **custom properties as the public styling API** (`--button-padding`), sensible defaults via `:where()`, composition over configuration, slots for content, and resilience rules (no fixed heights, no magic numbers, logical properties, intrinsic sizing)
- **Design systems as products**: foundations (tokens, type, colour, grid, motion, iconography), components, patterns (forms, navigation, empty states), content guidelines, accessibility guarantees per component, documentation (Storybook, Zeroheight, custom docs sites), contribution and governance models, versioning and deprecation, adoption metrics, and design–code parity (Figma components mirrored by code components, Code Connect)
- **Headless and composable UI**: headless behaviour libraries (Radix Primitives, React Aria, Ark UI, Headless UI, Base UI) plus your own styling; the **shadcn/ui model** (copy the source into your codebase and own it); and choosing between a full component library, a headless library, and building on native elements
- **Design systems worth studying** (read their docs *and* their CSS): GOV.UK Design System (accessibility and research-driven patterns), Material Design 3 (tokens, motion, dynamic colour), Apple Human Interface Guidelines, IBM Carbon, Shopify Polaris, GitHub Primer, Atlassian, Adobe Spectrum, Salesforce Lightning, Radix Themes, Open Props (tokens as custom properties), and Pico/classless CSS (styling semantic HTML directly)
- **Maintaining CSS**: dead-code detection (coverage tools, PurgeCSS-style analysis), CSS stats (unique colours, font sizes, specificity graphs), visual regression tests as a refactoring safety net, Stylelint rules that enforce the architecture (no IDs, max nesting, token-only values), and deprecation paths
- **Styling in frameworks**: JSX differences (`className`, `htmlFor`, style objects, boolean attributes), React 19 stylesheet precedence and hoisting, Vue/Svelte scoped styles and `:global`, Astro's scoped styles and islands, and Server Components' preference for static, extractable CSS

**Intuition anchors**
- Tokens are the contract between design and code. When the Figma variable, the CSS custom property, and the native app constant share a name and a value, "design drift" becomes a build error instead of a meeting.
- Every CSS methodology is a strategy for the same three problems: scope (what does this rule touch?), specificity (who wins?), and order (who comes later?). Native CSS now has a direct answer to each: `@scope`, `:where()`, and `@layer`.

**Mastery checks**
- Explain the ITCSS triangle and map it onto a `@layer` declaration.
- Design a three-tier token set for colour, space, and type, with light and dark modes, in DTCG JSON, and build it to CSS with Style Dictionary.
- Refactor a BEM component to use `@scope` and custom-property APIs, and compare the result.
- Argue for and against Tailwind for a specific team and product, with concrete costs.

**Build**
- A design system from scratch: tokens in DTCG format → CSS custom properties (light, dark, and a second brand), a layered native CSS architecture, 25 accessible components on native elements with ARIA-driven state styling, a documentation site with live examples, visual regression and axe tests, a Figma library whose variables match the tokens, and a versioned package release.

**Taste**
- A design system's quality is measured by what teams *don't* have to decide. Make the right thing the easy thing (good defaults, few knobs, excellent docs) and resist adding every variant someone asks for.

---

## PART 20 — The HTML/CSS ↔ JavaScript Boundary & Web Components [Core → Deep]

*JavaScript itself is `L1-coding-typescript-javascript.md`. This Part is the minimum JavaScript a designer-developer needs to drive HTML and CSS well, and the rule for using as little of it as possible.*

- **The division of labour**: HTML holds structure and state (attributes like `open`, `aria-expanded`, `hidden`, `data-state`), CSS reacts to that state (selectors), and JavaScript only *changes state*. Toggling an attribute, not writing inline styles, is the pattern that keeps the three languages honest
- DOM essentials for styling: `querySelector(All)`, `classList` (`toggle` with force), `dataset`, `setAttribute`/`toggleAttribute`, `element.style.setProperty('--x', value)` for passing values (pointer position, scroll progress, measured sizes) into CSS via custom properties, `getComputedStyle`, `getBoundingClientRect` (and its layout cost), and `matchMedia` with change listeners for media queries in JavaScript
- **Observers** as the modern replacement for scroll and resize listeners: `IntersectionObserver` (lazy loading, reveal animations, active-section navigation), `ResizeObserver` (component sizes, now mostly replaced by container queries), and `MutationObserver`
- **Events relevant to UI**: pointer events (unifying mouse, touch, and pen; `pointer-events: none` in CSS; `touch-action` for gesture control), keyboard events and `key` values, focus events (`focusin`/`focusout`), `transitionend`/`animationend`, `toggle`/`beforetoggle` for popovers and details, `command` events **[Frontier]**, and passive listeners
- **CSS object APIs**: `CSS.supports()`, `CSS.registerProperty()`, the **CSS Typed OM** (`attributeStyleMap`, `CSS.px(10)`), **constructable stylesheets** (`new CSSStyleSheet()`, `replaceSync`, `adoptedStyleSheets`), `document.fonts`, `element.animate()` (Part 16), `document.startViewTransition()` (Part 17), and the **Houdini** Paint API (`paint()` worklets: Chromium-only, a curiosity for generative backgrounds)
- **Web components**: custom elements (`customElements.define`, lifecycle callbacks, attributes via `observedAttributes`), **shadow DOM** (`attachShadow`, open vs closed, style encapsulation both ways), **`<slot>`** and named slots, **Declarative Shadow DOM** (`<template shadowrootmode="open">`) for server rendering without JavaScript, **styling across the boundary** (inheritable properties and custom properties pass in; `::part()` exposes internals; `::slotted()` styles light-DOM children at one level; `:host` and `:host()` style the element itself; `exportparts`), `:defined` to avoid flashes of unstyled components, `ElementInternals` for form participation and ARIA defaults, custom states (`:state()`), and scoped custom element registries **[Frontier]**
- **When web components win**: design systems shared across frameworks, long-lived widgets embedded in unknown pages (third-party embeds), and progressively enhanced "HTML web components" that wrap existing markup instead of rendering it. **When they're awkward**: SSR-heavy apps without DSD, accessibility across shadow boundaries (ID references can't cross them yet; reference target is **[Frontier]**), and form participation boilerplate
- Progressive enhancement patterns: the HTML works first (links navigate, forms submit, details open), JavaScript upgrades it (fetch instead of reload, richer widgets); feature detection over sniffing; and `<noscript>` rarely needed when the baseline works
- Framework literacy for markup authors: how JSX/templates compile to DOM, why frameworks warn about keys, `dangerouslySetInnerHTML` and its XSS risk (Part 25), hydration mismatches caused by markup that differs between server and client (dates, random IDs, invalid nesting that the parser rewrites), and invalid HTML nesting as a hydration bug source

**Intuition anchors**
- JavaScript should flip state, and CSS should draw it. When JavaScript starts writing `style.top` and `style.opacity` every frame, you have moved design into the least declarative, least accessible, and least performant layer.
- Shadow DOM is a wall with specific doors: inherited properties and custom properties pass through, `::part` opens a window, and everything else stays out. Design the doors deliberately.

**Mastery checks**
- Build a pointer-follow spotlight effect where JavaScript only writes two custom properties and CSS does everything else.
- Build a custom element with shadow DOM, one named slot, two exposed parts, and a custom-property theming API, server-rendered with Declarative Shadow DOM.
- Explain why invalid nesting in a server-rendered template causes a hydration mismatch.

**Build**
- An "HTML web components" kit: five components that enhance existing markup (a disclosure-driven nav, a copy button, a table sorter, a tabs upgrade from headings and sections, a lazy video facade), each working without JavaScript, each styled from outside via custom properties and parts.

**Taste**
- Write the HTML that works, the CSS that makes it beautiful, and then the smallest JavaScript that makes it better. Reversing that order is how pages become slow, fragile, and inaccessible.

---

## PART 21 — Rendering Performance, Tooling & Debugging for HTML/CSS [Core → Deep]

*Core Web Vitals, budgets, caching, and field measurement are in `L18-cs-web-engineering.md` Part 5. This Part covers what markup and styles specifically cost.*

- **CSS is render-blocking**: the browser won't paint until it has the CSSOM for stylesheets that apply. So keep critical CSS small, **inline critical CSS** for the first paint where it pays, load non-critical styles without blocking (`media` tricks, or splitting by route), avoid **`@import` chains** (serial waterfalls), and put stylesheets before scripts
- **Style recalculation cost**: proportional to the number of elements × the rules that might match. Large DOMs (thousands of nodes) are the usual problem, not selector cleverness. Keep DOM size lean (a common guideline is under ~1,500 nodes), watch `:has()` and sibling-combinator invalidation on hot subtrees, and use DevTools' selector stats when recalculation shows up in traces
- **Layout cost and layout thrashing**: properties that trigger layout (geometry: `width`, `height`, `margin`, `padding`, `top`, `font-size`, `display`), paint (`color`, `background`, `box-shadow`, `border-radius` with changing values), or only composite (`transform`, `opacity`, and `filter` in some cases); forced synchronous layout from reading geometry after writing styles; and batching reads before writes
- **Containment and skipping work**: `contain` values, **`content-visibility: auto`** with `contain-intrinsic-size: auto 500px` for long pages (big rendering wins; watch for find-in-page, anchor, and accessibility interactions), and `content-visibility: hidden` for cached off-screen views
- **Compositing**: layers, `will-change` (a hint, not magic; memory cost), layer explosion from many animated elements, overlapping-layer promotion, and inspecting with the Layers panel
- **Layout shift (CLS) from markup and CSS**: images without dimensions, ads and embeds without reserved space, web fonts swapping metrics (fix with metric overrides), content injected above existing content, animations of layout properties, and `scrollbar-gutter` for scrollbar-induced shifts
- **Paint-heavy styles**: large `box-shadow` blurs, `filter: blur()`, `backdrop-filter`, and big gradients on scrolling layers. Measure with paint flashing and the Performance panel, not by folklore
- **CSS payload**: unused CSS (Coverage panel), duplication, minification and Brotli, splitting by route or component, utility-framework purging, and the note that CSS bytes are usually cheaper than JavaScript bytes but block rendering
- **DevTools mastery for CSS** (Chrome, Firefox, Safari each have strengths): the Styles pane (toggle, edit, `:hov` state forcing, colour picker with contrast and gamut info, easing and shadow editors), **Computed** (the winning value and why), the box-model diagram, **flex and grid overlays**, **Firefox's "inactive CSS" hints** and font panel, the **Changes** tab, **CSS Overview** (colours, fonts, unused declarations, media queries), the **Animations** panel (slow down, scrub, inspect timing), the **Rendering** panel (paint flashing, layout-shift regions, layer borders, emulate `prefers-*`, forced colours, vision deficiencies, print media, auto dark mode), the Accessibility pane, Recorder, and Local Overrides for testing CSS on production
- **Debugging CSS systematically**: reproduce in isolation (a reduced test case in a CodePen or a blank HTML file), check that the rule applies at all (selector, layer, specificity, validity, typos), check that the property can apply (an inactive property: `z-index` on a static element, `width` on an inline, `justify-self` in flex), identify the algorithm in charge, check the containing block and formatting context, then check browser support. The "outline everything" debug style (`* { outline: 1px solid red }`)
- **Tooling**: Stylelint (with an ordering and token-enforcement config), Prettier/Biome, **browserslist** as the shared target definition, **Lightning CSS**/PostCSS for lowering modern syntax where needed, autoprefixer (mostly unnecessary now), bundler CSS handling (Vite, CSS Modules, code-split CSS), the Baseline status in editors and linters, and `@supports` for feature detection
- **Measuring what matters**: Lighthouse for lab signals, the Performance panel for the truth about a frame, WebPageTest filmstrips for perceived loading, and field data for everything else (`L18-cs-web-engineering.md` Part 5)

**Intuition anchors**
- CSS performance is almost never "this selector is slow". It is "this page has 8,000 elements", "this animation triggers layout", or "this stylesheet blocks the first paint". Look for those three first.
- The Computed panel tells you what won. The Styles panel tells you what competed. Debug from Computed backwards.

**Mastery checks**
- Given a trace with long "Recalculate Style" and "Layout" entries on scroll, list the likely causes and the fixes.
- Apply `content-visibility: auto` to a long document, measure rendering time before and after, and name one side effect you had to handle.
- Explain why a `z-index`, `width`, or `justify-self` declaration can be "inactive", with one example each.
- Inline critical CSS for a landing page and measure the first-paint difference under throttling.

**Build**
- A performance-tuned long-form site: critical CSS inlined, the rest split by route, zero CLS from fonts and images, `content-visibility` on sections, compositor-only animations verified by trace, a CSS Overview audit reduced to a tight palette and type scale, and Stylelint enforcing tokens.

**Taste**
- Make the first paint cheap and the steady state quiet. Beautiful sites that jank on a mid-range phone are unfinished, and the fix is almost always less: fewer nodes, fewer layers, fewer effects.

---

## PART 22 — Server-Rendered HTML: Forms, Templates, Hypermedia & the Backend of Markup [Core → Deep]

*HTML and CSS don't run on servers, but servers exist to produce HTML. Server runtimes, caching layers, and SSR architecture are in `L18-cs-web-engineering.md` Parts 3 and 9. This Part covers the backend skills that belong to a markup expert.*

- **HTML over HTTP**: a request, a response with `Content-Type: text/html; charset=utf-8`, status codes that browsers and crawlers act on (200, 301/302/303/307/308, 404 with a helpful page, 410, 500), `Cache-Control` for HTML (short, revalidated) vs hashed assets (long, immutable), `Content-Language`, `Link` headers for preloading, **103 Early Hints**, and **streaming** HTML (send the `<head>` and shell immediately, flush the rest as data arrives)
- **Forms as the original API**: the server receiving `application/x-www-form-urlencoded` and `multipart/form-data`, **POST → Redirect → GET** (prevent resubmission on refresh with 303), server-side validation that re-renders the form with the user's values, inline errors, and an error summary (the accessible pattern from Part 3, now server-generated), **CSRF tokens** in hidden inputs, idempotency and double-submit protection, file uploads (size limits, type checking by content not extension, storage, signed direct uploads), and methods beyond GET/POST (method-override conventions, or the HTML proposal work on more methods **[Frontier]**)
- **Templating**: server template languages (Jinja/Nunjucks, Liquid, Handlebars/Mustache, EJS, ERB, Blade, Go `html/template`, Razor, Twig, JSX rendered on the server), **auto-escaping** (and the contexts it covers: HTML text, attributes, URLs, JavaScript, CSS), layouts and blocks, partials/includes, components/macros, loops and conditionals, and keeping logic out of templates
- **Static site generation and content pipelines**: Eleventy (templating-agnostic, HTML-first), **Astro** (component islands, zero JavaScript by default, content collections), Hugo, Jekyll, and framework SSG modes; Markdown → HTML via remark/rehype or markdown-it (with plugins for headings, anchors, syntax highlighting, and footnotes); front matter; image pipelines at build time; and headless CMS integration (content as data, HTML rendered by you)
- **Hypermedia-driven applications**: HTML-over-the-wire as an architecture. **htmx** (`hx-get`, `hx-post`, `hx-target`, `hx-swap`, `hx-trigger`, `hx-boost`, out-of-band swaps), **Hotwire/Turbo** (Drive, Frames, Streams), Datastar, Unpoly, and the idea underneath (HATEOAS: the server sends HTML with the next actions embedded). Great for CRUD apps and dashboards, and weaker for highly interactive client-state apps (Carson Gross's *Hypermedia Systems*)
- **Server-rendered components**: Declarative Shadow DOM (Part 20), React Server Components emitting HTML, islands architecture, partial hydration, and the markup-quality obligations that SSR brings (valid nesting, stable IDs, deterministic output)
- **A minimal backend you should be able to write**: a small server (Node with Hono/Express/Fastify, Deno, Bun, or Python with Flask/Django, or Go) that serves static assets with correct cache headers, renders pages from templates with data from SQLite, handles a form with validation and PRG, sets secure cookies for a session, returns proper status codes and error pages, streams a slow section, and sets security headers (Part 25)
- **HTML sanitisation for user content**: why you never render user-submitted HTML unsanitised; allowlist sanitisers (DOMPurify on the client, `sanitize-html`/bleach on the server, the browser **Sanitizer API** `setHTML()` **[Frontier]**); Markdown for user content with HTML disabled or sanitised; and `rel="ugc nofollow"` on user links
- **Internationalised server output**: locale negotiation (`Accept-Language` as a hint, the URL as the source of truth), `lang`/`dir` set per response, `hreflang` alternates, translated templates with pluralisation (ICU MessageFormat), date and number formatting on the server, and RTL stylesheets via logical properties rather than separate files
- **Error and edge pages**: 404, 500, maintenance, offline (service worker), rate-limited, and "JavaScript failed" states, all designed as carefully as the home page

**Intuition anchors**
- A form plus a server is a complete application architecture that has worked since 1995. Every client-side framework is an optimisation on top of it, so make sure you can build the unoptimised version first.
- Auto-escaping is the server's most important security feature. Every "raw"/"safe" filter in a template is a hole you've cut in it deliberately. Know where each one is.

**Mastery checks**
- Implement POST-Redirect-GET for a contact form with server-side validation that re-renders errors accessibly and preserves input.
- Explain which contexts HTML auto-escaping protects and which it doesn't (inside `<script>`, inside `href="javascript:…"`, inside `style`).
- Build a search page with filters as a GET form whose URL is shareable, then enhance it with htmx or `fetch` without breaking the no-JS path.
- Explain streaming HTML and what the user sees on a slow connection at each stage.

**Build**
- A server-rendered guestbook/blog engine with no client framework: templates with layouts and partials, SQLite storage, Markdown posts sanitised, comments via a PRG form with CSRF protection and accessible errors, cookie sessions, pagination via URLs, correct caching and status codes, security headers, an RSS feed, and progressive enhancement with htmx or a small script. Then deploy it.

**Taste**
- Send HTML. Servers are fast at producing it, browsers are fast at rendering it, and users get content before JavaScript even arrives. Add client-side rendering only where the interaction genuinely requires it.

---

## PART 23 — HTML & CSS Beyond the Screen: Email, Print, PDF & Other Targets [Deep]

- **HTML email**, a separate discipline with 2000s-era constraints:
  - Rendering engines: Outlook for Windows (Word's rendering engine in classic versions, being phased out by the new Outlook), Gmail (strips `<style>` in some contexts, rewrites classes, clips messages over ~102 KB), Apple Mail (WebKit, the most capable), Yahoo, Samsung, and dark-mode variations in each
  - Techniques: **table-based layouts** with `role="presentation"`, inline styles (tools inline them for you), a ~600 px max width, hybrid/fluid ("spongy") layouts, `<!--[if mso]>` conditional comments, **VML** for Outlook background images and "bulletproof" buttons, web-safe font stacks with web fonts as progressive enhancement, images with `alt` and dimensions (many clients block images by default), preheader text, and `bgcolor` attributes
  - Dark mode in email: `color-scheme` meta and `@media (prefers-color-scheme)` where supported, clients that invert colours forcibly, and transparent PNG logos with outlines
  - Accessibility in email: `lang`, `role="presentation"` on layout tables, real text rather than images of text, sufficient contrast, semantic headings, and links with clear text
  - Tooling: **MJML**, **Maizzle** (Tailwind for email), React Email, Foundation for Emails; testing with Litmus or Email on Acid; plain-text alternatives; and deliverability basics (a good HTML-to-text ratio, no hidden spam triggers)
- **Print CSS**: `@media print` (hiding navigation, showing link URLs with `a[href]::after { content: " (" attr(href) ")" }`, black-on-white, removing backgrounds), **`@page`** (`size`, `margin`, `:first`/`:left`/`:right` pages, margin boxes for headers and footers, which are partially supported), fragmentation (`break-before`, `break-after`, `break-inside: avoid`, `orphans`, `widows`), print-friendly tables (repeating `<thead>`), `print-color-adjust: exact` for when backgrounds must print, and testing with print emulation and real printers
- **Paged media and PDF generation**: HTML → PDF with headless Chromium (Puppeteer/Playwright `page.pdf()`), **WeasyPrint**, **Prince**, or Vivliostyle; the **Paged.js** polyfill for running headers, page counters (`counter(page)`), footnotes, and cross-references; and building invoices, résumés, reports, and books from HTML and CSS
- **Generated images from HTML/CSS**: Open Graph image generation (Satori + resvg, headless screenshots), social cards, certificates, and the constraints of each renderer (Satori supports a flexbox subset)
- **Other HTML targets**: EPUB e-books (XHTML + CSS with reading-system quirks), WebViews in native apps (safe areas, `-webkit-` behaviours, the link to `L18-cs-app-engineering.md`), Electron/Tauri desktop apps (the same CSS with desktop idioms: title bars, `-webkit-app-region`, native-feeling controls), presentation slides (reveal.js, Slidev, or plain HTML with scroll snap), documentation sites, and embeddable widgets (style isolation with shadow DOM or iframes)
- **Reader modes, RSS readers, and syndication**: how semantic markup survives Safari Reader, Firefox Reader View, and feed readers, and why that's a test of your HTML's quality
- **Kiosk, TV, and large-screen interfaces**: spatial (D-pad) navigation, focus styles visible at a distance, 10-foot typography, overscan safe areas, and low-power hardware

**Intuition anchors**
- Email HTML is time travel. The skills are the same (semantics, accessibility, restraint), but the tools are tables, inline styles, and conditional comments. Treat it as a separate platform with its own compatibility table.
- Print and PDF are where CSS's paged-media side lives. The same semantic HTML that works on screen becomes an invoice, a résumé, or a book when you give it a page model.

**Mastery checks**
- Build a responsive, dark-mode-aware transactional email that renders acceptably in Outlook for Windows, Gmail, and Apple Mail, with a bulletproof button.
- Write a print stylesheet for an article that prints cleanly with link URLs, no orphans in headings, and a table header repeated on each page.
- Generate a two-page A4 invoice PDF from HTML with page numbers and a running footer.

**Build**
- A "same content, five targets" project: one Markdown source rendered as a responsive web article, a print/PDF edition with Paged.js, an HTML email newsletter, an EPUB, and an Open Graph share image, all from shared templates and tokens.

**Taste**
- Respect each medium's constraints instead of fighting them. A great email designer, a great print designer, and a great web designer all use the same judgement with different tools, and the best designer-developers can switch between them.

---

## PART 24 — Resilience: Cross-Browser, Internationalisation, Defensive CSS & Testing [Core → Deep]

- **Progressive enhancement as layered design**: core content and function in HTML → presentation in CSS with fallbacks → behaviour in JavaScript; "cutting the mustard" feature tests; and the fact that every user is temporarily on the no-JS path while JavaScript loads (or fails)
- **Fallbacks in CSS**: declaration repetition (an older value first, then the modern one), **`@supports`** feature queries (`@supports (anchor-name: --a)`, `@supports selector(:has(a))`, `@supports not (…)`), `var()` fallbacks, `min()`/`max()` fallbacks, and the rule that unsupported selectors in a list invalidate the whole rule (use `:is()`, which is forgiving, or separate rules)
- **Cross-browser realities**: the three engines (Blink, WebKit, Gecko) and their characteristic differences; **Safari/iOS** as the special case (WebKit is the only engine on iOS in most regions, with viewport quirks, the virtual keyboard, `position: fixed` behaviour, and form-control styling); testing matrices driven by analytics; real devices vs emulation; BrowserStack/Sauce Labs; and reading the Interop dashboard and caniuse critically
- **Defensive CSS** (Ahmad Shadeed's catalogue and beyond): long words and URLs (`overflow-wrap: anywhere`), long names in flex items (`min-width: 0`), images without dimensions and distortion (`object-fit`), `flex-wrap` on anything that might wrap, `minmax(0, 1fr)`, scrollbar gutters, `max-width: 100%` on media, background images with a fallback colour, button text that might grow, vertical centring that survives two lines, component spacing that survives missing elements (`gap` over margins; `:empty`), grid `auto-fit` vs `auto-fill` pitfalls, and sticky/overflow conflicts
- **Content stress-testing**: the *real* content extremes, from empty to one character to 400 characters, very long names, user-uploaded images of any aspect ratio, 0 and 1 and 1,000,000 items, translations 30–40% longer (German, Finnish) or much shorter (Chinese), and user font-size settings
- **Internationalisation (i18n) in markup and styles**: correct `lang` at the document and phrase level, `dir="rtl"` and `dir="auto"` for user content, `<bdi>` for isolating names, logical properties everywhere, **mirroring** directional icons (arrows, progress, "back") but not others (media controls, clocks, checkmarks), `:dir(rtl)` for exceptions, text expansion, script-appropriate fonts and line heights, vertical writing modes, number, date, and currency formatting done by `Intl` (rendered into `<time>` and `<data>`), and pseudo-localisation for testing
- **User preferences and overrides**: user stylesheets, browser minimum font sizes, text-only zoom, reader mode, high-contrast themes, forced colours, reduced motion, reduced transparency, and extensions that alter pages. Your CSS runs on the user's terms
- **Testing HTML and CSS**: HTML validation in CI (Nu checker), accessibility checks (axe with Playwright), **visual regression testing** (Playwright screenshots, Chromatic, Percy, BackstopJS) across widths, themes, and locales, with a strategy for fonts and animation nondeterminism; component stories as test fixtures (Storybook); cross-browser runs with Playwright's three engines; link checking; and Lighthouse CI for regressions
- **Browser support policy**: define it with browserslist and Baseline ("widely available" as the default bar, "newly available" with fallbacks), document it, and revisit it yearly. "Supports" can mean fully identical, functionally equivalent, or content-accessible, so pick one per browser tier

**Intuition anchors**
- Defensive CSS is imagining the content you *didn't* design with. The layout in the mock-up is the best case. Production will send the worst case within a week.
- Logical properties make RTL support almost free if you use them from day one, and expensive if you add them later.

**Mastery checks**
- Take a component and list ten content-driven ways it can break; fix each defensively.
- Convert a page to support Arabic with correct mirroring, bidirectional user names, and an appropriate font, and explain which icons you didn't mirror.
- Write a `@supports` strategy for shipping anchor-positioned tooltips with a fallback.
- Set up visual regression across three widths, two themes, and two locales, and explain how you keep it from being flaky.

**Build**
- A "hostile content" test harness for your component library: stories fed with extreme content, pseudo-localised strings, RTL, forced colours, 200% text, and reduced motion, run in three engines with screenshot diffs and axe, gating merges in CI.

**Taste**
- Build for the content and people you haven't met yet. Resilience isn't a feature you add at the end. It is a habit of writing CSS that asks "and what if…?" every time you type a fixed value.

---

## PART 25 — Security & Privacy at the Markup Layer [Core → Deep]

*The browser security model, CSP rollout, cookies, and CSRF are in `L18-cs-web-engineering.md` Part 7. This Part covers what HTML and CSS authors specifically control.*

- **XSS through markup**: injection contexts (element content, attribute values quoted and unquoted, URLs, inline event handlers, `<script>` and `<style>` blocks), the dangerous sinks (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `srcdoc`, `dangerouslySetInnerHTML`, `v-html`, template "raw" filters), `javascript:` and `data:` URLs in `href` and `src`, and SVG uploads as XSS vectors (scripts and event handlers inside SVG served as `image/svg+xml` on your origin)
- Defences: context-aware auto-escaping (Part 22), sanitising with allowlists, **Trusted Types**, the **Sanitizer API** **[Frontier]**, a **Content Security Policy** (and what `style-src` and inline styles mean for your CSS: nonces for `<style>` tags, avoiding inline `style` attributes if you want strict CSP, and the unsafe-hashes trade-off), and serving user uploads from a separate origin
- **CSS injection and exfiltration**: attribute selectors plus `background-image: url()` leaking attribute values (CSRF tokens, input values) character by character, `@import` and `@font-face` with `unicode-range` as side channels, and the rule: never allow user-controlled CSS without strict sanitisation
- **Dangling markup injection** (an unclosed attribute swallowing following content into a URL), **`<base>` tag hijacking**, **form action hijacking**, and `<meta http-equiv="refresh">` redirects
- **Links and framing**: `target="_blank"` now implies `noopener` in modern browsers (add it explicitly for older ones; reverse tabnabbing), `rel="noreferrer"` for privacy, `referrerpolicy`, **iframe `sandbox`** tokens and the `allow-scripts` + `allow-same-origin` trap, `allow` for permissions, `credentialless` iframes, and clickjacking defence (`frame-ancestors` in CSP; visual UI-redress attacks with transparent overlays)
- **Forms and credentials**: `autocomplete` for password managers (and never disabling it), `type="password"` with a show-password toggle, passkey autofill (`autocomplete="username webauthn"`), not putting secrets in hidden fields or URLs, and HTTPS forms only
- **Privacy in markup and styles**: `:visited` restrictions and history sniffing, third-party fonts, images, and embeds leaking visits (self-host, use facades), tracking pixels, `loading="lazy"` as a privacy win for embeds, fingerprinting surfaces (installed fonts, media queries), and consent gating in markup (don't load the script tag until consent)
- **Trust signals and anti-phishing**: never mimicking browser chrome or system dialogs, clear link destinations, and the dark-pattern line (disguised ads, confirmshaming, pre-ticked boxes, roach motels, hidden costs), with the legal frameworks increasingly regulating them (EU DSA, US FTC guidance)

**Intuition anchors**
- Any string that becomes markup is code. Escaping turns it back into text, and every place you skip escaping is a place you've decided the string is trusted.
- CSS looks harmless, but with selectors and URLs it can read attributes and send them somewhere. User-controlled CSS is user-controlled code.

**Mastery checks**
- List five XSS sinks in HTML/templating and the escaping or sanitisation each needs.
- Explain how an attribute selector plus `background-image` can exfiltrate a CSRF token.
- Explain why uploaded SVGs should be served from a separate origin or sanitised.
- Explain reverse tabnabbing and why modern browsers changed the default.

**Build**
- A "markup security" lab: a deliberately vulnerable comment system demonstrating stored XSS, a CSS exfiltration proof of concept against a test page you own, a dangling-markup injection, and an SVG upload attack. Then fix each with escaping, sanitisation, CSP with nonces, and origin isolation, documenting what each control stops.

**Taste**
- Treat escaping as the default and every exception as a code-review event. The most secure markup is boring: escaped by default, sanitised by allowlist, and never assembled from strings by hand.

---

## PART 26 — Taste Development [Deep → Lifelong]

**What good looks like:** semantic HTML that reads well unstyled; a small, explicit cascade (layers, low specificity, tokens); layouts that respond to their space and survive any content, language, or zoom level; typography with restraint and generous spacing; colour defined perceptually and used sparingly; motion that is fast, meaningful, and optional; native elements styled beautifully instead of divs rebuilt badly; components whose every state is designed; pages that are fast on a mid-range phone and work without JavaScript; and a visual voice that is recognisably yours without being loud.

**Sources worth following:** MDN · the CSS Working Group drafts and the WHATWG HTML spec · web.dev (*Learn HTML*, *Learn CSS*, *Learn Design*, *Learn Accessibility*) · the Chrome, WebKit, and Firefox release notes and blogs · Baseline and Interop dashboards · **Jen Simmons** (intrinsic design, layout) · **Rachel Andrew** (grid, layout specs) · **Miriam Suzanne** (cascade layers, `@scope`, container queries) · **Una Kravets** and **Adam Argyle** (new CSS features, motion, GUI challenges) · **Bramus Van Damme** (scroll-driven animations, view transitions) · **Josh W. Comeau** (mental models for CSS) · **Kevin Powell** (CSS teaching) · **Ahmad Shadeed** (defensive CSS, interactive guides) · **Andy Bell** (CUBE CSS, *Every Layout*, Piccalilli) · **Heydon Pickering** (*Every Layout*, *Inclusive Components*) · **Sara Soueidan** (SVG, accessibility) · **Adrian Roselli** and **Léonie Watson** (accessibility) · **Lea Verou** (*CSS Secrets*, colour) · **Stephanie Eckles** (Modern CSS Solutions, SmolCSS) · **Jhey Tompkins** (creative CSS) · **Cassie Evans** (SVG and GSAP animation) · **Val Head** (UI motion) · **Steve Schoger & Adam Wathan** (*Refactoring UI*) · **Erik Kennedy** (Learn UI Design) · **Oliver Reichenstein** (iA, typography) · **Matthew Butterick** (*Practical Typography*) · Smashing Magazine, CSS-Tricks archives, Codrops (creative techniques), Awwwards, and Godly/Mobbin/Land-book for inspiration

**Deliberate exercises**
- **Copywork**: recreate one excellent interface a week from a screenshot, without viewing its source, then compare with the real CSS. The painters' method for learning spacing, type, and colour
- **Constraint studies**: build the same page with one font size and weight only, with greyscale only, with no borders, with no images, and with no JavaScript. Constraints reveal what actually creates hierarchy
- **Read the CSS of sites you admire** in DevTools: their tokens, layers, layout primitives, and motion easings
- **Unstyled review**: turn CSS off on your own pages monthly and read them
- **Resize-and-break sessions**: drag every page from 280 px to 2560 px, zoom to 400%, switch to RTL, and fix what breaks
- **One new CSS feature a week**, used in a real demo, with its Baseline status and fallback written down
- **Design critique journal**: one screen a day, three sentences on what works and what doesn't
- **Swipe file**: a collection of interfaces, typography, colour palettes, and motions you love, with notes on *why*

**Anti-taste:** `div` soup · buttons that are links and links that are buttons · `!important` as conflict resolution · IDs for styling · deep nesting and 0-4-0 specificity · magic numbers (`top: 37px`) · fixed heights on text containers · `px` font sizes that ignore user settings · `user-scalable=no` · removing focus outlines without replacements · placeholder as label · animating layout properties · `transition: all` · parallax and scroll-jacking by default · carousels nobody asked for · five fonts and nine weights · pure-black shadows and pure-grey neutrals · colour as the only signal · CSS frameworks nobody on the team can read without the docs · dark mode by `filter: invert()` · lorem ipsum in "final" designs · decorative motion that ignores reduced-motion · copying a trendy aesthetic (glass, neumorphism, brutalism) without the judgement that made the original work

---

## PART 27 — Professional Growth [Lifelong]

- Separate the timescales: HTML semantics and the cascade compound over decades; layout algorithms and design fundamentals over a career; CSS features arrive yearly (and become permanent once shipped); frameworks and methodologies rotate every few years; aesthetic trends every season. Invest in that proportion
- Participation: file browser bugs with reduced test cases (engines fix well-reported bugs), comment on CSSWG issues (the working group reads them), contribute to MDN, write up techniques with demos, and give talks on something you built
- **Portfolio evidence that carries weight for designer-developers**: a personal site that is itself the proof (fast, accessible, beautiful, original), case studies showing *process* (problem → constraints → explorations → decision → result with numbers), a design system or component library with docs, recreations and experiments (CodePen collections with craft), an accessibility audit and fix, and open-source contributions
- Career shapes: frontend engineer, **design engineer / UX engineer** (Vercel, Linear, Stripe, Apple, Google style roles), design-systems engineer, creative developer (agencies, award-winning marketing sites, WebGL), accessibility specialist, email developer, UI/product designer who codes, developer advocate for the web platform, and freelancer or studio owner (where the full-stack HTML/CSS/backend breadth in this file is a business advantage)
- Interviews: build a component live (a modal, tabs, a responsive card grid) with accessibility and edge cases; explain the cascade, specificity, stacking contexts, and flex/grid algorithms; debug a broken layout; critique a design; talk through a portfolio piece's decisions; and design-system and architecture discussions
- Collaboration: working with designers (speak Figma, push back with prototypes, not opinions), with backend engineers (HTML contracts, forms, APIs), with content writers (real content early), and with accessibility and legal teams
- Staying current without churn: follow the platform (release notes, Baseline, Interop), try new features in demos before production, adopt them with fallbacks when they reach newly available, and keep one "platform-only" project where you test everything without a framework

---

## Capstone Projects

1. **A personal site as a manifesto** — semantic, fast (green field vitals), accessible (WCAG 2.2 AA verified with a screen reader), fluid type and space, dark mode done properly, cross-document view transitions, one signature interaction, a print stylesheet, and an RSS feed (Parts 2, 13–17, 21)
2. **A CSS layout and motion playground** — the twelve layout primitives, subgrid, anchor positioning, container and style queries, scroll-driven animations, and view transitions, each documented with the algorithm and a fallback (Parts 10–13, 16–17)
3. **A design system from tokens to package** — DTCG tokens → CSS custom properties for two brands and two modes, a layered native architecture, 25 accessible components on native elements, docs, visual and axe regression, and a matching Figma library (Parts 15, 18, 19, 24)
4. **A server-rendered web application with no client framework** — templates, forms with PRG and accessible server validation, sessions, SQLite, htmx or small scripts for enhancement, streaming, security headers, deployed and monitored (Parts 3, 22, 25)
5. **An award-grade marketing/story site** — art-directed images, kinetic typography, scrollytelling with native scroll-driven animations, a WebGL or SVG-filter hero with a static fallback, a full reduced-motion mode, and a performance budget met on a mid-range phone (Parts 4, 5, 14–17, 21)
6. **Five targets from one source** — web, print/PDF (Paged.js), HTML email, EPUB, and generated OG images from shared content and tokens (Part 23)
7. **An accessibility-first complex UI** — a data table with sorting, filtering, and pagination in the URL, a combobox, a dialog-based editor, and a multi-step form, audited with keyboard, screen readers, zoom, forced colours, and RTL (Parts 3, 7, 24)
8. **Recreation portfolio** — ten screens from world-class products recreated from screenshots, then each *redesigned* with a written rationale (Parts 18, 26)
9. **A hardened user-content platform** — comments and uploads with sanitisation, CSP with nonces, isolated upload origin, and a documented attack/defence lab (Part 25)
10. **Flagship** — a real product or client site designed and built end to end by you (brief, research, design in Figma, build, content, launch, measure, iterate) with the L18 web-engineering discipline for delivery and operation

---

## Resource Library

**Primary:** MDN (HTML, CSS, SVG, accessibility guides and references) · WHATWG HTML Living Standard · W3C CSS specifications (via the CSSWG drafts index) · SVG 2 and Filter Effects specs · WCAG 2.2 and Understanding WCAG · ARIA Authoring Practices Guide · web.dev *Learn HTML*, *Learn CSS*, *Learn Design*, *Learn Accessibility*, *Learn Forms*, *Learn Images* · Baseline, caniuse, and the Interop dashboard · the **MDN Curriculum** (the "core" front-end skill map, useful as a checklist against this file)

**Books:** *CSS: The Definitive Guide* (Meyer & Weyl) · *Every Layout* (Pickering & Bell) · *CSS Secrets* (Verou) · *Refactoring UI* (Wathan & Schoger) · *Inclusive Components* and *Inclusive Design Patterns* (Pickering) · *Form Design Patterns* (Adam Silver) · *Design for Hackers* (Kadavy) · *The Design of Everyday Things* (Norman) · *Don't Make Me Think* (Krug) · *Laws of UX* (Yablonski) · *The Elements of Typographic Style* (Bringhurst) · *Thinking with Type* (Lupton) · *Grid Systems in Graphic Design* (Müller-Brockmann) · *Interaction of Color* (Albers) · *Designing Interface Animation* (Val Head) · *Hypermedia Systems* (Gross, Stepinac & Akşimşek, free) · *Resilient Web Design* (Jeremy Keith, free) · *Atomic Design* (Brad Frost, free) · *SVG Animations* (Sarah Drasner) · *Practical Typography* (Butterick, free online)

**Courses and structured material:** **CSS for JavaScript Developers** and **Whimsical Animations** (Josh Comeau) · Kevin Powell's courses and YouTube · web.dev Learn paths · the MDN Curriculum and MDN Learn web development · The Odin Project (Foundations and Full Stack JavaScript paths) · freeCodeCamp Responsive Web Design certification · Harvard **CS50W** (Web Programming with Python and JavaScript) for the server side · Frontend Masters (CSS Grid & Flexbox, Web Components, Design for Developers, Advanced CSS) · Learn UI Design (Erik Kennedy) · Interaction Design Foundation courses · Google UX Design certificate for UX process · Deque University for accessibility · GSAP's learning centre and Codrops tutorials for creative motion · Every Layout's online edition · Piccalilli (Andy Bell) courses · Utopia.fyi for fluid scales · the GOV.UK Design System as a living pattern course

**Code and design to read:** Open Props · Pico CSS · Tailwind CSS source (the `@theme` and utilities layers) · the GOV.UK Frontend repository · Radix Themes and Radix Colors · Primer CSS · Every Layout primitives · modern CSS resets (Josh Comeau's, Andy Bell's) · the Chromium user-agent stylesheet (`html.css`) · CSS of sites like linear.app, stripe.com, vercel.com, apple.com (in DevTools) · Codrops demos · CodePen "picks" · GSAP showcase sites

**Tools to know cold:** Chrome, Firefox, and Safari DevTools (Styles, Computed, Layout overlays, Animations, Rendering, Accessibility, CSS Overview) · the Nu HTML Checker · axe DevTools · a screen reader (VoiceOver and NVDA) · Figma (auto layout, variables, Dev Mode) · Stylelint · Lightning CSS/PostCSS · SVGO/SVGOMG · Squoosh and an image CDN · Utopia calculators · an OKLCH picker (oklch.com) · Polypane (multi-viewport testing) · Playwright for screenshots · Litmus/Email on Acid for email · Paged.js for print

**Practice:** Frontend Mentor challenges (real designs with briefs) · CSSBattle (precision and golfing, then un-golf) · Flexbox Froggy, Grid Garden, Flexbox Zombies, CSS Diner (selectors) · Daily UI challenges · Codrops-style technique recreations · `T1-coding-html-css.md` for the structured programme

---

## Suggested Learning Order

1. **Part 0 → Part 2** — the document itself: parsing, semantics, and writing HTML that works unstyled
2. **Part 8 → Part 10** — the cascade, selectors, and the visual formatting model: the foundation that makes every later Part predictable
3. **Part 11 → Part 13** — flexbox, grid, and intrinsic responsive design; build the layout primitives
4. **Part 3 → Part 7** — forms, native elements, media, SVG, metadata, and accessible markup, applied to real pages
5. **Part 14 → Part 15** — typography and colour, alongside **Part 18** design fundamentals (these three together are where "it works" becomes "it's beautiful")
6. **Part 16 → Part 17** — motion, from micro-interactions to scroll and page transitions
7. **Part 19 → Part 20** — architecture, tokens, design systems, and the JavaScript boundary, once you have more than one page and more than one component
8. **Part 21 → Part 22** — performance and the server-rendered backend, when you ship something real
9. **Part 23 → Part 25** — other targets, resilience, and security, as projects demand them (security before anything accepts user content)
10. **Parts 26–27** — continuous: copywork weekly, one new CSS feature weekly, one unstyled review and one resize-and-break session monthly

**Rough scale (for planning, not promises):** getting fluent at building accessible, responsive pages from a design (steps 1–4) typically takes a few hundred focused hours. The difference between that and genuine designer-developer command (typography, colour, motion, design judgement, architecture, the server side, and resilience) is another several hundred hours plus a portfolio of shipped work. Most of it goes into Parts 10–18 and the recreation and build work in the T file, not into learning more properties.
