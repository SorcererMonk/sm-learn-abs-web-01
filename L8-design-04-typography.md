# Typography → The Voice of Words Made Visible
## L8: Design: 04 · Anatomy & Measure · Classification & Lineage · Legibility & Readability · Microtypography · Type Systems & Pairing · Type Technology · Expressive Type · Multiscript & Indian Type · Product Type & Numbers · Reading in Products · Bilingual Interfaces

> This is the **learning** file for typography: letterforms and their anatomy, how typefaces are classified and why their forms carry history and meaning, the science and craft of reading, the fine detail of setting text (spacing, figures, punctuation, OpenType), building type systems and pairings, the technology of fonts (formats, variable fonts, loading, licensing), expressive and display type, and designing across scripts, especially Devanagari and Tamil. It deliberately stops where page structure begins: grids and baseline systems are `L8-design-05-composition-layout.md`, long-form book and magazine setting is `L8-design-12-print-editorial.md`, interface text *content* is `L8-design-17-microcopy-ux-writing.md`, and CSS implementation is `L18-cs-design-engineering.md`. The training counterpart is `T8-design-04-typography.md`.
>
> **Currency stamp (September 2026):** **variable fonts** are the default for new type families, and the key axes are `wght`, `wdth`, `opsz`, `ital`/`slnt` plus custom axes like `GRAD`. CSS supports `font-optical-sizing`, `text-wrap: balance` (headings) and `text-wrap: pretty` (fewer orphans in paragraphs), `font-size-adjust` and `size-adjust` for fallback matching, and fluid type via `clamp()`. Adobe ended support for PostScript Type 1 fonts in January 2023. **Indian type** has matured fast: Indian Type Foundry's free **Fontshare** library, Ek Type's multi-script variable families (Mukta, Anek), Google's Noto, and Tiro Typeworks' Devanagari and Tamil for the Murty Classical Library mean there's no longer an excuse for bad Devanagari or Tamil typesetting.

---

## How To Use This Document

**Depth ladder:** **L1** Name it · **L2** Use it correctly · **L3** Choose it over alternatives · **L4** Explain the mechanism · **L5** Create a version from scratch · **L6** Teach it and critique misuse.

**Tier tags:** **[Core]** every designer · **[Deep]** senior depth · **[Frontier]** specialist or moving.

**Each Part closes with:** *Intuition anchors* · *Mastery checks* · *Analysis* · *Taste*.

**The typography-specific learning loop:**
1. **Set real text, never lorem ipsum.** Use the actual words, in the actual languages, at the actual lengths, including awkward ones (long German compounds, Tamil conjuncts, "₹1,23,456.78"). Test type on hostile strings, not on pangrams (`TD-03#27 · @thedesignely · DAEdI8wu2G1`).
2. **Judge type at its real size on its real device.** Specimen sheets flatter. A phone held at reading distance tells the truth (`TD-03#3 · @kalypsodesigns · DcvjFR0Emyy`). Print body text and read it on paper.
3. **One typeface a week, examined.** Name its classification, designer, year, x-height, apertures and best use. Fifty saved fonts teach nothing, and one studied font teaches a lot (`TD-03#20 · @uthinhpham · DTT124Vj-bP`).
4. **Zoom to 400% for the detail, stand back for the colour.** Typography works at two scales: the glyph and spacing (microtypography) and the grey "colour" of a text block (macrotypography). Check both every time.
5. **Letter by hand.** Trace and draw letterforms (Roman capitals, a Devanagari *ka*, a Tamil *zha*). Your hand learns stroke, contrast and proportion faster than your eye alone.
6. **Index type by feeling as well as by class.** Keep a personal library sorted by *register* (editorial, cool, luxurious, weird, playful, `TD-03#2 · @itsdesignare · Dc1KPbRGH4T`) *and* by classification. You'll search by the first and justify by the second.

**Relationship to the other files:**
- `L8-design-02-theory-principles.md` Part 2: hierarchy is mostly typographic. Part 3: optical alignment and overshoot come from type design.
- `L8-design-05-composition-layout.md`: the baseline grid and the measure-driven column come from here.
- `L18-cs-design-engineering.md`: web font loading, `clamp()` scales, variable-font CSS and type tokens.

---

## PART 0 — Foundations: Vocabulary, Anatomy & Measurement [Core]

- **What typography is:** the craft of giving language a visible form that serves its reading. Beatrice Warde's *The Crystal Goblet* (lecture, 1930) argued that **printing should be invisible**, a clear glass that shows the wine. That's the ideal for text meant to be read at length. Display, identity and poster typography deliberately make the goblet visible (Part 6). Know which goblet you're making.
- **Typeface vs font vs family:** a **typeface** is the design (Garamond). A **font** is historically one size and style of it in metal, and today one file or style (Garamond Italic). A **family** is the related set (roman, italic, weights, widths). A **glyph** is a drawn shape. A **character** is the abstract unit it represents (Unicode). One character can have several glyphs (alternate *a*, ligature *fi*), and one glyph can serve several characters.
- **Anatomy you must name without thinking:**
  - Lines: **baseline**, **x-height** (the height of lowercase *x*, the main driver of apparent size), **cap height**, **ascender**, **descender**, **overshoot** (round letters dip below the baseline and rise above the x-height to look aligned).
  - Stroke parts: **stem**, **bowl**, **counter** (enclosed or partly enclosed space), **aperture** (the opening of *c*, *e*, *a*, *s*; open apertures help legibility at small sizes), **serif** (bracketed, unbracketed, slab, hairline), **terminal** (ball, teardrop, flat), **spine**, **ear**, **link** and **loop** (two-storey *g*), **spur**, **crossbar**, **shoulder**.
  - **Stress/axis:** the angle of the thinnest parts, diagonal in humanist designs (from the broad-nib pen), vertical in rationalist designs.
  - **Contrast:** the difference between thick and thin strokes.
- **Measurement:** the **point** (digital/PostScript point = 1/72 inch), the **pica** (12 pt), the **em** (equal to the current font size, the basis of all relative spacing: 1em tracking unit = 1/1000 em in most tools), **px** and **rem** on the web (rem = root font size, usually 16px), **pt** on iOS and **dp/sp** on Android (sp respects user text-size settings). **Body size ≠ visible size.** Two fonts both at 16px can look very different because x-heights differ (Helvetica's is large, Garamond's small), so compare by x-height, not point size. CSS `font-size-adjust` matches fallbacks by x-height.
- **The "colour" of text:** a paragraph seen out of focus is a grey texture. Good setting produces an **even colour** with no dark clumps (tight pairs), light holes (loose spacing, rivers) or striping (too much leading). Typographers judge this by squinting, and so should you.
- **Text vs display:** **text type** is built for sustained reading at 8–14 pt (modest contrast, open apertures, generous spacing, sturdy serifs or none). **Display type** is built for large sizes and short bursts, and can be delicate, extreme, tight and characterful. Using a display face for body text, or a text face at 120 pt without tightening, are the two most common type crimes (`TD-03#10 · @nabhjpg · DcOMZYZTBUe`: display is judged on character, text on readability, so never mix the criteria).

**Intuition anchors**
- Typography is mostly the space between letters, words and lines. The letters are the easy part.
- If you can't name the part of a letter that bothers you, you can't choose a better typeface. Learn the anatomy first.

**Mastery checks**
- Label the anatomy of *Rag* and *ghostly* in a serif and a sans from memory (≥15 terms).
- Explain why two fonts at 16px can appear different in size and what CSS property compensates.
- Distinguish typeface, font, family, glyph and character with one example each.
- State Warde's argument and name one context where it's the wrong ideal.

**Analysis**
- Put five typefaces at 16px on one Figma frame (Inter, Georgia, Garamond, Futura, Mukta). Measure each x-height, then adjust sizes so the x-heights match *[Figma: White]*. Write which now looks "right" for body text and why (aperture, contrast, spacing).

**Taste**
- Learn to love the invisible parts: spacing, x-height, apertures, the grey of a paragraph. Anyone can pick a trendy display face. Setting a paragraph people forget they're reading is the craft.

---

## PART 1 — Classification & the Lineage of Letterforms [Core]

- **Why history matters in type:** letterforms carry the tools and cultures that made them. The broad-nib pen gave humanist stress. Copperplate engraving gave hairline contrast. Industrial signage gave slab serifs and grotesques. The Swiss objectivity programme gave the neo-grotesque. **A typeface's form is an argument about its era**, and it quietly carries that era's associations into your design.
- **The Latin lineage** (the minimum to know):
  - **Roman capitals:** the Trajan Column inscription (113 CE), with its serifs and proportions.
  - **Carolingian minuscule:** Charlemagne's scriptoria, c. 800, the ancestor of lowercase.
  - **Blackletter/Textura:** Gothic manuscripts. Gutenberg's 42-line Bible (c. 1455) was set in textura.
  - **Humanist/Venetian:** Nicolas Jenson (1470), and Aldus Manutius with punchcutter Francesco Griffo (*De Aetna* roman, 1495; the first italic, 1501).
  - **Old-style/Garalde:** Claude Garamont (1530s–40s), Caslon (England, 1720s).
  - **Transitional:** John Baskerville (1757): more contrast, vertical stress, smoother paper.
  - **Didone/Modern:** Didot and Bodoni (c. 1780s–1800): extreme contrast and hairline serifs, now the language of fashion mastheads (Vogue, Harper's Bazaar).
  - **Slab/Egyptian:** early 1800s industrial advertising. Clarendon (1845).
  - **Grotesque/Gothic sans:** Akzidenz-Grotesk (1898), Franklin Gothic (1902).
  - **Geometric sans:** Paul Renner's Futura (1927), built from circle, square and triangle, the Bauhaus aesthetic in type.
  - **Humanist sans:** Edward Johnston's London Underground type (1916), Eric Gill's Gill Sans (1928), Adrian Frutiger's Frutiger (1976, for Charles de Gaulle airport signage).
  - **Neo-grotesque:** Helvetica (Max Miedinger with Eduard Hoffmann, 1957, as Neue Haas Grotesk), Univers (Frutiger, 1957, the first family planned as a numbered system of weights and widths).
  - **Screen-era faces:** Matthew Carter's Verdana and Georgia (1996, drawn for pixels first); Inter (Rasmus Andersson, 2017, for UI; `TD-13#10 · @designwithrajatpatel · DcWJKooqG2S`); SF Pro (Apple, 2015); Roboto (Google, 2011).
- **Classification systems and their limits:** the **Vox-ATypI** system (Maximilien Vox, 1954; adopted by ATypI 1962) sorted type into humanist, garalde, réale, didone, mécane, lineale, incised, script, manual, blackletter and non-Latin. ATypI formally **de-adopted** it in 2021 as inadequate, especially for non-Latin scripts. Use the practical families (serif: old-style/transitional/didone/slab; sans: grotesque/neo-grotesque/geometric/humanist; plus script, display, mono) and remember that classification is a map, not a law.
- **Monospace:** every glyph the same width, from typewriters and terminals: Courier (1955), and modern coding faces like JetBrains Mono, Berkeley Mono and IBM Plex Mono. It's used for code and tabular alignment, and increasingly as a "technical" aesthetic.
- **Register: what forms connote** (conventions, not laws; `TD-03#29 · @reputeforge · C9U43CeSuZ0`). Old-style serif reads as literary, established, humane. Didone reads as fashion, luxury, drama. Slab as sturdy, industrial, friendly-American. Neo-grotesque as corporate, neutral, Swiss-rational. Geometric as modern, clean, "tech", sometimes cold. Humanist sans as friendly, readable, civic. Script as personal, festive or "luxury" (`TD-03#28 · @andrei.unlocked · C8r2NsDiIy1`: luxury = high contrast + wide spacing + restrained weight). **Helvetica isn't neutral. It's corporate-modernist authority rendered as geometry**, and that register is why governments, airlines and banks chose it.
- **Revivals and reinterpretations:** most "classic" faces you use are digital revivals (Adobe Garamond by Robert Slimbach, 1989; EB Garamond by Georg Duffner, free). Revival is interpretation: compare three "Garamonds" and they differ noticeably in x-height and weight. Know which revival you're using and why.

**Intuition anchors**
- Every typeface is a fossil of the tool and the ambition that made it. Read the fossil and you'll know what it will say in your design.
- There is no neutral typeface, only typefaces whose opinions you've stopped noticing.

**Mastery checks**
- Place Garamond, Baskerville, Bodoni, Clarendon, Akzidenz, Helvetica, Futura, Gill Sans, Frutiger and Inter on a timeline with their category and one defining feature each.
- Explain how the broad-nib pen produces diagonal stress and why didones have vertical stress.
- Explain why ATypI dropped Vox-ATypI and what that implies for classifying Devanagari.
- Argue for and against Helvetica for a legal-aid NGO's identity.

**Analysis**
- Take `TD-03#29` (font psychology via brand logos: Coca-Cola, Rolex, Dior, Google, Volvo). For each logo, name the classification and era its letterforms come from, then find one brand in the same category that uses the "opposite" register successfully and explain the move.

**Taste**
- Choose type by what it carries, not just by how it looks today. The face you pick for a law firm, a festival and a fintech should each come with a history you'd be glad to be associated with.

---

## PART 2 — Legibility, Readability & the Science of Reading [Core]

- **Legibility vs readability:** **legibility** is how easily individual characters are distinguished. It's a property of the typeface: x-height, apertures, counters, distinct forms for *Il1*, *O0*, *rn/m*, *cl/d*. **Readability** is how easily *text* is read over time. It's a property of the setting: size, measure, leading, spacing, contrast, alignment. A highly legible face can be set unreadably, and good setting rescues a lot.
- **How reading works** (bridge to 06): the eye moves in **saccades** (fast jumps of about 7–9 characters in English) between **fixations** (≈ 200–250 ms), with regressions (backward jumps) when text is hard. Only a small region around the fixation (the fovea, ~1–2°) is sharp. Parafoveal preview of the next word's length and first letters guides the next jump. **Word recognition is parallel letter recognition**: the older "word shape" (Bouma) theory, that we read whole outlines, is not supported. Kevin Larson's review for Microsoft, *The Science of Word Recognition* (2004), is the accessible summary. Practical consequence: **ALL-CAPS text is slower** mainly because it's unfamiliar and has less letter differentiation, not because it "lacks word shape". Short uppercase labels are fine, and paragraphs are not.
- **Serif vs sans on screens:** decades of studies show **no consistent legibility winner** once size, x-height and rendering are equal. High-resolution screens removed the old "serifs blur on screen" argument. Choose on register, x-height, spacing and quality, not on the folklore.
- **Size:** on the web **16px is the floor for body text** (the browser default, for good reason), with 17–20px common for long reading. Mobile body is 16–17pt (iOS body is 17pt at the default Dynamic Type size). Captions go down to 12–13px *only* in faces with large x-heights and open apertures. Print body is typically 9–12pt depending on the face and the reader's age.
- **Measure (line length):** the classic range is **45–75 characters per line, ~66 ideal** for a single column (Robert Bringhurst, *The Elements of Typographic Style*), and the web-spec post uses **50–60** (`TD-03#5 · @dailywebdesign · DcgRYHqgfvl`). Too long and the eye loses its return sweep. Too short and constant line breaks chop the phrasing and create ragged, hyphen-heavy text. CSS: `max-width: 65ch` is the single highest-value line of CSS in typography.
- **Leading (line-height):** **inverse to size**: body ≈ **1.4–1.6** (the spec gives 140–175% for 16–20px), headings ≈ **1.0–1.3** (100–130% for 24px+, `TD-03#5`). Longer measures need more leading. Large x-height faces need more leading than small x-height ones. Devanagari needs more leading than Latin (matras above and below). WCAG 1.4.12 (Text Spacing) requires layouts to survive user overrides of line-height 1.5, paragraph spacing 2×, letter-spacing 0.12em and word-spacing 0.16em, so never build layouts that break when text breathes.
- **Contrast and polarity** (bridge to 03 Part 5): 4.5:1 minimum, and extreme contrast (pure black on pure white on a bright screen) is slightly harsher than very dark grey on off-white for long reading. Dark mode needs lighter weights or grade adjustment, because light text on dark looks bolder. Variable fonts with a **GRAD** axis change weight without changing width, for exactly this.
- **Accessibility and special populations:** low vision needs larger size, stronger contrast and **reflow** without horizontal scrolling at 400% zoom (WCAG 1.4.10). **Dyslexia**: specialised "dyslexia fonts" (OpenDyslexic, Dyslexie) show **no reliable benefit** in controlled studies (e.g. Wery & Diliberto, 2017). What helps is size, generous spacing, short measures, left alignment and clear sans or serif faces with distinct letterforms. For children, single-storey *a* and *g* ("infant" forms) help early readers. For older readers, size and contrast matter most.
- **Alignment and readability:** **flush-left, ragged-right** is the default for screens and most text. **Justified** text needs good hyphenation and a long enough measure, or it produces **rivers** (vertical white channels) and uneven word spacing. Browsers now hyphenate with `hyphens: auto` plus a correct `lang` attribute, but still justify crudely compared with InDesign's paragraph composer. **Centred** text is for short display lines only. **Right-aligned** text suits short captions against a right edge and RTL scripts.

**Intuition anchors**
- Legibility is the font's job. Readability is yours.
- Readers never notice good line length and leading. They notice fatigue, and blame the content.

**Mastery checks**
- Distinguish legibility from readability with an example of a legible face set unreadably.
- Explain saccades and fixations and why all-caps paragraphs are slower (without invoking "word shape").
- State the measure and leading ranges for body text and explain why leading goes down as size goes up.
- Explain what WCAG 1.4.12 requires and what layout mistake it catches.

**Analysis**
- Take a long article on a news site you read and one on a site you find tiring. Measure characters per line, font size, line-height and contrast for both *[Figma: White, screenshot + measure]*. Write which variable explains most of the difference in fatigue, then fix the tiring one.

**Taste**
- Set body text as if someone will read it for an hour, because someone will. Generous size, a sane measure and calm leading are acts of respect, and readers feel them long before they could name them.

---

## PART 3 — Microtypography: Setting Text Properly [Core → Deep]

- **Kerning vs tracking:** **kerning** adjusts space between *specific pairs* (AV, To, Ty, "r." and so on). Fonts ship with **metric kerning** tables. **Optical kerning** (Adobe, Figma's text engine via features) computes spacing from shapes, which is useful for poorly kerned fonts and mixed-font settings. **Tracking** adjusts space *uniformly* across a range. The rule: **big type gets tighter, small type gets looser, caps always get looser** (`TD-03#5`: headings slightly negative, ALL CAPS positive). The spec's +1% for caps is a minimum. Short uppercase labels typically want +4–10%, depending on the face and size. Never track lowercase body text positively for "style": it breaks words into letters and slows reading. Train your spacing eye with Kern Type (`TD-10#12 · @itsdesignare · DcItQIqDZXv`).
- **Word spacing and rag:** in ragged text, word spacing stays constant. The **rag** (right edge) should undulate gently, without deep holes, long-short-long "staircases" or wedge shapes. Fix bad rags by editing line breaks in display text, adjusting hyphenation settings in body text, or tuning the measure. CSS `text-wrap: pretty` improves paragraph endings and `text-wrap: balance` evens heading lines.
- **Widows, orphans and runts:** terms differ between traditions. Practically: avoid a **single word alone on the last line** of a paragraph (a runt), and avoid a paragraph's **first or last line stranded** at the top or bottom of a column or page. In UI headings and cards, a single dangling word ("Book your / class") is the most visible version. Use balance or a non-breaking space.
- **Punctuation that marks a professional:**
  - **Real quotes and apostrophes** (“ ” ‘ ’), not straight "typewriter" quotes or primes (′ ″ for feet/inches and minutes/seconds).
  - **Dashes:** hyphen `-` for compounds and line breaks; **en dash** `–` for ranges (9–5, pp. 12–18) and some compounds; **em dash** `—` for breaks in thought (set closed in American style, spaced en dashes in British style, but be consistent); **minus** `−` for maths.
  - **Ellipsis** `…` as one glyph.
  - **Multiplication** `×`, not *x*, in dimensions.
  - **Non-breaking spaces** between numbers and units (10 kg), in "₹ 500" or "Rs. 500" styles, and in names you don't want split.
  - **Hanging punctuation:** quotes and bullets pushed into the margin so the text edge stays optically straight (`hanging-punctuation` works only in Safari, so build it manually for display).
- **Figures (numerals):** **lining** (cap-height, uniform) vs **old-style** (varying heights, like lowercase, blending into running text). **Proportional** (varied widths, for text) vs **tabular** (equal widths, so columns align: prices, tables, timers, anything that updates). **Always use tabular lining figures in tables, dashboards and counters**, or numbers jitter when they change. Also available: **slashed zero**, **fractions** (`frac`), **superiors/inferiors**, **case-sensitive forms** (`case`, which raises hyphens and brackets to sit with capitals). Indian numbering needs the **lakh/crore grouping** (1,23,45,678) where the audience expects it (`Intl.NumberFormat('en-IN')` in code).
- **Small caps and caps:** **true small caps** (`smcp`) are drawn at about x-height with matching stroke weight. **Fake small caps** (scaled-down capitals) look thin and spindly, so never use them. Use small caps for acronyms in running text (NASA, UNESCO) so they don't shout, and for eyebrows and labels with tracking.
- **Ligatures and OpenType features:** standard ligatures (`liga`: fi, fl) prevent collisions. Discretionary ligatures (`dlig`) are decorative. Also: **stylistic sets** (`ss01`–`ss20`: alternate *a*, *g*, arrows), **contextual alternates** (`calt`, essential for scripts and many Devanagari fonts), **kerning** (`kern`), **tabular numbers** (`tnum`), **old-style numbers** (`onum`), **fractions** (`frac`), **case** (`case`). In Figma: *Type details → the "…" / OpenType features panel*. In CSS: `font-feature-settings` or the higher-level `font-variant-*` properties.
- **Italic vs oblique vs synthetic:** a **true italic** is a separate design with cursive forms (single-storey *a*, a different *f*). An **oblique** is a slanted roman (common in grotesques). **Synthetic** italic or bold generated by software is always wrong. If a font lacks the style, choose another font.
- **Emphasis in text:** italic for emphasis in running text, bold for scanning (keywords, labels), and **never underline for emphasis on screens** (underline means link). Never combine several emphasis methods on one word (bold + italic + colour + caps).
- **Paragraphs:** indent **or** space between paragraphs, never both. Book tradition uses first-line indents (about 1 em, no indent after headings). The web uses spacing (about 0.75–1 × line-height). Lists need hanging indents so bullets sit outside the text edge.

**Intuition anchors**
- Microtypography is invisible when right and screams "amateur" when wrong: straight quotes, fake small caps and jittering numbers are read as carelessness, not style.
- Space between letters is a volume to balance, not a distance to measure.

**Mastery checks**
- Explain the difference between kerning and tracking and give the direction of tracking for 72pt headlines, 11pt captions and uppercase labels.
- List the uses of hyphen, en dash, em dash and minus, with an example each.
- Explain tabular vs proportional figures and name three UI contexts that require tabular.
- Explain why fake small caps and synthetic italics look wrong.

**Analysis**
- Take a real UI (a banking app statement screen or a sports scoreboard). List every microtypographic error (quotes, dashes, figure style, jittering numbers, tracking on caps, orphans), then rebuild one screen correctly *[Figma: White, OpenType panel]*.

**Taste**
- Care about the characters nobody asked you about: the apostrophe, the en dash, the tabular zero. Readers can't name these details, but they can tell when they've been handled.

---

## PART 4 — Hierarchy, Type Systems & Pairing [Core]

- **A type system is a small set of decisions reused everywhere:** a scale (sizes), a weight set, line-heights per size, tracking per size, a colour/opacity set for text, and paragraph and list rules. Name the styles by *role* (`display`, `title-1`, `title-2`, `body`, `body-strong`, `caption`, `label`, `mono`), not by size ("24 bold"), so the system can change without renaming (bridge to 14 and L18).
- **Scales:** a **modular scale** (ratio 1.125–1.333 for UI, 1.333–1.618 for editorial and marketing) from a 16px base gives harmonious sizes (02 Part 4). Web spec example: **H1 56 / H2 32 / body 16** with weights **400 body / 500 accent / 600 heading** (`TD-03#5`). **Fluid type** uses `clamp(min, preferred-vw, max)` to scale headings between breakpoints while keeping body stable. Keep **5–7 sizes total** in a product. Every extra size is a new decision users have to parse.
- **Hierarchy tools, in order of subtlety:** size → weight → case (caps/small caps with tracking) → colour/opacity (secondary text at a lighter grey that still passes contrast) → spacing (space above a heading > below it, so the heading belongs to what follows, a proximity rule) → position → typeface change. **Pro rule: create hierarchy with as few typefaces and sizes as possible.** One family with three weights can build a whole product.
- **Pairing:** the rule behind almost every good pairing is **one expressive + one neutral** (`TD-03#26 · @themoidesign · DBOhz4RISDH`: Playfair + Hanken Grotesk, for example). Three reliable strategies:
  1. **Contrast of classification** with shared proportions: a humanist serif with a humanist sans, since similar x-heights and stroke logic let them sit together.
  2. **Superfamilies:** one designer, serif and sans drawn together (IBM Plex, Source Serif/Sans, Merriweather/Merriweather Sans, Noto Serif/Sans, Mukta + Mukta Vaani for Gujarati). The safest route to harmony.
  3. **One family only**, with hierarchy through weight and size (the Swiss and Linear/Stripe approach).

  Avoid two faces that are *almost* the same (two geometric sans), which reads as a mistake, and more than two text families in one product.
- **Choosing a typeface, the practical protocol:** (1) script and language support (does it have Devanagari/Tamil, ₹, the Indian digits if needed?); (2) the job (text or display, UI or editorial); (3) register (the mood index, `TD-03#2`); (4) the family's depth (weights, italics, small caps, tabular figures, optical sizes); (5) quality (spacing, kerning, hinting, rendering at small sizes, tested on hostile strings); (6) licence and cost (Part 5); (7) performance (file size, variable vs static). **Most fonts fail at step 1 or step 4, not at taste.**
- **UI typography specifics:** system fonts (SF Pro on Apple, Roboto/Google Sans on Android, Segoe UI Variable on Windows) are free, fast, familiar and have **optical sizes**. SF automatically shifts from *Text* to *Display* cuts around 20pt with different spacing, and variable fonts do this with the `opsz` axis. Respect **Dynamic Type** (iOS) and **sp** units (Android): user text-size settings are accessibility, so designs must reflow when text grows 200%. Truncate with care (ellipsis plus the full text available). Label type at 11–13px needs a UI-grade face (Inter, SF, Roboto, IBM Plex Sans) with open apertures.
- **Font psychology, applied carefully:** serif → authority, establishment. Sans → modern, corporate, sensible. Script → human, festive, personal (`TD-03#29`). These are **starting conventions to confirm or subvert**, and culture and context override them. A wide/techno sans is itself a current register, not a neutral choice (`TD-03#19 · @marcelodesignxh · DTlhLfQD6ef`).
- **Building a personal type library:** curate a small library *before* you need it: 3 text serifs, 3 text sans, 2 monos, 10 display faces, 3 Devanagari, 2 Tamil. Each should have its licence noted and a real sample set in your own work. Free sources with good quality: Google Fonts, **Fontshare** (ITF, free commercial use: Erode, Sentient, Switzer, Satoshi, General Sans, Chillax, Panchang, Khand), Uncut, Velvetyne (libre, experimental), Collletttivo, and brand-open-sourced families (Stack Sans, Wend Sans, Zalando Sans, Google Sans Flex, TikTok Sans; `TD-03#8 · @kalypsodesigns · DcYOxNaEhfW`). Discovery tools: Fonts In Use (type in real work, credited), 72pt (`TD-03#3`), Typewolf.

**Intuition anchors**
- A typographic system is judged by how few decisions it needs, not how many styles it offers.
- If you need a third typeface to create hierarchy, you haven't used the first two properly.

**Mastery checks**
- Build a 6-style UI type system from one family with names, sizes, weights, line-heights and tracking, from memory.
- Explain three pairing strategies and give a concrete pair for each.
- Explain optical sizes and how SF Pro and variable `opsz` fonts implement them.
- Walk through the seven-step typeface-choice protocol for a Hindi–English legal-aid app.

**Analysis**
- Reverse-engineer the type system of one product you admire (Linear, Stripe, Apple Notes, *The Hindu* website): list every text style you can find, its size, weight, line-height and role. Count them. Propose a reduced system and explain what you merged.

**Taste**
- Aim for fewer styles, better used. Great type systems feel inevitable because every size, weight and space has a job, and none is there because the designer couldn't decide.

---

## PART 5 — Type Technology: Formats, Variable Fonts, Loading & Licensing [Core → Deep]

- **Formats, briefly:** **PostScript Type 1** (Adobe, 1984–85: the desktop publishing revolution, and **unsupported in Adobe apps since January 2023**; convert or replace old Type 1 fonts). **TrueType** (Apple, 1991, with quadratic curves and sophisticated **hinting** for low-resolution screens). **OpenType** (Microsoft + Adobe, 1996–97): one container for TrueType or PostScript (CFF) outlines, Unicode, and **layout features** (ligatures, alternates, script shaping). **WOFF/WOFF2** (W3C Recommendations 2012/2018): compressed web wrappers. Serve **WOFF2** on the web, since it's supported everywhere and ~30% smaller than WOFF.
- **Variable fonts** (OpenType 1.8, 2016, a joint Adobe/Apple/Google/Microsoft effort): one file containing a **design space** along axes. Registered axes are **`wght`** (weight), **`wdth`** (width), **`opsz`** (optical size), **`ital`** and **`slnt`**. Custom axes (uppercase tags) include **`GRAD`** (grade: weight change without width change, ideal for dark mode or hover), `XTRA`/`YOPQ` (parametric), and expressive axes (Recursive's `CASL` casualness, Fraunces' `SOFT` and `WONK`, Google Sans Flex's `ROND`). Benefits: one file for all weights, **intermediate weights** (e.g. 450 for body on dark), responsive width and optical size, and animation (kinetic type, `TD-03#27`: see axes move at vartype.com). Costs: the file can be large if you don't subset, and some tools handle axes poorly (Figma supports variable-font axes in the type panel).
- **Web font loading** (implementation in L18): the flash problems are **FOIT** (flash of invisible text: blank until the font loads) and **FOUT** (flash of unstyled text: fallback, then a swap). Use `font-display: swap` for text (accept FOUT) and `optional` for non-critical display faces. **Preload** the one or two critical font files. **Subset** to needed characters (Latin + Devanagari subsets via `unicode-range`). **Match fallback metrics** (`size-adjust`, `ascent-override`, `descent-override`) so the swap causes no layout shift (CLS). Self-host rather than relying on third-party CDNs for privacy and performance. **Budget:** ~2–3 font files, <100 KB total for critical text, is a sane target.
- **Rendering:** high-DPI screens made hinting largely irrelevant on phones and Macs. Windows at 100% scaling still benefits from well-hinted fonts. Text on dark renders heavier, so compensate with weight or grade. Transparent text over images needs a scrim or a shadow to hold contrast (bridge to 03).
- **Licensing, the part designers get sued for:** a font is **software under licence**, not a free asset. Licence types: **desktop** (install and make static images, print), **web** (embed via `@font-face`, often priced by page views), **app** (embed in a mobile/desktop app), **ePub**, **broadcast/video**, **logo/trademark** (some licences restrict using the font in a registered logo), **server/SaaS** (fonts used to generate user content). **SIL Open Font License (OFL)** fonts (most of Google Fonts) are free for all uses including commercial, but you can't sell the font itself. Fontshare fonts are free for commercial use under ITF's licence. Many "free" fonts on aggregator sites are **free for personal use only**. **Always read the actual licence, not the price** (`TD-03#21 · @designbyanishka · DKHj9vuzAPe`; Font Squirrel filters by licence). This matters for your IPR work too: typeface *designs* get weak copyright protection in many jurisdictions, but **font software is protected as a computer program**, and trade-marked font names are protected separately.
- **Tools of type design** (for Part 6 and later lettering work): **Glyphs** (Mac, the industry standard for new type), **FontLab 8**, **RoboFont**, the free **FontForge**, and **Figma** for lettering and logotype sketches before moving to a font editor.

**Intuition anchors**
- A font file is code with a licence attached. Treat it with the same care as any dependency you ship.
- Variable fonts turn weight and width from fixed choices into continuous controls. Use that to tune, not to show off.

**Mastery checks**
- Explain OpenType vs TrueType vs WOFF2, and why Type 1 fonts are a problem today.
- Name the five registered variable axes and one custom axis, and give a design use for GRAD.
- Explain FOIT vs FOUT, `font-display` choices, and how `size-adjust` prevents layout shift.
- Explain the licence types, and what OFL permits and forbids.

**Analysis**
- Audit a website you know (your university's, or EcoTrace's landing page) in Chrome DevTools → Network → Font: list every font file, its size, format and whether it's subset. Propose a leaner setup and estimate the KB saved. Check each font's licence for web use.

**Taste**
- Respect the typeface designer's work. Pay for fonts you use commercially, credit free ones, and learn the licences. Type designers spend years on a family, and a profession that pirates its own materials doesn't deserve its clients' respect.

---

## PART 6 — Expressive & Display Typography [Core → Deep]

- **When type becomes image:** on posters, covers, identities, title sequences and hero sections, type is *seen* before it's read. The criteria change: character, rhythm, silhouette, scale contrast and interplay with image replace reading comfort. **Display type is judged on character, text type on readability. Never mix the criteria** (`TD-03#10`).
- **Expressive tools:**
  - Extreme **scale contrast** (a 400pt word beside 9pt captions).
  - **Tight tracking and leading** for dense display blocks (negative leading with interlocking ascenders and descenders).
  - **Stacking and interlocking.**
  - **Weight and width contrast** within one variable family.
  - **Rotation and path type.**
  - **Crop and bleed:** letters cut by the frame still read by closure (02 Part 1).
  - **Overlap with image:** text behind a subject's head, knockouts, masks.
  - **Repetition:** a word repeated as texture.
  - **Mixed faces** as a deliberate clash.
  - **Colour and texture** in letterforms.
- **Trend directions worth reading** (`TD-03#4 · @aldasbrand · DccEKUzmk_I`, a 20-slide report): (1) the letter as graphic art (letterforms behaving like illustration), (2) dynamic, extreme proportions (ultra-wide and ultra-condensed in one system), (3) the italic as protagonist. Also **wobbly, hand-cut display faces as a reaction to AI polish** (`TD-03#10`). Trace every trend to its source (01 Part 3), and use it knowingly or not at all.
- **Fonts that are almost logos:** some display faces are so characterful that setting a word *is* the wordmark (`TD-03#9 · @nabhjpg · DcTfBSGTP6u`; `TD-03#21`; `TD-03#23 · @ui.johnson · DIOGTo1gChO`; `TD-03#24 · @dope.motions · DIQ7uUJNa9S`). It's a fast route for social content and a trap for real identities: **anyone can buy the same font**, so the logo isn't ownable. Real wordmarks are customised (modified letters, custom ligatures, adjusted spacing) or fully lettered (bridge to 10).
- **Lettering vs type vs calligraphy:** **calligraphy** is writing with a tool in one pass. **Lettering** is drawing letters for one specific use (a logo, a book cover, a hand-painted sign), and it's composed and redrawn. **Type** is a reusable system of letters. Each needs different skills. Designers should be competent at lettering for identity work and at least literate in calligraphy (broad-nib Roman and italic, plus Devanagari with a flat reed), because it explains the logic of stroke contrast.
- **Type as argument:** a typeface can be criticism. *Hellcare Regular* (Parker Jones & Rajshree Saraf, W+K, 2026) makes illegibility a deliberate indictment: *"Illegibility isn't random when it's built into a whole system. It's a choice"* (`TD-03#16 · @alexmesherina · Dak19unt5dJ`). This is the model for a portfolio piece with a real argument behind it.
- **Generative and systemic type:** build the tool, not the artefact. A custom pixel-type generator where "the pixel" can be any tile produces unlimited on-system variation (`TD-03#14 · @antoncreations · DbS-ypuskCw`). Designing a typeface from a sound translates a non-visual source into form (`TD-03#6 · @studiopatrickaere · DcspTF-MQWA`). Variable fonts animated by data, scroll or audio are a live frontier (bridge to 18, 30).
- **Experimental web type:** open-source tools like *pretext* treat text as physical material (flowing around objects, dissolving into particles, reassembling), which is spectacular for display. **Never do this to text someone has to read** (`TD-03#7 · @ux.wheee · Db7qBbXzVWU`). The web's 30-year multi-column text problem (`TD-02#36 · @thevarunmayya · DWjhZLnAWce`) shows that ordinary text layout on screens is still unsolved in places.
- **Vernacular and hand-painted lettering:** Indian truck art ("Horn OK Please"), shop fascias, Bollywood poster lettering and the hand-painted signage tradition are a rich, fading vocabulary. Hanif Kureshi's *HandpaintedType* project (2010s) digitised the lettering of Indian sign painters into fonts. **Study it as craft, not as kitsch.** Much of it is extraordinarily skilled construction.

**Intuition anchors**
- Display typography is about the shape of words, text typography is about the absence of friction. A designer who can only do one is half a typographer.
- If the display font is doing all the work, the layout isn't doing any.

**Mastery checks**
- List eight expressive typographic tools and one poster that uses each.
- Explain why a "font that looks like a logo" is a weak identity and what makes a wordmark ownable.
- Distinguish calligraphy, lettering and type, with the skills each needs.
- Explain the argument *Hellcare Regular* makes and how its form carries it.

**Analysis**
- Take three posters from `TD-07` that use type as image. For each, name the expressive tools used, the one rule of text typography it breaks, and why the break works at poster scale but would fail in a paragraph.

**Taste**
- Be conservative with text and brave with display. The same designer should be able to set a quiet, perfect paragraph and then make a headline that nearly shouts off the page. Knowing which moment calls for which is the job.

---

## PART 7 — Multiscript & Indian Typography [Core → Deep]

- **Why this matters to you specifically:** you'll design for Indian users, bilingual legal and government contexts, and products where Hindi, Tamil and English share a screen. Most Western type education ignores this, so learning it properly is a durable edge.
- **Scripts are not fonts:** Latin, Devanagari (Hindi, Marathi, Sanskrit, Nepali), Tamil, Bengali, Gujarati, Gurmukhi, Kannada, Telugu, Malayalam and Odia are distinct writing systems. Most Indic scripts are **abugidas**: consonant letters carry an inherent vowel (*a*), modified by **vowel signs (matras)** placed above, below, before or after, with **conjuncts** where consonants combine (half-forms, stacked forms, true ligatures like क्ष, त्र, ज्ञ). Correct rendering needs a **shaping engine** (HarfBuzz, DirectWrite, CoreText) and fonts with proper OpenType tables. Figma and browsers shape correctly. **Adobe apps need the World-Ready (South Asian) paragraph composer switched on** or Devanagari breaks. Old legacy fonts like **Kruti Dev** map Devanagari shapes onto Latin code points: they look right but break search, copy-paste, screen readers and archives. They're still common in Indian government typing, so **insist on Unicode**.
- **Devanagari specifics:**
  - The **shirorekha** (headline) joins letters into words, which makes it the structural key of the script (`TD-03#17 · @suki_unibrow · DSXkPv6iMYg`).
  - **Never letter-space Devanagari**, because it breaks the headline.
  - **No case:** hierarchy comes from size, weight, colour and space. Uppercase-style labels don't exist.
  - **No true italic tradition:** slanted "italic" Devanagari is an import, so emphasise with weight or colour.
  - **Vertical proportions:** Devanagari at the same point size as Latin usually looks **smaller**, because much of its body sits below the headline and between matras. In bilingual settings, scale it roughly **10–20% up**, or choose a family designed as a pair (Mukta, Hind, Poppins, Noto, Anek) so the shirorekha sits near Latin x-height or cap-height as designed.
  - **Leading:** needs ~1.5–1.8 because of top and bottom matras.
  - **Numerals:** Devanagari digits (०१२३) or Latin digits, depending on context and audience (most Hindi UIs use Latin digits today).
- **Tamil specifics:** no headline. Rounded, often wide letterforms. Long agglutinative words (lines break less often, so a measure in "characters" behaves differently). **Tamil strings often run substantially longer than their English source**, so UI localisation needs flexible containers. Distinctive letters like ழ (zha) must render correctly. Pair Tamil with Latin by matching weight and colour, not shape. Tamil also has a strong tradition of printing and film-poster lettering. Some of the earliest printing in any Indian script was Tamil: *Thambiran Vanakkam* (1578), printed by Portuguese Jesuits.
- **History to know:** Charles Wilkins and the punchcutter **Panchanan Karmakar** (the first Bengali types, 1778, then Devanagari) → the Serampore Mission Press (early 1800s, dozens of Indian scripts) → the Linotype and Monotype eras, with Fiona Ross's work on Indian scripts at Linotype (1970s–90s) → digital pioneers like **R.K. Joshi** (calligrapher and type designer, IDC IIT Bombay) and **Mahendra Patel** → the 2010s renaissance: **Indian Type Foundry** (Satya Rajpurohit and Peter Biľak, 2009; later the free Fontshare library), **Ek Type** (Mumbai: Mukta, Baloo, Anek), Google's **Noto** ("no tofu", every script), Tiro Typeworks' Indic faces for the Murty Classical Library, and preservation projects like the **Typecraft Initiative** (`TD-03#17`: photograph vernacular signage → extract the logic → digitise → release).
- **Indian display and vernacular type:** free Devanagari/Latin display faces set over culturally matched photography (`TD-03#1 · @itsdesignare · DcxgdljDawi`: Rangeela, Bachpan in Mukta, Kaarigari, Samarkan). Hindi display posters (`TD-03#12 · @divein.art · DbvV7VQkzH2`: Mohini, Komal, Sajna, Kissa). Samarkan is the classic "Indian-flavoured Latin" face, and it's a **cliché to avoid** in serious work: Latin letters dressed as Devanagari read as exoticism, not as India.
- **Other script families, briefly:** **RTL** (Arabic, Urdu, Hebrew): mirrored layouts, contextual letter shaping, Urdu's Nastaliq style with its diagonal baseline. **CJK**: thousands of glyphs, square em-box design, vertical setting, huge files that need subsetting. **Mixed-script principle:** harmonise **colour** (stroke weight and density), **vertical rhythm** and **register**, not letter shapes.

**Intuition anchors**
- In multiscript design the question isn't "do these fonts match?" but "do these scripts sit on the same page as equals?"
- If your bilingual layout only looks good in English, it's an English layout with a translation stuck to it.

**Mastery checks**
- Explain abugida, matra, conjunct and shirorekha with examples in Devanagari.
- Give four Devanagari typesetting rules (no tracking, no case, leading, size compensation) and why each exists.
- Explain the Kruti Dev problem and why Unicode matters for legal archives and accessibility.
- Name five Indian type foundries or projects and one family from each.

**Analysis**
- Take a bilingual (Hindi–English) government notice or a bilingual product screen (IRCTC, a bank app). Critique its multiscript typography: size balance, headline alignment, leading, legacy vs Unicode, register mismatch. Redesign one section *[Figma: White]* with Mukta or Noto Sans Devanagari + a matched Latin.

**Taste**
- Give every script the respect of a native reader. Hire, ask or learn from people who read it daily, and never let a script be the decorative afterthought in someone's layout, including your own.

---

## PART 8 — History & Masters of Typography [Core → Deep]

- **The masters and what each understood:**
  - **Gutenberg** (c. 1450s): the system (movable type, adjustable mould, oil-based ink, press). Typography was a *technology* from day one.
  - **Aldus Manutius** (Venice, 1490s–1515): portable books, the italic, the modern book form.
  - **Claude Garamont** (1530s–60s) and **William Caslon** (1720s): text faces so well balanced they are still revived.
  - **John Baskerville** (1757): he improved paper, ink *and* type together. Quality is systemic.
  - **Giambattista Bodoni** (*Manuale Tipografico*, 1818): contrast as spectacle.
  - **William Morris** (Kelmscott Press, 1891): the Arts & Crafts revolt against degraded industrial printing. The book as a whole object.
  - **Edward Johnston** (London Underground, 1916) and **Eric Gill** (Gill Sans, 1928): the humanist sans, a public typography for a modern city.
  - **Jan Tschichold:** *Die neue Typographie* (1928) demanded asymmetry, sans serif and functional hierarchy. He later **recanted** its dogmatism, returned to classical book typography, and wrote Penguin's *Composition Rules* (1947–49). Both halves are lessons.
  - **Stanley Morison and Beatrice Warde:** Times New Roman (1932) and *The Crystal Goblet*. Type as servant.
  - **Paul Renner** (Futura, 1927) and **Adrian Frutiger** (Univers 1957, Frutiger 1976): rational systems of weights and the legibility of signage.
  - **Hermann Zapf** (Palatino 1948, Optima 1958) and **Matthew Carter** (Bell Centennial 1978 for phone books; Verdana and Georgia 1996 for screens): **type designed for its medium's constraints.**
  - **Wim Crouwel** (*New Alphabet*, 1967, for CRT screens) and **Zuzana Licko** (Emigre, 1984–2005, bitmap faces for the early Mac): *"We read best what we read most"*, legibility as familiarity, not essence.
  - **Robert Bringhurst** (*The Elements of Typographic Style*, 1992): the modern bible. **Ellen Lupton** (*Thinking with Type*, 2004; 3rd ed. 2024): the modern textbook. **Matthew Butterick** (*Practical Typography*, free online): the lawyer-typographer, the most relevant model for you, since he writes typography for legal documents.
  - **Rasmus Andersson** (Inter), **Tobias Frere-Jones** (Gotham, Retina), **Erik Spiekermann** (FF Meta, DB), **Paula Scher** (typographic identity), **Mike Abbink** (IBM Plex, 2017, with Bold Monday: a corporate superfamily later extended to Devanagari and other scripts), **Indian:** R.K. Joshi, Mahendra Patel, Satya Rajpurohit, Girish Dalvi and Sarang Kulkarni (Ek Type), Hanif Kureshi.
  - **Reading researchers:** Kevin Larson (Part 2), **Sofie Beier** (*Reading Letters: Designing for Legibility*, 2012), and Nielsen Norman Group's eye-tracking work (Part 10).
- **Legal typography, your bridge:** court filings, statutes and contracts are typography with consequences. Butterick's *Typography for Lawyers* (2010; 2nd ed. 2015) shows how bad defaults (Times New Roman, 12pt, double spacing, underlines, all-caps clauses) make legal documents harder to read, and how many courts' formatting rules still encode typewriter habits. The US Seventh Circuit's typography guidance is a rare court-authored example of good practice. This is a live niche where your two disciplines meet.

**Intuition anchors**
- Every generation of typographers has fought the same fight on a new medium: make the new technology serve the reader. You're fighting it on screens, variable fonts and AI-generated text.

**Mastery checks**
- Name ten typographers, what each contributed, and the medium constraint each was solving.
- Explain Tschichold's two phases and what his recantation teaches about dogma.
- Explain Licko's claim "we read best what we read most" and its implication for legibility research.

**Analysis**
- Take a judgment from an Indian High Court or the Supreme Court website (PDF) and a page of Butterick's *Typography for Lawyers*. List ten typographic problems in the judgment and redesign one page *[Figma: White]* following Butterick, keeping court conventions where they are functional.

**Taste**
- Study the masters for their constraints, not their styles. Carter designed for phone books and pixels and Johnston for moving trains. Name your medium's constraints and design for them the way they did.

---

## PART 9 — Type in Products: UI Scales, Numbers & Dense Data [Core → Deep]

- **Product type has two jobs: reading and operating.** A compliance tool is mostly operating (scanning tables, comparing figures, filling forms), and its scale, base size and figures should follow that job.
- **Worked decision: EcoTrace's base size.** Options: (A) 16px everywhere, the reading default from Part 2; (B) 14px for tables, forms and dense panels, 16px for help and reading text; (C) a user-selectable density. Criteria: rows visible on a 1366×768 office laptop, legibility for users in their fifties, and consistency. **Choose B, with C later** as a table density toggle (14 Part 10); IBM's Carbon system makes the same compact/reading split. **Consequences:** 14px needs a large-x-height UI face, and 12px is allowed only for tertiary metadata, never for a value someone acts on.
- **A tight ratio for tools.** Product screens keep many levels close together, so use 1.125–1.2, not the 1.333+ of editorial pages (Part 4). A workable EcoTrace scale: 12 / 14 / 16 / 20 / 24 / 32 px, with line-heights 16 / 20 / 24 / 28 / 32 / 40 on a 4px grid.
- **Numbers are the content** (Part 3 covers figure styles):
  - **Tabular lining figures** in every table, KPI tile and counter; **right-align** numeric columns and keep decimal places consistent in a column so the points line up.
  - **Units in the header** ("Emissions (tCO₂e)"), not repeated in every cell. Check the font has the subscript ₂ (U+2082); a fallback glyph looks patched.
  - **Grouping by audience:** lakh and crore (`en-IN`: 1,23,45,678) for Indian SMEs, millions for international readers, tied to the locale setting.
  - **A true minus sign** (−, U+2212) or accounting parentheses for negatives, never a hyphen, which is shorter and misaligns.
  - **The ₹ sign** entered Unicode in 2010, and some fonts still lack it, so the browser substitutes one at the wrong weight. Test it in every face you ship.
- **Identifiers are read, compared and read aloud.** A GSTIN has 15 characters, a CIN 21, a PAN 10, mixing letters and digits. Use a face that separates 0/O and 1/I/l (a slashed zero via `zero`, or a monospace), and never insert display spaces into a value users will copy.
- **Big numbers on dashboards.** KPI figures are display type: tighten tracking, keep tabular figures if they update, and show compact forms ("₹12.4 L", "1.2 Cr") with the exact value on tap. An overseas auditor may not read "L" and "Cr".
- **Long names.** Indian company names run long ("Shree Venkateshwara Textiles Private Limited"). Wrap to two lines in tables, truncate only in narrow chips, and never cut the legal suffix where identity matters.
- **Worked decision: Meridian UI's default font.** Options: bundle Inter (consistent metrics and figure features, but a file to load); use the system stack (free and native, but features and Devanagari fallback vary by OS); or require a token with no default. **Choose a token (`--font-sans`) defaulting to the system stack, with Inter documented as the recommended option**, and forbid fixed text heights in components. **Consequence:** screenshot-test components in at least three fonts; a library that only works in its demo font is broken.

**Intuition anchors**
- In a data product, a misaligned or jittering number is a bug, not a style issue.
- Size for the job users do most, and never let the smallest text be the thing they misread.

**Mastery checks**
- Justify EcoTrace's 14/16px split and state the limits it imposes on the smallest text.
- List five number-setting rules for a financial or emissions table.
- Explain how to set GSTINs and CINs so users can compare them without error.
- Argue for and against bundling a font in a public component library.

**Analysis**
- Rebuild a 12-row EcoTrace supplier table twice *[Figma: Yellow, OpenType panel]*, with defaults and with every rule above. Have two people find the largest value and read a GSTIN aloud from each, and log time and errors.

**Taste**
- Treat numbers as the most important text in a data product. Aligned, correctly signed figures look like competence.

---

## PART 10 — How People Read Products: Scanning, Phones & Indian Readers [Core → Deep]

- **Users scan before they read.** Nielsen's analysis of browsing data (2008) estimated that people read about a fifth of the words on an average web page. NN/g's eye-tracking found the **F-pattern** (2006) and later named other patterns (2017), including the **layer-cake** pattern, where eyes jump from heading to heading. The F-pattern is a symptom of unstructured text; the layer-cake is what good headings allow. So front-load headings and first words, and keep bold rare (16 Part 8; 17 Part 3).
- **Worked decision: showing a BRSR question.** Regulatory questions are long, and SME owners often read them on phones. Options: (A) the full legal text; (B) collapsed text behind "Learn more"; (C) a plain-language summary at body size, with the exact wording below in a labelled, slightly smaller block ("Exact wording"). **Choose C:** users act on the summary and cite the exact text. The new risk is a summary that drifts from the law, so it needs legal review. Dense regulatory content can be made readable when plainness is the goal (`TD-02#45 · @designwithmukul · DTdEvqIEpTL`).
- **Phones change the measure.** At 16px on a 360px-wide screen with 16px gutters, a line holds roughly 35–45 characters, the short end of Part 2's range. Shorten paragraphs and don't justify: narrow justified columns produce rivers.
- **Users enlarge text, and the layout must follow.** iOS Dynamic Type and Android's font scale (up to 200% since Android 14, with large text scaled less) are used by many older users, and Android's "display size" enlarges everything. Use min-heights, never fixed heights, and test at the largest setting (15 Part 5).
- **Budget screens punish thin type.** On low-density panels and in sunlight, hairlines and Light (300) weights break up. Use 400 for body and 500 for small labels, especially on dark surfaces (03 Part 11).
- **Language habits shape reading.** Many Indian users read English interfaces in a second language and type Hindi in Latin letters when chatting. Plain English helps more than any font change. Offer Hindi UI in Devanagari, not romanised (17 Part 5).
- **No single font is fastest for everyone.** A 2022 study by Wallace, Bylinskii and colleagues found that the font giving a reader their best speed varies from person to person. Respect user font settings and test with your own users rather than trusting a "most readable font" list.
- **How to verify reading:** three comprehension questions after reading; task time; a five-second test on headings; reading aloud, where hesitations mark problem words and broken shaping; all on the participant's own phone and font setting.

**Intuition anchors**
- Design the page for the scan and the paragraph for the read. Most users only do the first.
- The user's font-size setting is part of your design. Treat 200% as a real layout, not an edge case.

**Mastery checks**
- Explain the F-pattern and the layer-cake pattern, and what typography turns one into the other.
- Estimate characters per line on a 360px phone at 16px and state two consequences.
- Explain the EcoTrace BRSR-question decision and the risk it creates.
- Design a 30-minute reading test for a regulatory screen.

**Analysis**
- Rebuild one dense screen (a BRSR section, a bank's terms, a court cause list) for scanning *[Figma: White]*. Test both versions with three people on their own phones, recording comprehension, time and hesitations.

**Taste**
- Write and set for the tired reader on a small screen in bright light. If it works for them, it works for everyone.

---

## PART 11 — Indic Scripts in the Product: Bilingual Interfaces That Work [Deep]

- **The language switcher.** List each language in its own name and script (English, हिन्दी, தமிழ்), set in a font that supports it. Don't use flags: they stand for countries, not languages. Remember the choice.
- **Fallback is a design decision.** A UI font without Devanagari makes the browser substitute a mismatched system font. Choose one family covering both scripts (Mukta, Hind, Anek) or a designed pair (IBM Plex Sans with Plex Sans Devanagari, Noto Sans with Noto Sans Devanagari). Load the Indic file via `unicode-range` and match sizes with `size-adjust`.
- **Mixed strings are the norm.** A Hindi screen still contains "GST", "Scope 1", brand names and Latin digits, so weights and vertical positions must agree within one line. Fonts designed as pairs matter more in product than in print.
- **Vertical clipping is the most common bug.** Matras reach past Latin ascenders and descenders, so `line-height: 1`, fixed-height buttons and `overflow: hidden` inputs cut them off. Set per-language line-height with `:lang(hi)` and `:lang(ta)`, use min-heights, and test with strings that stack marks (कृपया ध्यान दें, प्रबंधन, நிறுவனம்).
- **Truncation and length limits.** Cutting a string by character count can split a conjunct or strand a matra. Let CSS `text-overflow: ellipsis` truncate, or cut at word boundaries (`Intl.Segmenter`). A `maxlength` of 10 counts code units, not what users see as letters, so it can reject a short Hindi name.
- **Screen readers need `lang`.** Without `lang` attributes on mixed content, TalkBack reads Hindi with English phonetics. `lang` also drives hyphenation and font selection.
- **Legacy text arrives in uploads.** SMEs upload documents typed in Kruti Dev (Part 7), which read as gibberish in Unicode. Detect it and offer conversion or a warning rather than storing unsearchable text.
- **Worked decision: EcoTrace's Hindi mode.** Options: (A) translate everything; (B) Hindi for navigation, help and explanations, with disclosure fields kept in English; (C) English UI with Hindi help only. The report an SME hands its listed customer is usually in English, but many owners grasp obligations better in Hindi. **Choose B.** **Consequences:** nearly every screen is mixed-script, the switch must keep the user's place mid-task, and Part 10's exact-wording blocks stay English beside a Hindi summary.

**Intuition anchors**
- A bilingual product is tested by its worst string, not its specimen sentence.
- If Hindi only works when the designer remembers it, the system doesn't support Hindi.

**Mastery checks**
- Explain why language switchers use endonyms and not flags.
- Name three places Devanagari clips in a UI and the fix for each.
- Explain why `maxlength` and substring truncation fail for Indic text.
- Walk through EcoTrace's Hindi-mode options and the consequences of B.

**Analysis**
- Switch one app (a bank, IRCTC, a government service) to Hindi or Tamil. Screenshot every clipped matra, fallback font and truncated label on five screens, and classify each by cause.

**Taste**
- Test the second script first. Designing in English and "adding Hindi later" produces the patched look Indian users have learned to expect, and you can do better.

---

## PART 12 — Taste Development in Typography & Connections [Lifelong]

- **What good typography looks like:** body text you forget you're reading (right size, measure, leading, contrast); a type system of few styles with clear roles; hierarchy through size and weight before new faces; correct punctuation, figures and small caps; an even colour in paragraphs; headings that belong to their text; display type with character and control; scripts treated as equals; licences in order; fonts that load without layout shift; and one typographic decision that gives the work its voice.
- **Voices and sources worth internalising:**
  - **Robert Bringhurst**, *The Elements of Typographic Style*: principles with poetry.
  - **Ellen Lupton**, *Thinking with Type*: the practical course.
  - **Matthew Butterick**, *Practical Typography* and *Typography for Lawyers*: rules with reasons.
  - **Jost Hochuli**, *Detail in Typography*: 60 pages on microtypography.
  - **Jan Tschichold**, *The Form of the Book*: the recanted modernist on books.
  - **Gerard Unger**, *Theory of Type Design* (2018): how type designers think.
  - **Karen Cheng**, *Designing Type*: how letters are built.
  - **Google Fonts Knowledge** (free): the best free modern type curriculum online.
- **Deliberate taste exercises:**
  1. **One face a week** (`TD-03#20`): classification, designer, year, anatomy, best use, a sample set in your own work.
  2. **Fonts In Use hour:** study how a face is used in real work.
  3. **Kern Type, weekly, until your scores plateau high.**
  4. **Paragraph clinic:** reset one bad paragraph from the wild per week.
  5. **Bilingual set:** the same text in English + Hindi + Tamil, typeset as equals.
  6. **Lettering sketch:** one word, drawn, not typed, weekly.
- **Anti-taste:** lorem ipsum layouts, 11-style type systems, three typefaces fighting, display faces as body text, body faces at 120pt untightened, tracked lowercase body, fake small caps and synthetic italics, straight quotes and hyphen-for-dash, jittering proportional numbers in tables, centred paragraphs, 120-character lines, 1.0 leading on body, letter-spaced Devanagari, Samarkan as "India", Kruti Dev in 2026, unlicensed "free" fonts in client work, Google-Fonts-default-everything, FOIT on slow networks, hyphens as minus signs, 12px values in data tables, fixed-height buttons that clip matras, and flags in language switchers.
- **Connections:**
  - **→ 02:** hierarchy, optical correction.
  - **→ 03:** text contrast, weight on dark.
  - **→ 05:** baseline grids, measure-driven columns.
  - **→ 10:** wordmarks and brand type.
  - **→ 12:** book and editorial setting in depth.
  - **→ 13/16:** UI and web type.
  - **→ 15:** readable, resizable text.
  - **→ 17:** words themselves.
  - **→ 18:** kinetic type.
  - **→ 28:** multiscript.
  - **→ L18:** implementation.
  - **Within this file:** Parts 9–11 take Parts 2–4 and 7 into products, phones and bilingual interfaces.

  Cross-pollination: **music** (rhythm and spacing: a well-set paragraph has a tempo; leading is like tala, the underlying cycle), **law** (legal drafting's hierarchy of clauses is typographic information design), **calligraphy** (the pen explains contrast and stress), **architecture** (Johnston and Frutiger designed type for spaces people move through).

**Intuition anchors**
- Typographic taste shows most in the quiet places: the paragraph, the table, the second script.

**Mastery checks**
- Recite the marks of good typography from memory and show one of your own pieces that meets each.
- Name ten anti-taste patterns and the Part that explains each.

**Analysis**
- Reset your oldest typeset piece against both lists and write the three changes that mattered most.

**Taste**
- Change your type rules only on evidence from real readers. A default you can't defend is a habit.

---

## Resource Library

**Primary:** Google Fonts Knowledge (fonts.google.com/knowledge) · OpenType spec, *Registered design-variation axis tags* (Microsoft Learn) · W3C CSS Fonts Level 4 and CSS Text Level 4 (`text-wrap`, `hyphens`) · WCAG 2.2 SC 1.4.4, 1.4.10, 1.4.12 · Apple HIG *Typography* and Material 3 *Typography* · Unicode Standard ch. 12 (South and Central Asian scripts) · Kevin Larson, *The Science of Word Recognition* (Microsoft, 2004) · Nielsen Norman Group, *F-Shaped Pattern for Reading Web Content* (2006) and its 2017 follow-up on scanning patterns · Jakob Nielsen, *How Little Do Users Read?* (2008) · MDN on `Intl.NumberFormat`, `Intl.Segmenter` and `:lang()` · Android developer docs on font scaling.

**Books:**
- **Ellen Lupton**, *Thinking with Type* (3rd ed., 2024): the spine of this module.
- **Robert Bringhurst**, *The Elements of Typographic Style* (4th ed.): the reference to return to for years.
- **Matthew Butterick**, *Practical Typography* (free online) and *Typography for Lawyers*: directly relevant to your law work.
- **Jost Hochuli**, *Detail in Typography*: microtypography in 60 pages.
- **Erik Spiekermann**, *Stop Stealing Sheep & Find Out How Type Works* (4th ed.): friendly, visual, opinionated.
- **Karen Cheng**, *Designing Type* (2nd ed. 2020): letter construction.
- **Gerard Unger**, *Theory of Type Design*: the reader's perspective from a master.
- **Fiona Ross**, *The Printed Bengali Character and Its Evolution* (1999): the model of Indic type history.
- **Simon Garfield**, *Just My Type* (2010): light, historical, fun.
- **Sofie Beier**, *Reading Letters: Designing for Legibility* (2012): legibility research for designers; the evidence behind Parts 2 and 10.

**Courses & labs:** CalArts *Introduction to Typography* (Coursera Plus, part of the Graphic Design Specialization) · Google Fonts Knowledge modules (free) · Method of Action's **Kern Type**, **Shape Type**, **The Bézier Game** (`TD-10#12`; `TD-10#51 · @templyo · DGyK7kYOsx9` for shape.method.ac) · vartype.com and Dinamo's Font Gauntlet for variable axes · *stack & justify* for stress-testing faces (`TD-03#27`).

**Reading (work):** *The Guardian* and *The Hindu* websites (editorial type on screen) · Linear, Stripe and Apple product pages (one-family UI systems) · Penguin Classics covers (Tschichold's rules in action) · London Underground signage (Johnston) · Munich 1972 (Aicher's Univers-based system) · Indian Railways and Delhi Metro signage (bilingual/trilingual wayfinding) · IBM Carbon's typography docs (productive vs expressive type sets for data-heavy tools) · GOV.UK Design System typography (plain, scannable public-service text) · Fonts In Use (credited real-world usage) · Letterform Archive (online collection).

**From your catalogue (typography spine):** all of `TD-03` (29 entries). Priority: `#5` (web type spec, print it), `#2` (fonts by mood), `#26` (pairing), `#29` (type & brand meaning), `#27` (testing tools), `#8` (open-source brand fonts), `#16` (type as argument), `#17`, `#1`, `#12` (Indian type), `#4` (trend report), `#14`, `#6` (generative and process). Treat `#9–#11`, `#15`, `#18–#25`, `#28` as a display-face library, checking every licence.

**Practice:** `T8-design-04-typography.md`: spacing drills, paragraph clinics, type-system builds, bilingual setting trials, specimen rebuilds.

## Suggested Learning Order

1. Part 0 (anatomy & measurement) + Lupton ch. "Letter" · ~6 h
2. Part 2 (legibility & readability) + Larson (2004) · ~6 h
3. Part 3 (microtypography) + Butterick's *Practical Typography* "Type composition" chapters · ~8 h
4. Part 4 (systems & pairing) + reverse-engineering a real product's type system · ~8 h
5. Part 1 (classification & lineage), with one-face-a-week starting now · ~8 h
6. Part 7 (multiscript & Indian type), essential before any Indian-market product work · ~8 h
7. Part 5 (technology & licensing) · ~5 h
8. Part 6 (expressive & display), in parallel with poster work in `T8-design-02` and `-04` · ~6 h
9. Part 9 (product type & numbers), applied to one EcoTrace table · ~4 h
10. Part 10 (reading in products), with a reading test on real phones · ~4 h
11. Part 11 (bilingual interfaces), after Part 7, with a Hindi build of one screen · ~5 h
12. Parts 8 and 12 (masters, taste, connections) + Butterick's *Typography for Lawyers* · ~6 h

Total first pass ≈ 74 hours alongside the T8 file.
