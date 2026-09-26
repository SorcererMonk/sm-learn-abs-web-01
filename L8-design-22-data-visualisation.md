# Data Visualisation & Information Design → Numbers People Can Read, Trust and Act On
## L8: Design: 22 · Foundations · Perception of Quantity · Chart Choice by Task · Colour for Data · Words, Numbers & Tables · Dashboards · Maps & India's Boundaries · Storytelling & Scrollytelling · Accessible Charts · Uncertainty, Honesty & Ethics · Tools & Code · Product Decisions · How Users Read Charts · Masters

> This is the **learning** file for data visualisation and information design: how the eye decodes quantity, which visual encodings are read accurately and which are not, how to choose a chart from the reader's task, how to build and test data palettes, how words, numbers and tables carry most of the meaning, how dashboards are designed around decisions rather than decoration, how maps mislead and what Indian law requires of any map of India, how to show uncertainty, how to tell a story with data (including scrollytelling), how to make charts usable without sight, where honest charts end and misleading ones begin, which tools and React libraries to use, and how real users read, misread and act on charts. It stops where neighbours take over: colour science and the first worked decisions on data colour are `L8-design-03-colour-theory-science.md` (Part 10, *Colour for Data*, and Part 11, testing colour in the wild); perception and attention are `L8-design-06-neuroscience-psychology.md` (Parts 1–2); animated transitions between data states are `L8-design-18-motion-ui.md` (Part 9); sonification is `L8-design-20-sound-audio-ux.md` (Part 7); data in printed reports is `L8-design-12-print-editorial.md` (Part 3); charts on the web and scroll mechanics are `L8-design-16-web-design.md` (Parts 5–6); accessible names and screen readers are `L8-design-15-accessibility-inclusive.md` (Part 3); narrative structure and presentation are module 26. The training counterpart is `T8-design-22-data-visualisation.md`.
>
> **Context stamp (September 2026):** **Figma** still has no native chart tool: nothing chart-related was announced at Config 2026 (Figma Motion, shaders, Weave, the agent and code layers were), so charts in Figma come from community kits and plugins, built on variables you control. In your React stack, **Recharts 3** (3.0 in June 2025; 3.10 in July 2026) turns its `accessibilityLayer` (keyboard access and screen-reader support) **on by default**, and **shadcn/ui's charts** now run on Recharts v3 with `--chart-1…n` CSS variables; **visx 4.0** shipped in June 2026; **Apache ECharts 6** (July 2025; 6.1 in May 2026) added a new theme system, axis breaks and a matrix layout; **D3** is on 7.9; **Tremor** was acquired by Vercel in January 2025 and open-sourced. Free tools remain strong: **Datawrapper**'s free plan publishes charts, maps and tables with attribution and PNG export (Pro is $21 per user per month; API usage is billed from 1 October 2026); **Flourish** (owned by Canva) is free for public projects with attribution; **Observable** has a free plan, and Plot, D3 and Notebook Kit are open source. For EcoTrace: **BRSR** applies to India's top 1,000 listed companies; SEBI's March 2025 circular lets **BRSR Core** be checked by third-party **assessment or assurance**, on a glide path that reaches the top 1,000 in FY 2026-27, and made **value-chain ESG disclosures voluntary** from FY 2025-26. The **CEA CO₂ Baseline Database v21.0** (December 2025) puts India's weighted-average grid emission factor at **0.710 tCO₂/MWh for 2024-25** (0.727 the year before). **Maps:** Section 2(2) of the **Criminal Law Amendment Act, 1961** (inserted in 1990) makes publishing a map of India that does not conform to **Survey of India** maps punishable with up to six months' imprisonment, a fine, or both. The **Census 2027** house-listing ran from April to September 2026 and population enumeration uses a reference date of 1 March 2027, so most per-person rates still divide by 2011 figures or official projections.

---

## How To Use This Document

**Depth ladder:** **L1** Name it (encodings, chart forms, palette types) · **L2** Use it correctly (a clean bar chart, a readable table, a legal India map) · **L3** Choose the chart, scale and palette over the alternatives for a named reader and task · **L4** Explain the mechanism (why position beats area, why truncation exaggerates, why choropleths over-weight big districts) · **L5** Design a complete data layer: a dashboard, a report, a chart component library, tested with users · **L6** Teach it and critique misleading or inaccessible charts precisely.

**Tier tags:** **[Core]** every designer · **[Deep]** senior depth · **[Frontier]** specialist or still moving · **[Lifelong]** never finished.

**Each Part closes with:** *Intuition anchors* · *Mastery checks* · *Analysis* · *Taste*.

**The data-visualisation learning loop:**
1. **Start from the question, not the dataset.** Write the reader, the decision and the one sentence the chart must make true before opening any tool.
2. **Sketch three forms on paper.** Most bad charts are the first idea. Two minutes of alternatives beats an hour of polishing.
3. **Build with real data, including the ugly rows.** Zeros, missing months, a supplier that is 80% of the total, a district name that changed. Lorem-ipsum data hides every real problem.
4. **Read it cold.** Leave it for a day, or show it to someone for five seconds and ask what it says. If their sentence differs from yours, the chart is wrong, not the reader.
5. **Stress it:** greyscale, colour-blind simulation, a 360-pixel phone, a mono laser print, a screen reader, Hindi labels.
6. **Rebuild admired graphics.** One chart a week from the FT, Reuters, The Hindu's data team or Our World in Data, rebuilt in code, then improved.

**Relationship to the other files:**
- `L8-design-02` Parts 1–2: Gestalt grouping and pre-attentive attributes, the perceptual basis of encoding.
- `L8-design-03` Part 10: categorical, sequential and diverging palettes and EcoTrace's Scope 1/2/3 colour decision. This file builds on it and does not repeat it.
- `L8-design-04` Part 9: tabular figures and type for dense data.
- `L8-design-05` Part 5: density and layout of complex screens.
- `L8-design-14` Parts 1 and 3: tokens and component APIs for Meridian UI's chart components.
- `L8-design-18` Part 9: object constancy and animated data transitions.

---

## PART 0 — Foundations: What Visualisation Is For [Core]

- **Data visualisation** turns numbers into marks whose position, length, colour or size the eye can compare faster than it can read digits. **Information design** is the wider craft of making complex information usable: charts, but also tables, diagrams, forms, timetables, maps, wayfinding, bills and the BRSR report itself.
- **Two jobs, two designs:**
  - **Exploration:** you don't yet know what the data says. Many quick, plain charts; interactivity; small multiples; nothing polished. The audience is you or an analyst.
  - **Explanation:** you know what it says and must make someone else see it. One clear message, annotations, a title that states the finding, everything else removed. The audience is a busy person.
  - Most bad product charts are exploration charts shipped as explanation: a generic line chart with twelve series and a legend, handed to an SME owner who wanted one answer.
- **Data types decide what encodings are legal** (Stanley Smith Stevens' scales of measurement, 1946):
  - **Nominal (categorical):** Scope 1, 2, 3; supplier names; states. No order. Use hue, shape, position in separate groups.
  - **Ordinal:** AQI categories (Good → Severe), survey ratings, data-quality grades. Ordered, gaps not equal. Use ordered lightness, ordered position.
  - **Quantitative (interval and ratio):** tonnes of CO₂e, rupees, kWh. Use position and length first.
  - **Temporal and spatial** are special cases with their own conventions (time runs left to right; maps keep geography).
- **Marks and channels** (Tamara Munzner, *Visualization Analysis & Design*, 2014, building on Jacques Bertin, *Sémiologie graphique*, 1967): **marks** are the geometric primitives (points, lines, areas); **channels** are how their appearance varies (position, length, angle, area, colour hue, lightness, saturation, shape, texture, motion). Channels come in two kinds: **magnitude channels** say *how much* (position, length, lightness) and **identity channels** say *what* (hue, shape). Using an identity channel for magnitude (a rainbow for tonnes) or a magnitude channel for identity (lightness steps for unrelated suppliers) is the most common category error in charts.
- **Why look at data at all:** summary statistics hide structure. **Anscombe's quartet** (1973) is four datasets with the same means, variances, correlation and regression line that look completely different when plotted; the **Datasaurus Dozen** (Matejka & Fitzmaurice, CHI 2017) extends the point to a dinosaur and a dozen shapes with identical statistics. Plot before you summarise.
- **The chart is an argument.** Every choice (which baseline, which comparison, which period, what is grey) makes some conclusions easy and others hard. Your legal training helps: a chart is evidence, and like evidence it can be relevant, reliable, complete or misleading by omission (Part 9).
- **Data as spectacle vs data as tool.** A live globe of orders is compelling *because it is true and changing* (`TD-02#51 · @abnux · DRoxTqRAZUi`: Shopify's Black Friday site), and operational data can be a B2B site's best content (`TD-02#52 · @josh_yolkk · DNSfDDqtYsr`). But spectacle answers "is this alive?", not "how much, compared with what?". A product dashboard needs the second.

**Intuition anchors**
- Decide explore or explain before choosing anything else. They are different products.
- Magnitude channels for quantities, identity channels for categories. Never swap them.
- A chart is a claim. Know which sentence it makes true.

**Mastery checks**
- Classify ten EcoTrace fields as nominal, ordinal or quantitative and name a legal channel for each.
- Explain marks, channels, magnitude and identity channels with an example of each.
- Explain Anscombe's quartet and what it teaches designers.
- Give one example each of an exploration chart and an explanation chart for the same dataset.

**Analysis**
- Take one dashboard you use (a bank app's spending screen, Google Analytics, a mutual-fund app). For every chart write: explore or explain, reader, question, the sentence it makes true. Mark the charts where you can't write the sentence.

**Taste**
- The best data designers are editors first. What they leave out is most of the work.

---

## PART 1 — Perception of Quantity: How Eyes Decode Encodings [Core → Deep]

- **Cleveland & McGill's ranking** ("Graphical Perception", *Journal of the American Statistical Association*, 1984) measured how accurately people judge quantities from different encodings. From most to least accurate:
  1. **Position along a common scale** (dots or bar ends against one axis).
  2. **Position along non-aligned scales** (the same, but in separate panels).
  3. **Length, direction, angle.**
  4. **Area.**
  5. **Volume, curvature.**
  6. **Shading, colour saturation.**
- **Replications:** Jeffrey Heer & Michael Bostock (CHI 2010) re-ran these experiments with crowdsourced participants on Mechanical Turk and reproduced the ranking, adding that rectangular area judgments were worse than length and that circle area was worse still. Jock Mackinlay (*ACM Transactions on Graphics*, 1986) turned the ranking into a design rule: use the most accurate available channel for the most important variable, and ranked channels separately for quantitative, ordinal and nominal data (hue is poor for quantity but good for categories).
- **What the ranking means in practice:**
  - **Bars and dots beat pies and bubbles** for precise comparison. A bar chart of Scope 1, 2 and 3 is read more accurately than a pie of the same numbers.
  - **Stacked bars:** only the bottom segment sits on a common baseline. Every other segment is a floating length, read less accurately. If comparing the middle segment matters, un-stack it (grouped bars or small multiples).
  - **Area is under-perceived.** People judge a circle twice the area as less than twice as big (Stevens' power law for area has an exponent below 1). Cartographers once compensated by exaggerating circles (James Flannery's apparent-magnitude scaling, 1971); the current convention is to scale area truly and give a size legend. Never scale a circle's *radius* by the value: a value twice as large then looks four times as large.
  - **Colour lightness is the least precise magnitude channel,** which is why choropleths (Part 6) and heatmaps are good for patterns and poor for exact values.
- **Pies, fairly:** Cleveland & McGill put angle low, but Ian Spence & Stephan Lewandowsky (1991) found pies competitive for judging a single part-to-whole proportion. Drew Skau & Robert Kosara (EuroVis 2016) found people read pies mostly by arc length and area rather than angle, and that **donuts are not read worse than pies**. The honest summary: one pie with two or three slices, to show "about a quarter", is fine; comparing slices across several pies, or ten slices, is not.
- **Bars must start at zero; lines need not.** A bar encodes value as *length*, so a truncated bar lies about ratios. A line encodes *change* by position and slope, so a y-axis that fits the data is legitimate if labelled. Part 9 has the evidence on truncation.
- **Aspect ratio changes the story.** The same line looks flat in a wide chart and dramatic in a tall one. William Cleveland proposed **banking to 45°**: choose the aspect ratio so that the average absolute slope of the line segments is about 45°, where slope differences are easiest to judge (Heer & Agrawala, 2006, extended it to multiple scales). In product work: fix aspect ratios per chart type in the component, so they don't drift with container width.
- **Pre-attentive pop-out** (02 Part 2, 06 Part 2): colour, size and orientation differences are detected in parallel, in a fraction of a second. **One** highlighted bar among grey ones pops out. Five highlighted bars in five hues don't; the eye has to search. Use pop-out for the single thing that matters.
- **Gestalt does the grouping** (02 Part 1): proximity groups bars into clusters, similarity links a line to its label by colour, enclosure makes a shaded band read as "target zone", connection makes a line read as one series. When grouping fights the data, readers follow the grouping.
- **Comparison needs alignment.** People compare what is adjacent and aligned. Put the two bars someone must compare next to each other on one baseline; that one decision often matters more than the chart type.

| Task | Best channel | Acceptable | Avoid |
|---|---|---|---|
| Exact comparison of a few values | Position (dot, bar end) | Length | Area, angle, colour |
| Part of a whole, 2–3 parts | Stacked bar, single pie | Waffle | 3D pie, many slices |
| Pattern across many cells | Colour lightness (heatmap) | Size | Hue rainbow |
| Categories | Hue, shape, position in groups | Direct labels | Lightness steps (implies order) |

**Intuition anchors**
- Position first, length second, everything else only when you must.
- If two things must be compared, put them next to each other on the same baseline.
- One highlight pops; five highlights hide.

**Mastery checks**
- Recite Cleveland & McGill's ranking and explain why position wins.
- Explain why stacked-bar middle segments are hard to compare.
- Explain the circle radius error and the area under-perception effect.
- State when a pie is defensible, citing Spence & Lewandowsky and Skau & Kosara.
- Explain banking to 45° and why chart components should fix aspect ratios.

**Analysis**
- Draw the same five-supplier emissions dataset as a pie, a donut, a bar chart, a dot plot and a treemap. Ask three people to rank the suppliers from each (without numbers) and time them. Compare error and time with the ranking above.

**Taste**
- A well-encoded chart feels effortless. Readers credit the data, not the design, which is the goal.

---

## PART 2 — Choosing the Chart by Task [Core]

- **Choose by the reader's task, not by the data's shape.** The same monthly emissions data supports different charts depending on whether the reader must see the trend, the ranking, the share or the deviation from target.
- **A task-to-form map** (after the *Financial Times* Visual Vocabulary by Alan Smith and colleagues, and Andy Kirk's CHRTS families: categorical, hierarchical, relational, temporal, spatial):

| Reader's task | Good forms | Watch out for |
|---|---|---|
| **Compare** categories | Horizontal bar (long labels), dot plot, lollipop | Sort by value unless the order means something |
| **Rank** | Sorted bar, slope chart (two periods), bump chart (many periods) | Rank hides the size of gaps; label values |
| **Change over time** | Line, column (few periods), area (one series), sparkline | Too many lines: highlight one, grey the rest, or small multiples |
| **Part to whole** | Stacked bar (100%), waffle, single pie with ≤ 3 parts, treemap (many parts) | Parts must sum to a meaningful whole |
| **Deviation** from target or zero | Diverging bar, bullet graph, line with target band | Colour meaning of "good" must be tested (03 Part 10) |
| **Distribution** | Histogram, box plot, strip or beeswarm, violin (expert readers) | Bin width changes the story; show counts |
| **Correlation** | Scatter, connected scatter (time), heatmap | Correlation is not causation; add n |
| **Flow** | Sankey, alluvial, waterfall (for additive steps) | Sankeys are loved and misread; test them |
| **Spatial** | Choropleth, proportional symbol, tile grid map | Part 6 |
| **Single value** | Big number with comparison and trend | A number without context is decoration (Part 5) |

- **Small multiples** (Edward Tufte's term, *Envisioning Information*, 1990): the same small chart repeated per category, on shared scales. They solve "spaghetti" line charts and let readers compare shapes. They are the most under-used form in product design.
- **Dual-axis charts** plot two measures with different units against two y-axes. Their crossing points and relative slopes are arbitrary (they depend on how each axis is scaled), so readers infer relationships that the designer created. Prefer two aligned charts sharing an x-axis, or index both series to 100 at a common start.
- **Tables are a chart form.** When the reader needs exact values, looks up one row, or compares many attributes of few items, a table beats any graphic (Part 4).
- **Unfamiliar forms cost learning time.** Radar charts, chord diagrams and force-directed graphs look impressive but need explanation; a force-directed network is now a common decorative effect on AI and data sites (`TD-09#14 · @ellydoesdesign · Db4OwAbOZxK`), which is exactly why it rarely carries a readable message. Use a novel form only when the familiar one can't show the structure, and teach it with an annotated first view.
- **Worked decision: EcoTrace's monthly electricity and emissions trend.** The reader is an SME's operations head checking whether the new solar rooftop is working.
  - **Options:** (A) dual-axis line: kWh left, tCO₂e right. (B) two stacked, aligned line charts sharing months. (C) one line of emissions with a shaded "grid" vs "solar" split in a stacked area.
  - **Criteria:** answers "is solar reducing grid emissions?"; readable on a 360-pixel phone; no false relationships; exports cleanly to the BRSR PDF.
  - **Choice: C for the phone and the dashboard, B in the detailed report.** The stacked area makes the solar share visible as the growing lower band; the report pairs kWh and tCO₂e as aligned charts so an auditor can check the emission factor.
  - **Consequence:** the dual-axis chart, which the first prototype used, disappears; one support question ("why do the lines cross in June?") disappears with it.

**Intuition anchors**
- Task first, form second. Name the verb: compare, rank, change, share, deviate, distribute, relate.
- When lines tangle, split into small multiples on shared scales.
- Two y-axes let the designer draw any relationship they like. Readers can't tell.

**Mastery checks**
- Choose a form for twelve described reader tasks and justify each.
- Explain why dual-axis charts mislead and give two alternatives.
- Explain small multiples and when to use shared vs independent scales.
- Say when a table beats a chart.

**Analysis**
- Take one dataset (NPCI's monthly UPI volumes and values by app, from npci.org.in) and make five charts answering five different questions. Write the question as each chart's title.

**Taste**
- The right chart often looks plain. Novelty is rarely what makes a chart good.

---

## PART 3 — Colour for Data: Building and Testing Palettes [Core → Deep]

03 Part 10 covers the three palette types, EcoTrace's Scope 1/2/3 colours, grey as the context colour and the mono-print test. This Part is the construction and testing method.

- **Build ramps in a perceptual space.** Sequential ramps should change **lightness evenly**. Define them in **OKLCH** (03 Part 1), stepping L at equal intervals while holding hue and easing chroma at the extremes, then check the rendered result. Equal steps in HSL are not equal steps to the eye: yellow at "50% lightness" is far brighter than blue at the same value.
- **Known-good sources:** Cynthia Brewer's **ColorBrewer** schemes (Harrower & Brewer, 2003) for maps; **viridis** and its siblings (magma, cividis), designed for matplotlib in 2015 by Nathaniel Smith and Stéfan van der Walt to be perceptually uniform, colour-blind-safe and legible in greyscale; Datawrapper's and the FT's published palettes as references.
- **The rainbow problem:** the rainbow (jet) colour map has uneven lightness, so it creates false boundaries (bands of yellow and cyan look like edges in smooth data) and has no natural order. Borland & Taylor's "Rainbow Color Map (Still) Considered Harmful" (2007) and Crameri, Shephard & Heron's "The misuse of colour in science communication" (*Nature Communications*, 2020) document the harm. Use it only where hue categories carry known meaning and never for magnitude.
- **How many classes:** readers can reliably distinguish about 5–7 lightness steps on a map legend; beyond that, use a continuous (unclassed) ramp with a gradient legend, or fewer classes.
- **Colour-vision deficiency (CVD):** red–green deficiencies (deuteranomaly most common) affect roughly 8% of men of European ancestry; prevalence studies in Indian populations report lower but still substantial figures, which in a country of India's size is millions of readers. Design so that **lightness alone** separates adjacent categories and so that nothing depends on red vs green. Simulate with Chrome DevTools (Rendering → Emulate vision deficiencies), Figma plugins, or Datawrapper's built-in colour-blind check.
- **WCAG for charts** (15 Parts 1–2): **1.4.1 Use of Color** (colour must not be the only way to tell series apart: add labels, patterns or markers); **1.4.11 Non-text Contrast** (graphical objects needed to understand the content need **3:1** against adjacent colours, which includes lines and bars against the background); **1.1.1 Non-text Content** (a text alternative, Part 8).
- **Dark mode is a separate palette.** A ramp that reads "darker = more" on white inverts on a dark surface, where brighter reads as more. Either keep light-mode charts on a light card inside dark UI, or define a dark ramp where "more" is brighter. Saturated colours on dark backgrounds also glow and bleed (`TD-04#10 · @sammmhirst · DcOD6xgKGj1`, on halation in light-on-dark text; the mechanism applies to thin chart lines too). Test both themes with the same data.
- **Tokens for data colour** (14 Part 1): keep a separate token group so data colours never borrow status colours. For Meridian UI: `--chart-cat-1…8` (categorical, ordered by distinctness), `--chart-seq-1…7` and `--chart-div-neg-3…pos-3` (ramps), `--chart-context` (grey for non-highlighted series), `--chart-highlight`, `--chart-target` (dark, used with a dashed line), each with light and dark mode values. shadcn/ui's `--chart-1…5` convention maps onto the categorical group.
- **Worked decision: highlighting one supplier among forty.** A procurement manager wants to see where their largest supplier sits in the Scope 3 distribution.
  - **Options:** (A) forty categorical hues with a legend. (B) all grey with one highlighted in the brand accent and labelled. (C) a sequential ramp by emissions.
  - **Criteria:** find the supplier in under three seconds; survives greyscale and CVD; no legend lookup.
  - **Choice: B.** Forty hues is unreadable (03 Part 10), a ramp double-encodes what position already shows, and a single highlight pops out pre-attentively (Part 1).
  - **Consequence:** the palette needs only two data colours for this view, and the component gets a `highlight` prop rather than a colour array.

**Intuition anchors**
- Lightness carries order and magnitude. Hue carries identity. Keep them in those jobs.
- If it only works in colour, it doesn't work.
- Dark mode needs its own data palette, not an inverted one.

**Mastery checks**
- Build a 7-step sequential ramp in OKLCH and show that its lightness steps are even.
- Explain why the rainbow colour map misleads and name two alternatives.
- State WCAG 1.4.1 and 1.4.11 and what each means for a line chart.
- Specify a data-colour token set for Meridian UI with light and dark values.

**Analysis**
- Take three Indian public dashboards (CPCB's AQI map, a state's COVID-era dashboard in an archive, RBI's DBIE charts). Run each through greyscale and deuteranopia simulation. Rate each: order preserved, categories separable, labels present.

**Taste**
- Mature data palettes look calm. Their restraint is what lets one highlight speak.

---

## PART 4 — Words, Numbers & Tables [Core]

Most of what readers take from a chart comes from its words. Eye-tracking by Borkin and colleagues (Part 12) found titles and text among the first and most-fixated elements.

- **Titles state the finding.** "Scope 2 emissions fell 18% after the rooftop solar went live in March" beats "Monthly Scope 2 emissions". The descriptive version becomes the **subtitle** (measure, unit, period). Active titles are an editorial choice with power: Part 9 shows how slanted titles change what readers remember, so the title must be true to the data.
- **The anatomy of a finished chart:** headline finding · subtitle (what is measured, units, scope) · the chart · annotations on the data · source and method note ("Source: EcoTrace calculation from your electricity bills; CEA grid factor v21.0") · date of last update.
- **Annotate on the data.** A short label at the point where something happened ("Solar online", "Plant shut for Diwali") explains a spike better than any paragraph below the chart. Andy Kirk and the FT graphics desk treat annotation as a layer of the chart, not a caption.
- **Direct labels beat legends** (03 Part 10). Label the end of each line; label bars at their ends. Keep a legend only for more than about five series, and then order it like the data.
- **Axes and gridlines:** light gridlines only on the value axis; round tick values (0, 25, 50, not 0, 23.7, 47.4); units in the axis title or first tick ("₹0 lakh"); no chart border; the zero line darker than other gridlines. Tufte's **data-ink ratio** (*The Visual Display of Quantitative Information*, 1983) is the right instinct (remove ink that carries no data) but not a law: some non-data ink (gridlines, annotations) helps reading.
- **Numbers, Indian style:**
  - Use Indian grouping and units for Indian readers: `12,34,567` and **lakh** and **crore**. In code, `new Intl.NumberFormat('en-IN').format(1234567)` gives `12,34,567`; with `{ notation: 'compact', compactDisplay: 'long' }` it gives `12 lakh`, and `123456789` becomes `12 crore`. `hi-IN` gives `12 लाख`. Compact notation rounds hard (12.35 lakh becomes 12 lakh), so set `maximumFractionDigits` when precision matters.
  - Decide per surface: SME owners think in lakh and crore; a BRSR filing for a listed client may use crore; an international investor deck may need millions. Never mix systems on one screen.
  - **Tabular figures** (`font-variant-numeric: tabular-nums`) so digits align in tables and don't jitter when values update (04 Part 9, 18 Part 9).
  - **Consistent precision:** the same measure gets the same decimals everywhere; round for reading ("412 tCO₂e"), keep full precision in exports and tooltips.
  - **Signs and arrows for change:** "↓ 12%" with a minus sign (U+2212) and colour as a secondary cue.
  - **Units belong with numbers:** tCO₂e, kWh, kL, ₹. Subscripts matter: use the proper subscript "₂" or `<sub>`, which also reads correctly to screen readers when marked up.
- **Bilingual charts:** Devanagari labels need more vertical space (matras above and below), wrap differently and render with different widths; test every label in Hindi and in a long-string language (17 Part 5, 04 Part 11). Don't rotate Devanagari axis labels; switch to horizontal bars so labels run horizontally.
- **Tables** (Stephen Few, *Show Me the Numbers*, 2004 and 2012): use a table when readers look up individual values, need precision, or compare several measures of a few items. Rules:
  - **Right-align numbers,** left-align text, align headers with their column's content; tabular figures.
  - **Units in the header,** not repeated in every cell.
  - **Minimal rules:** light horizontal separators or subtle zebra striping, no vertical grid; whitespace groups columns.
  - **Sort by the reader's likely question** (largest emitter first), with sortable headers in the product.
  - **Heatmap tables** (conditional formatting with a light sequential tint) add pattern-finding without losing exact values.
  - **Totals and subtotals** visually distinct (weight, top rule), and stated as totals.
  - **Density modes:** compact for analysts, comfortable for occasional users (14 Part 3).
  - **Mobile:** freeze the first column and scroll horizontally, or switch to one card per row for lookup tasks. Test both with real users; analysts hate cards and owners hate scrolling.
  - **Accessibility:** a real `<table>` with `<caption>`, `<th scope="col">` and `scope="row"`, so screen readers announce headers with each cell (15 Part 3).
- **Tables vs images:** a conversion teardown argues "never present inventory as a data table, images convert" (`TD-11#28 · @growzutrue · DMwKogUv4dJ`). That's right for browsing homes and wrong for comparing suppliers' emission factors. The task decides: browsing wants pictures, comparing wants tables.
- **Micro-typography signals rigour.** Small reference numbers, units and spec tables make a design look engineered (`TD-07#8 · @ryanbailey.cb`: "micrographics"). In data design that signal must be earned: decorative fake data labels on a marketing page borrow the credibility of real measurement, which is a small honesty failure (Part 9).

**Intuition anchors**
- The title is the chart's thesis. Write it before you draw.
- Label the data where it sits. Every trip to a legend costs attention.
- Right-align numbers, tabular figures, units in the header.

**Mastery checks**
- Rewrite five descriptive chart titles as findings, each with a subtitle.
- Format ₹1,23,45,678 and 45,200 in `en-IN` and `hi-IN`, standard and compact, and explain the rounding risk.
- List eight rules for a readable data table.
- Explain when a table beats a chart and when images beat a table.

**Analysis**
- Rebuild a table from a listed company's BRSR (Principle 6 energy and emissions) in Figma using the rules above. Put the original and yours side by side and ask two people to find three specific values in each. Time them.

**Taste**
- Good data design reads like good writing: a clear claim, supporting evidence, sources cited, nothing wasted.

---

## PART 5 — Dashboards: Decision-First Design [Core → Deep]

- **Definition** (Stephen Few, 2004): "a visual display of the most important information needed to achieve one or more objectives; consolidated and arranged on a single screen so the information can be monitored at a glance." The key words are *objectives*, *most important* and *at a glance*. Most "dashboards" are neither.
- **Research on what dashboards are:** Sarikaya, Correll and colleagues ("What Do We Talk About When We Talk About Dashboards?", *IEEE TVCG*, 2019) surveyed dashboards in the wild and found wide variety in purpose (from strategic and operational decision-making to awareness, communication and learning) and in how much interaction and "story" they carry. Bach and colleagues ("Dashboard Design Patterns", *IEEE TVCG*, 2023) catalogued recurring patterns for content, composition and interaction. Use both as vocabularies, not templates.
- **Start from decisions.** For each dashboard write: who opens it, how often, what decision it supports, and what they do next. Then choose metrics. EcoTrace's SME owner opens the dashboard weekly and asks: *am I on track for my BRSR data, what's missing, and what changed?* That gives three zones: **completeness**, **headline emissions with trend**, **anomalies and actions**.
- **The anatomy of a KPI tile:** the **value** (with unit) · a **comparison** (vs last period, vs target, vs peers) · a **trend** (sparkline, Tufte's "word-sized graphics", *Beautiful Evidence*, 2006) · a **status** only if there is a real threshold · a **link** to the detail. A number with no comparison is decoration. A widget that shows one live, true number can be the most-used surface in a product (`TD-01#31 · @chris.raroque · DZdIWw6ixWA`: a home-screen widget with one changing number drove app opens), because the number answers a question the user already has.
- **Bullet graphs** (Few's design): a single bar for the actual value, a short perpendicular line for the target, and two or three grey bands for qualitative ranges. They replace gauges and dials, which spend a lot of space on one number and read by angle.
- **Density:** operational dashboards for daily users can be dense (analysts learn the layout); dashboards for occasional users must be sparse and self-explaining. A dense, calm dashboard beats a sparse, noisy one: density is fine when hierarchy is clear (05 Part 5). Sports broadcast UI shows how far density can go when conventions are strong and viewers are trained (`TD-01#32 · @thedesignely · DUikq2BjUnk`).
- **Layout:** most important top-left in left-to-right reading cultures (a convention, not a law; 05 Part 3 on the evidence about scanning), overview first, then detail on demand (Ben Shneiderman's mantra, 1996: "overview first, zoom and filter, then details-on-demand"). Keep the same metric in the same place across periods so users build spatial memory.
- **Filters and scope:** show the active scope in words ("Plant: Pune · FY 2025-26 · Scope 1+2") at the top of the page, because charts screenshot without their filter state. Default filters to the most common question.
- **States** (13 Part 4): **empty** (first week, no bills uploaded: say why it's empty and give one action, `TD-01#1 · @itsdesignare · DdHQxIcNzjY`), **partial** (three of twelve months: show what exists and mark missing months as missing, never as zero), **loading** (skeletons that match chart shapes, `TD-01#11 · @synsation_ · DZIHbbIt5mc`), **error** (a failed data source, named), **stale** ("Last updated 3 days ago").
- **Missing is not zero.** A line that drops to zero for a month with no data tells the owner their emissions vanished. Break the line, or show a gap with a hatched marker and a note.
- **Alerts over staring.** Most operational value comes from telling users when something needs attention (an electricity bill 40% above the seasonal norm) rather than hoping they spot it on a chart.
- **The aesthetic trap:** bento-grid dark dashboards are what UI kits sell in 2026 (`TD-10#8 · @craftwork.design · Db3nWqTGv0s`), and "bento grids", "neon colours" and "rainbow colouring" are on a widely shared list of tells that a site was generated by default (`TD-09#15 · @aj.on.ai · DcEJDHBTyPY`). A dashboard built from a kit's tile shapes rather than from users' decisions will look current and answer nothing.
- **Learning from volume:** one creator recommends a video that surveyed over two thousand dashboards to find what recurs (`TD-13#20 · @theedgarr · DbcbYLxFQaQ`). Breadth teaches conventions; your users' decisions tell you when to break them.
- **Worked decision: EcoTrace's home dashboard for an SME owner.**
  - **Options:** (A) a kit-style grid of eight KPI tiles and four charts. (B) a completeness checklist first, then three KPI tiles, then one trend chart and an "attention needed" list. (C) a single narrative summary with charts inline ("This quarter your emissions were…").
  - **Criteria:** in under ten seconds the owner knows whether they're on track and what to do next; works on a 360-pixel phone; survives a screenshot forwarded on WhatsApp; matches how often they visit (weekly).
  - **Choice: B, with a one-sentence generated summary above it** (C's strength in one line). Tests of A in early prototypes produced the answer "looks professional" and no action.
  - **Consequences:** only three KPIs survive (total tCO₂e this FY with vs-last-FY, data completeness %, intensity per ₹ crore turnover); every other metric moves to the detail pages. The design system gets a KPI tile, a completeness meter and an "attention" list item, not twelve chart types.

**Intuition anchors**
- A dashboard is a decision surface. No decision, no tile.
- Every number needs a comparison, or it means nothing.
- Missing is not zero. Show gaps as gaps.

**Mastery checks**
- Quote Few's definition and explain each key phrase.
- Specify a KPI tile's five parts.
- Draw a bullet graph and explain why it replaces a gauge.
- List the five states a dashboard must design and what each shows.
- Explain Shneiderman's mantra with an EcoTrace example.

**Analysis**
- Audit a public Indian dashboard (NPCI's UPI statistics, an electricity distribution company's consumer portal, CPCB's AQI dashboard). List its implied decisions. Redesign its first screen around the top two decisions and test both with two people.

**Taste**
- The best dashboards feel almost boring on a normal day and impossible to miss on a bad one.

---

## PART 6 — Maps: Choropleths, Projections & India's Official Boundaries [Core → Deep]

- **Use a map only when geography is part of the answer.** "Which states have the most MSME suppliers?" is a ranking (a sorted bar chart). "Are our high-emission suppliers clustered in one industrial belt?" is spatial (a map). Many maps are bar charts that took longer to make.
- **Choropleths** (areas shaded by value) have three built-in problems:
  - **Area bias:** large, sparsely populated regions dominate visually. Rajasthan's area outweighs Kerala's population on a state map; at district level, Leh and Kutch dominate while dense urban districts shrink to specks.
  - **Counts vs rates:** shading by raw count mostly maps population. Normalise: per person, per ₹ crore of output, per km², per unit. Say which in the legend.
  - **The modifiable areal unit problem (MAUP):** the same data aggregated to states, districts or blocks can show different patterns. Choose the unit that matches the decision.
- **Classification:** quantiles (equal counts per class; good for ranking, can split near-identical values), equal intervals (easy to read, can put most areas in one class), natural breaks (Jenks; data-driven, harder to compare across maps), or unclassed continuous shading. Use 5–7 classes at most (Part 3) and state the method.
- **Alternatives when area misleads:** **tile grid maps** (each state as an equal square in roughly the right place), **cartograms** (areas resized by population), **proportional symbols** (circles scaled by area at centroids, Part 1), **dot density**, or a plain sorted bar chart beside a small locator map.
- **Projections:** Web Mercator inflates area with latitude by the square of the secant. Across India (about 8°N to 37°N), that inflates the far north by roughly 1.5× relative to Kerala (sec² 37° ≈ 1.57 vs sec² 8° ≈ 1.02). For India-wide thematic maps, a conic projection (Lambert conformal conic or an equal-area conic) is more faithful; web tile maps are acceptable for locating, not for comparing areas.
- **Boundaries change.** Districts are split and renamed often, so "district" data from different years don't join cleanly. Join on official **Local Government Directory (LGD)** codes rather than names, and record the boundary vintage.
- **Denominators are old.** Census 2027's population enumeration uses a reference date of 1 March 2027; until its tables are published, per-person rates divide by Census 2011 counts or official projections. Say which, because a 15-year-old denominator can move a district's rank.
- **India's boundaries: the law.** You are a law student, so here is the position precisely.
  - **Criminal Law Amendment Act, 1961, Section 2(1):** questioning "the territorial integrity or frontiers of India" by words, signs or visible representation, in a manner prejudicial or likely to be prejudicial to the safety or security of India, is punishable with up to three years' imprisonment, a fine, or both.
  - **Section 2(2)** (inserted by the Criminal Law Amendment (Amendment) Act, 1990): "Whoever publishes a map of India, which is not in conformity with the maps of India as published by the Survey of India, shall be punishable with imprisonment which may extend to six months, or with fine, or with both." No intent requirement appears in the text.
  - **Case:** in *The Hindustan Times & Anr. v. State* (Delhi High Court, 16 May 2002), a prosecution under Section 2(2) arose from a published map of India that omitted the Andaman & Nicobar and Lakshadweep islands; the High Court allowed the prosecution's application to withdraw. The case shows the provision is used and that omissions (not only disputed borders) count.
  - **Enforcement in practice:** in June 2021, police in Uttar Pradesh registered an FIR against Twitter India's head over a map on Twitter's careers page that showed Jammu & Kashmir and Ladakh outside India (the reported FIR used IPC and IT Act provisions rather than the 1961 Act). Government has also used blocking powers under Section 69A of the IT Act against content with incorrect maps.
  - **Policy:** the Department of Science & Technology's **Guidelines for acquiring and producing geospatial data** (February 2021) liberalised mapping but kept the requirement that political maps of India follow Survey of India depictions, and said SoI political maps would be freely downloadable. The 2016 draft Geospatial Information Regulation Bill, with far heavier penalties, was not enacted.
  - **What this means for design:** any map of India you publish (in EcoTrace, a report, a slide, a social post) must show India's external boundaries as the Survey of India does, including all of Jammu & Kashmir and Ladakh, Arunachal Pradesh, and the island territories. Source the outline from the Survey of India's Online Maps Portal or data derived from it; the Natural Earth project publishes an **India point-of-view** version of its country boundaries (`ne_10m_admin_0_countries_ind`); community repositories such as DataMeet's maps have integrated SoI boundaries but must be checked. Web map providers localise boundaries by viewer country (Google Maps shows India's claimed boundaries to users in India; Mapbox exposes a "worldview" setting), so a global product may show different borders to different users, which is a legal decision, not a styling one.
  - **Tools:** check the India basemap in any chart tool before publishing. Datawrapper and Flourish both accept uploaded GeoJSON/TopoJSON boundaries, so you can use a compliant outline. This is also a fact to re-verify before any launch: map law is the kind of rule that moves.
- **Worked decision: EcoTrace's supplier map.** Clients want to see where Scope 3 suppliers are.
  - **Options:** (A) a global web map with pins. (B) a state tile grid map of emissions per supplier count. (C) a sorted bar chart by state plus a small SoI-compliant locator map.
  - **Criteria:** legally compliant for Indian users; honest about area; readable on phones; exports to PDF.
  - **Choice: C by default, B as an option for clients with suppliers in more than ten states.** A pin map mostly shows where cities are.
  - **Consequences:** the product ships one vetted India outline asset, used everywhere; design QA includes a "boundary check" item; no third-party basemap appears in exports.

**Intuition anchors**
- A map is right only when "where" is part of the question.
- Shade rates, not counts, and say which rate.
- Any map of India is a legal document. Use Survey of India boundaries, every time.

**Mastery checks**
- Explain area bias, counts vs rates and the MAUP with Indian examples.
- Compare quantile, equal-interval, natural-breaks and unclassed shading.
- Quote Section 2(2) of the Criminal Law Amendment Act, 1961, and say when it was inserted.
- Name three sources of compliant India boundaries and one risk in using global basemaps.
- Explain why district joins should use LGD codes and state the denominator problem before Census 2027 data is out.

**Analysis**
- Find three maps of India published by global brands, apps or AI image tools. Check each against the SoI political map. Write a short legal note for each (compliant, non-compliant, what is missing), as you would for a client.
- Make the same district-level dataset as a choropleth by count, a choropleth by rate and a tile or bar alternative. Ask two people which district "is worst" from each.

**Taste**
- Good cartographers are sceptical of maps. The best map is often a small one next to a better chart.

---

## PART 7 — Storytelling & Scrollytelling [Core → Deep]

- **Narrative visualisation** sequences chart and text so the reader is walked through a "why" (Segel & Heer, "Narrative Visualization: Telling Stories with Data", *IEEE TVCG*, 2010). Of their genres, the **stepper** and **scrollytelling** dominate the web.
- **The martini glass** (Segel & Heer): a linear, author-driven opening (the stem) that opens into free exploration (the bowl). A BRSR report can open with three guided findings, then hand the reader an explorable table (Part 4).
- **Mechanics:** a graphic is pinned (`position: sticky`) while text "steps" scroll past; `IntersectionObserver` fires each step, which triggers one chart change — a highlight, a filter, a transition (18 Part 9). Build it with Scrollama.js (Russell Goldenberg, The Pudding) or no-code with Flourish's Scrolly template (confirmed current, 2026) or Datawrapper's River.
- **One claim per step.** Reveal one series or annotation per step; the text makes a claim, the chart change proves it (Part 0).
- **Story vs dashboard:** a story is read once and can spend a screen's height on one number; a dashboard (Part 5) is revisited and must answer instantly. Don't scrollytell a page opened every Monday.
- **Worked decision: EcoTrace's "why BRSR applies to you" explainer.** Options: (A) a static PDF, (B) a four-step scrollytelling piece, one chart state per step, (C) a video. Criteria: works on a slow connection, finishable in one sitting, no per-view hosting cost. **Choice: B.** Consequence: ships as static HTML, and completion is measurable per step, which neither a PDF nor a video gives the product team.

**Intuition anchors**
- A story is read once; a dashboard is checked weekly.
- One step, one claim, one chart change.
- Scrollytelling is a build technique in service of the martini glass, not a genre on its own.

**Mastery checks**
- Name Segel & Heer's genres and place scrollytelling among them.
- Explain the martini-glass structure with an EcoTrace example.
- Describe how `IntersectionObserver` and Scrollama.js drive a step change.

**Analysis**
- Find one scrollytelling piece from The Pudding, Reuters Graphics or the FT. List its steps and the one claim each makes.

**Taste**
- The best data stories disappear into the reading. You remember the finding, not the scroll.

---

## PART 8 — Accessible Charts: Screen Readers, Keyboard & Non-Text Alternatives [Core → Deep]

15 Parts 1–3 cover WCAG structure and accessible names generally; this Part is charts specifically.

- **Three layers:** perceptual (colour and contrast, Part 3), structural (semantic markup), interactive (keyboard and screen reader). All three must pass.
- **Give the SVG an accessible name:** `role="img"` with `<title>` and `<desc>`, or `aria-labelledby`/`aria-describedby` pointing to visually-hidden text. A legend alone is not an accessible name.
- **Pair every chart with a data table or text summary**, visually hidden rather than `display:none`-removed. This satisfies WCAG 1.1.1 and gives low-vision and keyboard users a second route to the numbers.
- **Canvas charts need a manual ARIA layer:** a live region announcing the focused point on arrow-key movement, and a visible focus ring, since canvas draws pixels, not DOM nodes.
- **Recharts 3's `accessibilityLayer`** (on by default, context stamp) adds keyboard focus and a per-point announcement — a strong default, not a guarantee; pie and treemap shapes still need custom testing.
- **Test with a real screen reader**, at least NVDA (free, Windows), before shipping (15 Part 3); axe and Lighthouse check markup, not the reading experience.
- **Worked decision: EcoTrace's Scope 3 chart for a visually impaired auditor.** Options: alt text only; chart plus a sortable table; chart plus a generated summary plus the full table. Criteria: verify one named supplier's number without a sighted colleague. **Choice: the third**, table as source of truth. Consequence: every Meridian UI chart ships a required `<TableFallback>` slot.

**Intuition anchors**
- A chart's accessible name is not its legend.
- The fallback table is the exact-value view, not an afterthought (Part 4).
- Test with a real screen reader before trusting a default.

**Mastery checks**
- Write the `<title>`/`<desc>` markup for an SVG bar chart.
- Explain why canvas charts need a manual ARIA layer.
- State what `accessibilityLayer` gives by default in Recharts 3, and what it doesn't.

**Analysis**
- Unplug the mouse and read every value of one chart you built with NVDA and the keyboard alone. List what failed.

**Taste**
- An accessible chart is usually just a well-labelled chart with a table next to it — a low bar, routinely missed.

---

## PART 9 — Uncertainty, Honesty & Ethics: Where Charts Lie [Core → Deep]

- **Darrell Huff, *How to Lie with Statistics* (1954)** remains the primer: truncated axes, cherry-picked ranges, unlabelled units, the "gee-whiz" graph.
- **Tufte's Lie Factor** (1983): the size of the effect shown, divided by the size of the effect in the data; it should sit near 1. A bar truncated at 90 instead of 0 can carry a Lie Factor above 10 for a small real change (Part 1).
- **Alberto Cairo, *How Charts Lie* (2019),** sets out failure modes: badly designed, built on wrong or incomplete data, lacking context or uncertainty, made to entertain rather than inform, or built to exploit a reader's own biases.
- **Show uncertainty, don't hide it:** error bars or shaded confidence bands for estimates; a projection dashed and labelled "projected", never given a measured line's weight.
- **Log scales compress growth** and must carry the words "log scale" with real ticks, or a reader assumes linear change from an exponential curve. **3D and perspective distort area and length** (Part 1) and are close to never legitimate for a real chart.
- **The decorative-fake-data problem** (Part 4): an invented "Flasks Per Day" line chart and stat tiles as hero content on a concept app, with no real data behind them (`TD-01#29 · @rondesignlab · DcJT7TBDAz1`) — fine in a portfolio piece, dishonest the moment it ships as a real number.
- **Ethics here carry legal weight.** SEBI's rules on ESG Rating Providers and the wider securities-law exposure around "greenwashing" mean overstating an ESG number is argued in India as a potential securities-fraud issue, not only a disclosure-quality one (verify any specific circular's current wording before advising a client — this area kept moving through 2025–26). A flattering chart is a liability for the client and whoever built the dashboard.
- **Worked decision: EcoTrace shows a client's emissions rose 6% this quarter.** Options: start the axis above zero to shrink the rise; show it plainly, annotated with the real cause (a new plant online); bury it behind a click. **Choice: show it plainly, always** — annotation, not compression, gives bad news context. Consequence: the chart component has no "compress bad news" mode; it is a written product principle, not a per-designer judgement call.

**Intuition anchors**
- Lie Factor near 1; truncated bars, unlabelled log scales and undashed projections all push it away.
- A projection is not a measurement. Say so on the chart.
- In a compliance product, a flattering chart is a legal risk, not a style choice.

**Mastery checks**
- Compute the rough Lie Factor of a bar truncated at 80% of its true baseline.
- List Cairo's failure modes with one example each.
- Explain the EcoTrace worked decision and why compression was rejected outright.

**Analysis**
- Find one truncated or unlabelled-axis chart in Indian financial media. Redraw it with a true baseline and note how the story changes.

**Taste**
- The most persuasive honest chart and the most persuasive dishonest one often look identical at a glance. The difference is entirely in what isn't shown.

---

## PART 10 — Tools & Code: A React Charting Stack, and the Free Path [Core → Deep]

- **Choose a library on three criteria:** control (how much of a mark's shape you own), defaults (accessibility, responsiveness, animation out of the box), rendering (SVG under roughly a thousand points; canvas for large or dense data).
- **Recharts 3** (3.10, July 2026): declarative, strong defaults, `accessibilityLayer` on by default, the base shadcn/ui's chart primitives (`--chart-1…n`) now run on. Default choice for Meridian UI's standard set because it composes with existing shadcn/Tailwind patterns.
- **visx 4.0** (June 2026): unstyled low-level primitives over D3's math — full control. Reach for it only when a chart needs a shape Recharts can't do (a bullet graph, Part 5; a custom small-multiple grid, Part 2).
- **Apache ECharts 6.1** (May 2026): canvas-first, handles large datasets, wide chart-type library. Strongest for a dense internal ops dashboard, weaker fit than Recharts for the client-facing SME product.
- **D3 7.9** underlies most of the above; learn its scales and shape generators even inside a wrapper, since every wrapper's escape hatch is "drop into D3". **Observable Plot** is fastest for exploration (Part 0) but not meant for production components.
- **Free tools for one-off reports** (verified 2026): Datawrapper's free plan (attribution required; Pro removes it at $21/user/month, API billed from 1 October 2026); Flourish, free for public projects, including its scrollytelling template (Part 7); Observable's free notebook plan. Use these for a document that ships once, rather than a bespoke React chart.
- A Tailwind shade-scale generator such as UIColors.app previews a colour against a live chart-and-card dashboard while generating the 50–950 scale (`TD-10#51 · @templyo · DGyK7kYOsx9`) — 03 Part 10's "test on a real surface" discipline, applied to data tokens.
- **Performance:** switch SVG to canvas past roughly one to two thousand points; memoise data transforms (`useMemo`) so a re-render doesn't re-bin a year of daily readings on every filter keystroke.
- **Worked decision: Meridian UI's chart-library choice.** Options: one library for everything (ECharts); Recharts for the component library with visx only for bespoke marks; raw D3 throughout. Criteria: ships fast, fits existing tokens, junior-maintainable, accessible by default. **Choice: Recharts plus visx where needed.** Consequence: ECharts is reserved for a future analytics-only surface, keeping the bundle and API surface small.

**Intuition anchors**
- Control, defaults, rendering — in that order, decide the library.
- SVG until it's slow, then canvas.
- A free tool for a one-off report beats a bespoke component for a document that ships once.

**Mastery checks**
- Give the three criteria for choosing a chart library and apply them to one EcoTrace chart.
- Explain when to reach for visx instead of fighting Recharts' API.
- State current (2026) facts about Datawrapper's free vs Pro plan.

**Analysis**
- Build the same bar chart in Recharts and in raw D3. Time each and list what the wrapper cost in control.

**Taste**
- Boring library choices, made once and documented, free a team to spend its judgement on the chart, not the plumbing.

---

## PART 11 — Product Decisions: The EcoTrace BRSR Visuals, Worked End to End [Core → Deep]

This Part is the module's synthesis: every earlier Part's rule becomes a line item in one real workflow.

- **BRSR's shape:** Section C covers nine Principles; **Principle 6 (environment)** is where most charts live — energy, GHG emissions, water, waste, air emissions. **BRSR Core** adds a smaller KPI set on SEBI's assurance glide path reaching the top 1,000 listed companies in FY 2026-27; Scope 3 disclosure became voluntary from FY 2025-26 (context stamp).
- **Step 1 — reader and decision.** Two readers share one dataset: the SME owner (dashboard, weekly, "am I on track") and the auditor (exported report, annual, "can I verify this"). One data model, two chart sets — Part 0's explore/explain split at product scale.
- **Step 2 — chart choice per line item, each decided once already and reused here:** Scope 1+2 trend → aligned line pair, not dual-axis (Part 2); Scope 3 by category → sorted bar, not a fifteen-slice pie (Part 1); energy mix → stacked area (Part 2's monthly-trend decision, reused at report scale); supplier location → SoI-compliant map plus sorted bar, never pins (Part 6); intensity ratio → a KPI tile with a peer-comparison band (Part 5), not a chart of one number.
- **Step 3 — the grid factor is a fact, not a choice, and every Scope 2 chart depends on it.** The CEA CO₂ Baseline Database v21.0 puts India's weighted-average grid factor at **0.710 tCO₂/MWh for 2024-25** against **0.727** the year before. A "Scope 2 fell" chart must name which year's factor it used (Part 4), because a cleaner grid, not the client's effort, can explain part of any fall — a distinction the annotation must make or the chart misleads by omission (Part 9).
- **Step 4 — assurance and traceability.** Every exported number traces to a source bill or meter reading; each chart gets a method footnote (Part 4) and its table sits one click away (Part 8's `<TableFallback>` serving audit here, not accessibility).
- **Step 5 — the legal layer is a QA checklist item.** No exported chart skips the map boundary check (Part 6) or ships a compressed-bad-news axis (Part 9).
- **Step 6 — one component, three surfaces:** the same chart renders as a dashboard tile (Part 5), a regulator-formatted PDF page (12 Part 3), and a step in a client-facing scrollytelling explainer (Part 7) — from one data model, not three separate builds.

**Intuition anchors**
- Two readers, one dataset, two chart sets.
- The grid factor moving is not the client's effort. Say which factor-year a chart used.
- Every exported chart carries its source table one click away.

**Mastery checks**
- Map each BRSR Principle 6 line item to a chart form and justify it against Part 1's ranking.
- State the two CEA grid-factor figures and explain why the factor-year matters to a trend chart.
- List the three surfaces one chart component renders to and the earlier Parts' rules each draws on.

**Analysis**
- Take one published BRSR report's Principle 6 charts. Redesign them with this Part's choices; note which already meet the bar.

**Taste**
- A compliance chart that is also useful to the person filing it is the real test of whether the decisions were right.

---

## PART 12 — How Users Read Charts: Memorability, Misreading & Testing [Core → Deep]

- **Eye-tracking:** Borkin, Vo, Bylinskii, Isola, Sunkavalli, Oliva & Pfister, "What Makes a Visualization Memorable?" (*IEEE TVCG*, 2013) and "Beyond Memorability" (2016): titles and text are fixated first and longest; unique visual structure predicts what a viewer recalls weeks later; plain, generic bar and line charts are among the least memorable class.
- **The embellishment debate:** Bateman, Mandryk, Gutwin, Genest, McDiarmid & Brooks, "Useful Junk?" (CHI 2010): Nigel Holmes-style pictorial embellishment was recalled better weeks later than plain equivalents, without measurably hurting comprehension in that study. Contested since; treat it as "decoration can help recall of a one-off editorial chart", not licence for a product dashboard, which is read repeatedly and needs speed over memorability (Part 5).
- **Comprehension has levels, test all three:** elementary (read one value), intermediate (compare two, spot a trend), overall (synthesise the pattern, state the "so what" from Part 0).
- **Common misreadings to test for**, each already named in this file: a stacked bar's floating middle segment read from zero (Part 1); a rainbow assumed to rank (Part 3); a choropleth's darkest district read as "the most" when it may be the least populated (Part 6); a smoothed six-point line read as measured (Part 9); "no data" drawn as zero and read as collapse (Part 5).
- **Testing, cheapest first:** the **five-second test** (show it, ask what it says); a **cloze/description task** (write the finding in one sentence, compare to the intended title, Part 4); **think-aloud** at all three comprehension levels (24 Part 4's method, applied to a chart); a **before/after comparison** of error rate and time on old vs redesigned, not preference alone.
- **Preference is not performance.** Pair any "which do you like" question with a task-based one (24 Part 11).
- **Worked example, revisited from testing:** Part 5's dashboard choice (completeness-first) came from exactly this. The kit-style prototype tested well on preference ("looks professional") and badly on task: four of five testers could not answer "what should you do next" from the screen. Task performance overrode preference.

**Intuition anchors**
- Test what people do with the chart, not only what they say about it.
- Elementary, intermediate, overall — a chart that only passes the first level isn't finished.
- A memorable editorial chart and a fast operational chart are different design problems.

**Mastery checks**
- State the Borkin findings on what predicts a chart's memorability.
- State the Bateman finding and its limit for product work.
- Write one test question at each comprehension level for an EcoTrace chart.

**Analysis**
- Run a five-second test and a description task on a plain vs annotated version of one chart, three people each. Compare what they wrote to your intended finding.

**Taste**
- The chart that tests well is rarely the one you were proudest of drawing. Trust the test.

---

## PART 13 — Masters, Connections & Taste [Lifelong]

- **Founders:** William Playfair, who invented the bar, line and pie chart in the late eighteenth century; Charles Joseph Minard's 1869 map of Napoleon's Russian campaign, six variables in one static graphic; Florence Nightingale's 1858 polar-area "rose diagram", built to persuade Parliament to act on army sanitation — a chart engineered for one decision, Part 0's discipline in its earliest form.
- **The statistical-graphics lineage:** John Tukey (exploratory data analysis, the box plot, 1977); William Cleveland (Part 1's ranking, 1985); Edward Tufte (the data-ink ratio, the Lie Factor, small multiples, 1983) — read him for the eye he trained, and argue with him where Part 12's embellishment debate complicates the minimalism-always instinct.
- **Data journalism:** Hans Rosling and Gapminder's bubble charts, from the mid-2000s; Amanda Cox and the *New York Times* graphics desk; Alan Smith and the *Financial Times* visual journalism team (Part 2); Mona Chalabi's hand-drawn style, deliberately breaking the clean-chart convention to signal a person is speaking; Giorgia Lupi's "data humanism" and *Dear Data* (with Stefanie Posavec, 2016), a year of hand-drawn personal-data postcards, arguing data can be intimate, not only precise.
- **Code-first practitioners:** Mike Bostock, creator of D3 (Part 10) and the NYT's small-multiples tradition; Nadieh Bremer (Visual Cinnamon) for generative, radial forms; Shirley Wu and Cedric Scherer, contemporary D3/R practitioners worth the weekly rebuild habit from the learning loop.
- **India:** The Hindu's Data Team and Reuters Graphics' India desk, for sourced daily graphics under deadline and Part 6's legal constraints; Rukmini S., an India data journalist worth following for how she sources, caveats and corrects numbers in public.
- **Cross-pollination:** cartography (Part 6) for classification and projection; statistics (Part 9) for what a chart may claim; typography (04) for the words that carry most of a chart's meaning (Part 4); journalism for sourcing discipline; law, Mohit's own field, for reading a chart as a court reads evidence — relevant, reliable, complete, or misleading by omission (Part 0, closed here).
- **Building taste:** keep two swipe files — charts that made you stop, and charts that fooled you until you looked twice. The second teaches more, and takes more self-scrutiny to keep.

**Intuition anchors**
- Every modern chart form has a named inventor and a decision it was built to change.
- Tufte is a starting position, not a finishing one.
- A chart is evidence. Read it, and build it, like a lawyer would.

**Mastery checks**
- Name three historical charts and the decision or argument each was built for.
- Contrast Tufte's minimalism with the Bateman findings and say when each applies.
- State the cross-pollination list and add one connection of your own.

**Analysis**
- Rebuild one master's chart from scratch in code. Write three sentences on what the rebuild taught you that reading about it didn't.

**Taste**
- The designers on this list agree on very little except one thing: draw the real data, including the ugly rows, before deciding what it means.

---

## Resource Library

**Primary**
- Tamara Munzner, *Visualization Analysis & Design* (2014) — the marks-and-channels framework (Part 1).
- Edward Tufte, *The Visual Display of Quantitative Information* (1983) and *Beautiful Evidence* (2006).
- Alberto Cairo, *How Charts Lie* (2019) (Part 9).
- Stephen Few, *Show Me the Numbers* (2004/2012) and *Information Dashboard Design* (2004) (Parts 4–5).

**Books**
- William Cleveland, *The Elements of Graphing Data* (1985).
- Darrell Huff, *How to Lie with Statistics* (1954).
- Andy Kirk, *Data Visualisation: A Handbook for Data Driven Design* (2019).
- Giorgia Lupi & Stefanie Posavec, *Dear Data* (2016).
- Jacques Bertin, *Sémiologie graphique* (1967) — the origin of marks and variables (Part 0).

**Courses (free or covered)**
- Observable's Plot docs, Datawrapper Academy, and Flourish's scrollytelling walkthrough — all free.
- The *Financial Times* Visual Vocabulary poster (free PDF, for Part 2's task map).

**From your catalogue**
- `TD-02#51 · @abnux · DRoxTqRAZUi` — live operational data as spectacle (Part 0).
- `TD-02#52 · @josh_yolkk · DNSfDDqtYsr` — operational data as B2B content (Part 0).
- `TD-09#14 · @ellydoesdesign · Db4OwAbOZxK` — force-directed network as decorative trope (Part 2).
- `TD-04#10 · @sammmhirst · DcOD6xgKGj1` — halation on dark surfaces, applied to thin chart lines (Part 3).
- `TD-01#31 · @chris.raroque · DZdIWw6ixWA` — a single live number as a home-screen widget (Part 5).
- `TD-01#32 · @thedesignely · DUikq2BjUnk` — dense broadcast UI conventions (Part 5).
- `TD-10#8 · @craftwork.design · Db3nWqTGv0s` — the bento-grid dashboard aesthetic (Part 5).
- `TD-09#15 · @aj.on.ai · DcEJDHBTyPY` — tells of a generated, default dashboard (Part 5).
- `TD-11#28 · @growzutrue · DMwKogUv4dJ` — when images beat tables, and when they don't (Part 4).
- `TD-07#8 · @ryanbailey.cb` — micro-typography and the credibility it signals (Part 4).
- `TD-13#20 · @theedgarr · DbcbYLxFQaQ` — learning dashboard convention by large-sample survey (Part 5).
- `TD-01#29 · @rondesignlab · DcJT7TBDAz1` — decorative fake data on a concept product (Part 9).
- `TD-10#51 · @templyo · DGyK7kYOsx9` — a shade-scale tool tested on a live chart surface (Part 10).

**Practice** — `T8-design-22-data-visualisation.md`.

---

## Suggested Learning Order

1. **Foundations and perception** (Parts 0–1) — 3 hrs.
2. **Chart choice by task, against your own EcoTrace fields** (Part 2) — 3 hrs.
3. **A data colour system in OKLCH, tested colour-blind and greyscale** (Part 3, with 03 Part 10) — 4 hrs.
4. **Words, numbers, one rebuilt table** (Part 4) — 3 hrs.
5. **One decision-first EcoTrace dashboard** (Part 5) — 4 hrs.
6. **Maps: the legal boundary check, one dataset three ways** (Part 6) — 3 hrs.
7. **One scrollytelling explainer, Scrollama or Flourish** (Part 7) — 4 hrs.
8. **Accessibility pass on every chart so far, tested with NVDA** (Part 8) — 3 hrs.
9. **Honesty audit: Lie Factor on three published charts** (Part 9) — 2 hrs.
10. **Set up the React chart stack for Meridian UI** (Part 10) — 4 hrs.
11. **The EcoTrace BRSR chart set end to end, all three surfaces** (Part 11) — 6 hrs.
12. **One round of five-second and comprehension testing** (Part 12) — 3 hrs.
13. **Rebuild one master's chart, in code** (Part 13) — 3 hrs.

**Total: ≈ 45 hours**, before the T8's drills, builds and belt gates.
