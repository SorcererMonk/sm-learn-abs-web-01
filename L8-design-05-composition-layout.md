# Composition & Layout → Architecture of the Page and Screen
## L8: Design: 05 · The Frame · Grids · Composition Techniques · Eye Movement · Responsive Layout · Depth & Density · Print & Editorial Space · Masters · Diagnosis · Scanning Behaviour by Medium · Worked Layout Decisions · One Message, Many Frames

> This is the **learning** file for arranging things in space: the frame and its proportions, grid systems from medieval manuscripts to CSS Grid, the techniques of composition (focal points, paths, tension, cropping, layering), how eyes actually move across layouts, responsive layout for screens, depth and dense-information layout, page and spread structure for print, the masters who defined the discipline, and how to diagnose a layout that "feels off". It deliberately stops where specialised layouts begin: long-form publication design is `L8-design-12-print-editorial.md`, interface patterns and flows are `L8-design-13-ui-ux.md`, full web layout practice is `L8-design-16-web-design.md`, and CSS implementation is `L18-cs-design-engineering.md` / `L18-cs-web-engineering.md`. The training counterpart is `T8-design-05-composition-layout.md`.
>
> **Currency stamp (September 2026):** CSS Grid (with **subgrid**), Flexbox and **container queries** are baseline across browsers, so layouts can respond to their container, not just the viewport. Figma's auto layout now includes a **Grid** flow (Config 2025) alongside horizontal, vertical and wrap, which makes Figma layouts closer to CSS than ever. Award-tier web layout (`TD-02`) is dominated by bento grids, cinematic heroes, large-type footers and scroll-driven composition. Know them as current idioms, not timeless truths.

---

## How To Use This Document

**Depth ladder:** **L1** Name it · **L2** Use it correctly · **L3** Choose it over alternatives · **L4** Explain the mechanism · **L5** Create a version from scratch · **L6** Teach it and critique misuse.

**Tier tags:** **[Core]** every designer · **[Deep]** senior depth · **[Frontier]** specialist or moving.

**Each Part closes with:** *Intuition anchors* · *Mastery checks* · *Analysis* · *Taste*.

**The layout-specific learning loop:**
1. **Content before container.** Inventory and rank the content (02 Part 2) before choosing a grid. A grid chosen before the content is known is a cage, and one derived from the content is a skeleton.
2. **Overlay structure on great work.** Trace grids, axes and compositional shapes over finished posters, spreads and screens (`TD-05#11 · @nicolasallison_ · DBPF_VRPa-O`: diagonal, pyramid, symmetry, circular). Twenty tracings teach more than any book.
3. **Thumbnail first.** Explore compositions at 2–5 cm on paper or in tiny Figma frames. At thumbnail size only structure is visible, which is exactly what you're deciding.
4. **Design the extremes.** Every responsive layout gets checked at 320px, 768px, 1280px and 1920px, with the shortest and longest real content. Layouts fail at the edges, not in the middle.
5. **Diagnose by symptom** (`TD-05#8 · @lightfuldesignco · DboQhOGlqwc`): "feels off → grid; flat → contrast; don't know where to look → size; heavy → remove". Never fix a layout by adding.
6. **Break the grid only from a grid.** Every deliberate break must be measurable against the underlying structure. That's what makes it read as intent.

**Relationship to the other files:**
- `L8-design-02-theory-principles.md` supplies the principles (proximity, alignment, balance, proportion) that this file organises into systems.
- `L8-design-04-typography.md`: the measure, type size and leading determine column widths and baseline grids. **Type comes before grid.**
- `L8-design-06-neuroscience-psychology.md` covers eye movement and attention in depth. Part 3 here is the working summary.

---

## PART 0 — Foundations: Composition, Layout & the Frame [Core]

- **Composition vs layout:** **composition** is arranging visual elements within a frame to create a unified, directed experience. It applies to a painting, a photo, a poster or one screen. **Layout** is composition applied to *information* across a system: pages, screens, templates and states, usually with repeated structure. Composition asks "where does the eye go?" Layout also asks "where does *every future piece of content* go?"
- **The frame is the first decision:** its **format** (aspect ratio and size) pre-decides much of the composition. Portrait (4:5 Instagram, A-series, 9:19.5 phones) favours vertical stacking and reading. Landscape (16:9, 3:2) favours horizon, sequence and panorama. Square (1:1) is static and centred, the hardest to make dynamic. Extreme ratios (a 1:3 banner, a 9:16 story) force sequencing. **Choose or acknowledge the format before you compose.** Ask what the medium's real frames are: a laptop above the fold, a phone in a thumb, a billboard at 60 km/h.
- **Content inventory and priority:** list every element (text blocks, images, actions, metadata, legal lines) and **force-rank** them (02 Part 2). The ranking becomes size, position and space. Most layout struggles are unranked content, not bad arrangement.
- **Positive and negative space:** the shapes of the empty areas matter as much as the shapes of the content. Consistent, deliberate negative space reads as calm and premium (`TD-05#12 · @reputeforge · C7du5bCy9c2`). Leftover, irregular gaps read as accidental. **Give white space a shape.**
- **The structural skeleton of the frame:** Arnheim (02 Part 3): the centre, vertical and horizontal axes, and diagonals are lines of force even when nothing is drawn on them. Elements near them feel stable or aligned. Elements slightly off them feel tense or "wrong". Being *clearly* on or *clearly* off is fine. Being *nearly* on is the most common compositional error.
- **Visual path:** every good composition has an **entry point** (the dominant element), a **route** (implied lines, gaze, sequence of sizes) and an **exit** or resting point (the CTA, the logo, the signature). Plan it as consciously as a story's beginning, middle and end.

**Intuition anchors**
- The frame is not the edge of the design. It's the first element of it.
- Layout problems are usually priority problems in disguise. Rank the content and half the layout designs itself.

**Mastery checks**
- Distinguish composition from layout with an example of a task that needs each.
- Explain how 1:1, 4:5 and 16:9 formats push composition differently.
- Explain why "nearly aligned" is worse than "clearly misaligned".
- Map the entry, route and exit of a poster you admire.

**Analysis**
- Take one poster from `TD-07` and one app home screen. For each: frame ratio, content inventory with ranking, entry point, route, exit and the shape of the negative space *[Figma: White, overlay]*. Write which one makes its route clearer and why.

**Taste**
- Treat every frame as a room you're furnishing for a visitor who has three seconds. Put the one thing that matters where they'll look first, give them a clear path, and leave enough empty floor to walk on.

---

## PART 1 — Grid Systems [Core → Deep]

- **Why grids:** a grid is a **set of decisions made once** about where things can go. It gives consistency (every page belongs to one family), speed (fewer decisions per page), rhythm (repeated intervals) and a baseline to measure deliberate breaks against. Josef Müller-Brockmann, *Grid Systems in Graphic Design* (1981): *"The grid system is an aid, not a guarantee."*
- **Grid anatomy:**
  - **Format:** the page or screen.
  - **Margins:** space around the live area.
  - **Columns:** vertical divisions.
  - **Gutters:** space between columns.
  - **Rows:** horizontal divisions.
  - **Modules:** the cells formed by columns × rows.
  - **Spatial zones:** groups of modules assigned roles.
  - **Flowlines:** horizontal alignments that break the page into bands.
  - **Markers:** positions for folios, running heads and navigation.
  - **Baseline grid:** the underlying lines on which all text sits.
- **The six grid types** (`TD-05#3 · @expert.pitch · DcWO7fijKur`: radial, modular, column, hierarchical, baseline, axial):
  - **Manuscript/block:** one text area, for books and long reading.
  - **Column:** 2–12 columns, the default for magazines and the web, often "the least interesting choice" when used lazily.
  - **Modular:** columns plus rows, for complex editorial pages, dashboards and catalogues.
  - **Hierarchical:** zones proportioned by content importance rather than equal units, for home pages and posters.
  - **Baseline:** vertical rhythm, the one that "makes long-form typography feel professional".
  - **Axial/radial:** elements arranged along one axis or around a centre, for posters and experimental work.

  **Compound grids** overlay two systems (e.g. 4 and 6 columns on one 12-column base) for flexible editorial work. Karl Gerstner's grid for *Capital* magazine (1962) is the famous 58-unit "mobile" grid that divides into 1, 2, 3, 4, 5 or 6 columns (*Designing Programmes*, 1964).
- **Building a grid from the content, the professional sequence:** (1) body type size and leading (from 04) → (2) the measure (45–75 ch) sets the column width → (3) the leading sets the **baseline increment** (e.g. 24px) → (4) gutters are typically a multiple of the baseline or ~1 em → (5) module heights are whole numbers of baselines → (6) margins are proportioned to the format and binding (Part 5) → (7) images crop to module boundaries. **A grid built this way makes type and image share one rhythm.** A grid drawn first and filled later fights the type forever.
- **Screen grids:** the **12-column** grid dominates the web because 12 divides into 1, 2, 3, 4 and 6 (a lineage from 960.gs (2008) and Bootstrap (2011)). Common settings are 12 columns at desktop (e.g. 1200–1440px container, 24–32px gutters), 8 at tablet and 4 at mobile, with margins of 16–24px on phones. **Spatial systems:** an **8-point grid** (4-point for fine detail) for all spacing and sizing, plus a **4px baseline** for type in UI (line-heights in multiples of 4). Material, Apple and most design systems formalise this (bridge to 14).
- **Grids in Figma:** layout grids (columns, rows, grid) on frames; **auto layout** (horizontal, vertical, wrap and, since 2025, **grid**) for component and page structure, with padding and gap bound to spacing variables. The mental model is **auto layout for structure and flow, layout grids for alignment checks and editorial placement**. `T8-design-34-figma.md` teaches both.
- **Experimental grids:** elliptical, oblique and diagonal grids are **constructions, not accidents**. "Drop your own content onto them and it looks considered, not lucky". A diagonal grid is the fastest way to make a static layout feel kinetic (`TD-05#1 · @bau.artspace · DcN-vAdACr1`).
- **Breaking the grid:** a deliberate break (an image bleeding across columns, a headline hanging into the margin, a rotated element) gains force *because* everything else obeys. **Rule: break in one place, for one reason, in a way that's still measured against the grid** (e.g. an image that bleeds by exactly one column).

**Intuition anchors**
- A grid is a promise to your reader that things will be where they expect. Break that promise only when surprise is the point.
- Type size decides the grid, not the other way round.

**Mastery checks**
- Name the parts of a grid and the six grid types with a use for each.
- Derive a baseline grid and column width from 17px body type at 1.5 leading and a 66ch measure.
- Explain why 12 columns became the web default and what Gerstner's 58-unit grid achieves.
- Explain the difference in role between Figma layout grids and auto layout.

**Analysis**
- Take one Swiss poster (Müller-Brockmann) and one magazine spread. Reconstruct each grid in Figma *[Figma: Yellow]*: margins, columns, gutters, baseline and flowlines. Then place your own content on each grid and write what the grid decided for you.

**Taste**
- Make your grid from the smallest unit of your content: the line of body text. When the grid, the type and the images share one module, the page gets a calm consistency that no amount of polishing achieves otherwise.

---

## PART 2 — Composition Techniques [Core]

- **Focal point and dominance:** one element dominates through the hierarchy levers (02 Part 2). A composition with two equal focal points splits attention and feels undecided, and one with none feels like wallpaper.
- **Placement structures** (`TD-05#11`, `TD-05#14 · @uxui_howard.le · C7byxFCvoe0`):
  - **Rule of thirds:** place key elements on intersections and lines of a 3×3 division. Reliable and slightly conventional.
  - **Centred / Highlight Centered:** stable, iconic, ceremonial.
  - **Diagonal:** dynamic, directional.
  - **Pyramid/triangle:** stable, hierarchical, classical group composition.
  - **Circular:** enclosing, cyclical, focus-drawing.
  - **Symmetry:** formal, calm.
  - **2/3 : 1/3 split:** beats 50/50 as a default because it creates a dominant.
  - **Bento:** varied tiles in one container (`TD-01#33 · @ux.wassh_ · DR-Pqv7DLAX`).
  - **Washitsu:** a Japanese-room-like modular division.
- **Leading lines and gaze:** roads, rails, arms, horizons and implied lines steer the eye. **People in images direct attention where they look**, so a face looking *into* the layout toward the headline leads the reader there, and one looking *out* of the frame leads them away. Place portraits so they face the content.
- **Cropping:** crop to strengthen the subject, not just to fit. Tight crops create intimacy and tension, loose crops create context and calm. **Never crop at joints** (wrists, knees, necks) in figure photography. Mark the face position with an ellipse on the grid *before* placing the image, using a large circle for mass and a small one for the head, and crop to fit second (`TD-05#15 · @uxui_howard.le · C-ffSDfyOSB`). Leave "lead room" in front of moving or looking subjects.
- **Scale and depth:** scale contrast creates drama and depth. Overlapping creates front-to-back order (02 figure–ground). **Layering**, with stacked translucent planes, glows and blurs rather than drop shadows, is the current signature of interfaces that feel expensive (`TD-13#30 · @itsdesignertom · DBO18isvjcb`). Atmospheric perspective (farther = lighter and less saturated) carries from painting into UI elevation.
- **Tension and movement:** elements near the frame edge, off-balance placements, diagonals, and an element nearly touching another all create tension, which is useful for posters and dangerous in forms. Directional shapes and sequences of decreasing size create movement (02 Part 4).
- **Image–text relationships:** text **on** image (needs a calm area, a scrim or a gradient for contrast), text **beside** image (clean, editorial), text **integrated** with image (the subject overlapping the headline: premium, laborious), text **as** image (typographic compositions). Decide the relationship first. It drives the crop and the grid.
- **Grouping by space at layout scale:** related blocks sit closer, and sections are separated by larger, consistent gaps (02 Part 1). Inconsistent gaps are the most common amateur tell (`TD-05#7 · @createwithalena · Dbmo16xsHM4`).
- **Alignment at layout scale:** align to as few edges as possible. **Stop centring stacks of text** in UI (`TD-05#6 · @zanderwhitehurst · DcN2nJEu9L2`). Use centred composition only when the whole piece is symmetrical and ceremonial.

**Intuition anchors**
- Composition is choosing where to spend the viewer's first second. Crops, gazes and diagonals are how you point.
- If you can't draw the composition's shape (a triangle, a diagonal, an L, a circle) with one gesture, it probably doesn't have one.

**Mastery checks**
- Name six placement structures and give a poster or screen that uses each.
- State three cropping rules for photographs of people and why each matters.
- Explain how gaze direction in a photo changes the reading path, and how to use it.
- Name four image–text relationships and the contrast technique each needs.

**Analysis**
- Take `TD-05#11`'s method: overlay the four structures (diagonal, pyramid, symmetry, circular) on ten film posters of your choice *[Figma: White]*. Record which structure each uses. Then design one poster for a raga concert in each of the four structures and pick the best with a written reason.

**Taste**
- Every composition should have a shape you could draw in the air. Posters that feel memorable almost always reduce to one gesture, a strong diagonal or a heavy base and light top, and forgettable ones have no gesture at all.

---

## PART 3 — Eye Movement, Attention & Reading Gravity [Core → Deep]

- **What eye-tracking actually shows** (bridge to 06): eyes fixate on **high-contrast, high-information and human elements** (faces, text, numbers, prices) and skip decorative and low-contrast areas. First fixations tend toward the **centre of the display** (centre bias) and toward the most salient item, then follow learned reading patterns.
- **Reading gravity and the Gutenberg diagram:** Edmund Arnold's newspaper-design principle (1950s–60s) holds that in uniformly dense, text-heavy layouts, the eye enters at the **primary optical area (top-left)** and drifts to the **terminal area (bottom-right)**, with the other corners weak. It holds only for **evenly weighted** layouts. Strong hierarchy overrides it. Use it as the default for dense text, not as a law.
- **F-pattern, Z-pattern and layer-cake** (02 Part 2): **F** on text-heavy pages with weak headings (a symptom). **Z** on sparse pages with a few elements (logo → nav → hero → CTA). **Layer-cake** when headings carry meaning (the goal). **Spotted** for keyword hunting. Design headings, subheads and bold leads so layer-cake scanning delivers the page's meaning.
- **Faces and gaze:** faces attract fixations pre-attentively, and viewers follow a depicted person's gaze. A model looking toward a product or headline measurably increases attention to it in eye-tracking studies (e.g. the widely reported 2009 James Breeze baby-ad heatmaps). Keep direct-gaze faces away from where you need attention to *leave* them.
- **Reading direction and culture:** in RTL cultures (Arabic, Hebrew, Urdu) the entry point, reading path and many layout conventions mirror (navigation, progress direction, back arrows), but **not everything flips**: media controls, phone numbers, Latin brand marks and clocks don't. CSS logical properties (`margin-inline-start`) make layouts direction-agnostic. For Indian audiences all major scripts are LTR, except Urdu (RTL).
- **Banner blindness and ad-shaped elements:** users skip anything that *looks* like an ad (boxed, colourful, top or right, image-heavy) even when it isn't (Benway & Lane, 1998). Don't style key content like a banner.
- **Motion and attention:** any moving element captures attention involuntarily (the onset of motion is a strong pre-attentive cue), so autoplay carousels and animated banners steal attention from primary content. Use motion in layout to guide (a directional reveal), never to distract (bridge to 18).
- **Measure what you assume:** cheap methods like the **5-second test** (show the layout for 5 s, then ask what they remember), **first-click tests** and **click heatmaps** (Microsoft Clarity is free) replace guessing. Predict first, then test, and log the result (T8 probes).

**Intuition anchors**
- The eye goes to contrast, faces, numbers and motion first, and to your intentions only if they're expressed through those.
- Reading patterns aren't layouts to copy. They're what people do when your hierarchy fails or succeeds.

**Mastery checks**
- Explain the Gutenberg diagram and the condition under which it holds.
- Explain how gaze direction in imagery affects attention and give a layout rule from it.
- Explain what mirrors and what doesn't in an RTL layout.
- Describe a 5-second test and what it can and can't tell you.

**Analysis**
- Run a 5-second test with three people on two versions of a landing-page hero you design (one with the model looking at the camera, one looking at the headline) *[Figma: White + prototype link]*. Record what each person recalls, compare with your prediction and write the result into your log.

**Taste**
- Design for how eyes actually move, not how you wish they would. Your intended reading order is a hypothesis until someone else's eyes confirm it.

---

## PART 4 — Layout for Screens: Responsive, Intrinsic & Patterned [Core]

- **Responsive design:** Ethan Marcotte's *Responsive Web Design* (A List Apart, 2010) combined **fluid grids, flexible images and media queries** into one layout that adapts to any viewport. **Mobile first** (Luke Wroblewski, *Mobile First*, 2011) means designing the smallest, most constrained layout first, which forces content priority, then enhancing for larger screens. **Set breakpoints where the content breaks, not at device widths.**
- **Intrinsic web design** (Jen Simmons, 2018): modern CSS (Grid, Flexbox, `minmax()`, `auto-fit`, `clamp()`, and since 2023 **container queries** and **subgrid**) lets components size themselves from their content and container rather than from fixed breakpoints. The designer's job shifts from drawing four fixed artboards to **defining rules**: min and max widths, how columns reflow, what wraps, what truncates, what hides. Figma's auto layout (with min/max width, wrap and grid) is how you design those rules visually (bridge to L18 web and design engineering).
- **The mobile canvas:**
  - **Safe areas** (notches, home indicators, rounded corners).
  - **The thumb zone:** Steven Hoober's observational research (2013) found ~49% of people use phones one-handed, and the bottom-centre of the screen is easiest to reach. Hence bottom navigation, bottom sheets and primary actions low.
  - **Touch targets** of 44pt/48dp (02 Part 5).
  - **Vertical scrolling as the natural axis:** horizontal scroll must be signalled (continuity: cut-off cards).
  - **Density modes:** comfortable vs compact for data apps.
- **Common screen layout patterns**, known by name so you can choose deliberately:
  - **Single column** (reading, mobile).
  - **Sidebar + content** (apps, docs).
  - **Holy grail** (header, footer, two sidebars).
  - **Split screen** (onboarding, comparison).
  - **Card grid** (browsing).
  - **Masonry** (image-heavy).
  - **Bento** (feature showcases, dashboards). Fashionable now, and "it will read as period-specific later" (`TD-01#33`).
  - **Dashboard modular grid** (22).
  - **Master–detail** (email, files).
  - **Feed** (social).
- **Named web section typologies from your catalogue** (from `TD-02` @zachex; README table):
  - **Hero sections:** Cinematic Product · Gallery · Bento · Interface Product · Masthead.
  - **Footers:** Hero · Silhouette · Large-type · Negative · Grounded.

  Name the pattern before designing a section, then decide whether to use it straight or subvert it. Full web practice in `L8-design-16-web-design.md`.
- **"Above the fold"** is a real but overstated concern. People scroll when the top of the page promises value (01 myth list, 02 Part 5). The job of the first screen is to **establish what this is, for whom, and why to continue**, not to cram everything in.
- **Layout and accessibility:** **visual order must match DOM/reading order** (WCAG 1.3.2 Meaningful Sequence), because screen readers and keyboard users follow the code, not the picture. CSS Grid makes it easy to reorder visually and break this, so don't. Layouts must **reflow at 320 CSS px without horizontal scrolling** (1.4.10) and survive text-spacing overrides (1.4.12). Keyboard focus order follows layout order, so plan it (bridge to 15).
- **States and variable content:** real layouts must hold the empty state, the error state, the one-item list, the thousand-item list, the long name ("Venkatanarasimharajuvaripeta", a real railway station) and the missing image. **Design with extremes** (loop step 4). A layout that works only with ideal content is a picture, not a layout.

**Intuition anchors**
- On screens you don't design pages, you design rules for pages you'll never see. Think like a system.
- The smallest screen tells you what really matters. Everything else is enhancement.

**Mastery checks**
- Explain responsive vs intrinsic design and what container queries changed.
- Explain the thumb zone and three layout decisions it justifies.
- Name eight screen layout patterns and one appropriate use for each.
- Explain WCAG 1.3.2 and how CSS Grid reordering can violate it.

**Analysis**
- Take one website you use (a news site or a college portal) and screenshot it at 360, 768, 1280 and 1920px. Map how the grid and each section change. Mark one breakpoint where the content breaks badly, and redesign that transition *[Figma: Yellow, auto layout with min/max widths]*.

**Taste**
- Design the phone layout first and love it. If the smallest version is only a squeezed desktop, the product never decided what it's for.

---

## PART 5 — Depth & Density: Layering, Elevation and Complex-Screen Layout [Core → Deep]

- **Layout has a z-axis:** screens stack surfaces: page → cards → popovers → modals → toasts → system UI. Each layer needs a consistent **elevation logic** (shadow, lightness in dark mode, blur, scrim) so users always know what's on top and what's blocked. Material formalised elevation levels. Apple's materials (translucent blurs, the 2025 "Liquid Glass" language) express depth through translucency. **Layering with translucent planes and glows, not heavy drop shadows**, is the current premium idiom (`TD-13#30`). Rule: **one elevation scale, few levels (≈ 4–5), each with a job**.
- **Modality and focus layout:** modals, sheets and drawers temporarily re-compose the screen. The underlying layout recedes (scrim, blur, scale-down), and the new surface becomes the whole composition. Bottom sheets suit thumbs. Side drawers suit desktop detail panels. Full-screen takeovers suit focused tasks. A layout that stacks more than two modal layers has an information-architecture problem, not a layout problem (bridge to 13).
- **Density as a design variable:** data-heavy products (trading terminals, analytics, admin tools, legal research databases, your EcoTrace dashboards) need **high information density with low visual noise**. The techniques:
  - **Strict alignment:** column edges and numeric right-alignment.
  - **Hierarchy by weight and value, not size:** the size range is small in dense UIs.
  - **Subtle separators or zebra rows** only where alignment isn't enough.
  - **Tabular figures** (04 Part 3).
  - **Sticky headers and first columns.**
  - **Progressive disclosure:** row expansion, detail panels, hover cards.
  - **User-selectable density modes** (comfortable/compact).
  - **One accent colour** for exceptions and alerts.

  Tufte's principle is that clutter is a failure of design, not an attribute of information: dense can be clear.
- **Dashboard composition:** answer the user's top question at the **top-left** (the Gutenberg primary area for dense screens) with the largest element. Group related metrics in modules on a consistent card grid. Put **context before detail** (KPIs → trends → tables). Keep the number of distinct chart types low. Leave filters where they're predictable (top bar or left rail). **Small multiples** (the same chart repeated for different categories on one scale) beat one overloaded chart (bridge to 22). Common failure: a "bento of KPIs" where every tile is equally loud.
- **Split views and panes:** master–detail, three-pane mail/file layouts, resizable panels and inspector sidebars (like Figma's own UI) organise complex work. Use **fixed navigation, flexible content and collapsible inspectors**. Persist users' pane sizes. Ensure keyboard navigation moves between panes predictably.
- **Tables as layout:** tables are the most information-dense layout primitive. Align text left and numbers right, align headers with their data, keep row heights consistent (usually multiples of 4/8), and handle overflow with truncation plus a tooltip or wrapping by column type. Mobile tables become cards or prioritised columns, never a horizontal scroll of 12 columns without a sticky key column.

**Intuition anchors**
- Depth is information: what's on top is what matters now. Treat elevation like hierarchy, with few levels and each earned.
- Density isn't the enemy of clarity. Misalignment is.

**Mastery checks**
- Define an elevation scale of 4–5 levels with a role and a visual treatment for each, in light and dark mode.
- List six techniques for making a dense screen clear and explain why size-based hierarchy is weaker there.
- Explain small multiples and when they beat a single combined chart.
- Describe how a 10-column table should adapt to a 360px screen.

**Analysis**
- Take a dense product screen (Zerodha Kite, Bloomberg, a GST portal or SCC Online's search results). Map its layers, grid, density techniques and hierarchy levers *[Figma: White, overlay]*. Identify the three places where density becomes noise, and redesign one module.

**Taste**
- Build dense interfaces as you would set a railway timetable or a legal index: ruthless alignment, quiet structure, and one loud colour saved for what's urgent. Professionals trust screens that respect their time with density done well.

---

## PART 6 — Layout for Print, Editorial & Physical Formats [Core → Deep]

- **Page proportion and margins:** classical book pages use harmonious proportions (2:3, 3:4, 1:√2) and **unequal margins**, traditionally **inner < head < outer < foot** (e.g. 2:3:4:6), so the facing pages read as one unit and the text block sits slightly high. This is derived from the **Van de Graaf canon** and the Villard diagram, reconstructed by Jan Tschichold and Raúl Rosarivo in the mid-20th century as the "secret canon" of medieval and incunabula page design. Modern editorial design often uses more generous outer margins for notes and pull quotes.
- **Spreads, not pages:** readers see two facing pages as one composition, so design the **spread**. **Respect the gutter**: never place heavy type or key imagery against the centre fold, shift visual weight **outward** and let the gutter stay quiet (`TD-05#9 · @edgardesignstudio · DYmqhrCJh9i`). Images crossing the gutter must avoid faces and text in the fold.
- **Pacing a publication:** a magazine or report is a sequence. Vary density (text-heavy spreads, then image breathers), scale (a full-bleed photo after three columns of text) and rhythm (openers, features, departments), like a film edit. Alexey Brodovitch's *Harper's Bazaar* (1934–58) made pacing and white space an editorial art (Part 7). Full craft in 12.
- **Navigational furniture:** folios (page numbers), running heads/feet, section markers and captions all sit in consistent **grid positions** (markers). Consistency here is what makes a publication feel designed rather than assembled.
- **Posters and viewing distance:** a poster is read at three distances: **far** (the gist: one image or word, 5–10 m), **mid** (headline, date, 2–3 m) and **near** (details, fine print). Design a hierarchy for each distance and test at thumbnail size (`TD-07#2 · @harvath.art`). Commercial posters fail through "contractual composition", every actor's face at equal size (same source).
- **Packaging and 3D surfaces:** a pack front works like a poster at shelf distance (brand, variant, key claim), and the side and back panels work like editorial pages (information, legal, nutrition). Layout must account for folds, curvature, dielines, bleed and legally required zones (bridge to 12, 23).
- **Print production for layout:** **bleed** (usually 3mm beyond trim), **safe zone** (keep text 3–5mm inside trim), **trim marks**, **spine width** from page count and paper, **creep** in saddle-stitched booklets, and imposition (how pages are arranged on press sheets). Every one of these changes where things can go (full detail in 12, `T8-design-37-indesign.md`).

**Intuition anchors**
- In print, the reader holds two pages and a spine. Design what they hold, not what your monitor shows.
- A poster has three audiences at three distances. Most posters serve only the one standing closest.

**Mastery checks**
- Explain the classical margin proportions and the reasoning behind unequal margins.
- Explain "respect the gutter" and two rules that follow from it.
- Describe the three-distance hierarchy of a poster and how you would test it.
- Define bleed, safe zone and creep.

**Analysis**
- Take a spread from a magazine you can hold (or a PDF of *The Caravan* or *Frontline*). Measure its margins, columns and gutter, map its grid *[Figma: Yellow]*, and critique its handling of the gutter and pacing across three consecutive spreads.

**Taste**
- Respect the object. A book, a poster and a pack are physical things held, passed and seen from a distance, and layouts that ignore their physical life look fine on screen and fail in the world.

---

## PART 7 — History & Masters of Layout [Core → Deep]

- **Manuscript and early print:** medieval scribes' proportional canons, then Gutenberg's 42-line Bible (two columns, generous margins, space left for hand-painted initials). The page as a harmonious object preceded the page as an information system.
- **The modernist revolution (1910s–30s):** Futurist and Dada typography broke the book's symmetry. **El Lissitzky** (*For the Voice*, 1923; the Constructivist page as an active, diagonal space) and **Alexander Rodchenko** made layout propaganda and art. At the Bauhaus, **Herbert Bayer** and **László Moholy-Nagy** applied asymmetric, functional layout to print. **Jan Tschichold**'s *Die neue Typographie* (1928) systematised asymmetry, and he later recanted its dogma (04 Part 8).
- **Swiss/International Style (1950s–70s):** **Josef Müller-Brockmann** (*Grid Systems*, 1981; the Zurich Tonhalle concert posters), **Karl Gerstner** (*Designing Programmes*, 1964: design as a system of rules, the direct ancestor of design systems and generative design), **Emil Ruder**, **Armin Hofmann**. The grid became a moral stance: objective, rational, democratic information.
- **American editorial and corporate modernism:** **Alexey Brodovitch** (*Harper's Bazaar*, 1934–58: bleeding photographs, white space, pacing, collaborations with Avedon and Cassandre), **Massimo Vignelli** (Unimark International 1965, the NYC Subway map and signage, *The Vignelli Canon*: "semantics, syntactics, pragmatics", a limited palette of grids and typefaces), **Otl Aicher** (Lufthansa, Munich 1972: the grid as corporate identity).
- **Postmodern and digital disruption:** **Wolfgang Weingart** (Basel, 1970s: layered, deconstructed Swiss), **April Greiman** (early Mac layouts, 1980s), **Neville Brody** (*The Face*, 1980s), **David Carson** (*Ray Gun*, 1990s: layout as expression, legibility questioned), **Irma Boom** (books as sculptural sequences), **Experimental Jetset** (strict grids as contemporary style).
- **Web layout lineage:** table layouts (1990s) → CSS float layouts and 960.gs (2000s) → **Khoi Vinh** (*Ordering Disorder: Grid Principles for Web Design*, 2010; design director at NYTimes.com) and **Mark Boulton** (canonical grids for the web) → Marcotte's responsive design (2010) → Jen Simmons and CSS Grid (2017) → intrinsic, container-query layouts (2023–).
- **What the masters understood:** Müller-Brockmann that order serves clarity; Gerstner that a grid is a *program*, not a picture, a set of rules generating many solutions (the idea behind every design system and generative layout); Brodovitch that pacing and surprise keep a reader turning pages; Vignelli that discipline in a few elements frees creativity; Carson that order is a convention, and breaking it can be the message.

**Intuition anchors**
- The grid's history is an argument between order (Swiss) and expression (Constructivist, postmodern). Strong designers can argue both sides and choose per project.

**Mastery checks**
- Name eight figures from Lissitzky to Simmons and each one's contribution to layout.
- Explain Gerstner's "designing programmes" idea and its descendants today.
- Contrast Brodovitch's and Müller-Brockmann's approaches to the page.

**Analysis**
- Put a Lissitzky page, a Müller-Brockmann poster, a Brodovitch *Bazaar* spread and a Carson *Ray Gun* page side by side. For each, trace the structure *[Figma: White]* and write one sentence on what its layout believes about the reader.

**Taste**
- Learn order first and expression second, but learn both. Designers who only know the grid make correct, lifeless work. Designers who only know rule-breaking make noise. The masters knew exactly which rule they were breaking and why.

---

## PART 8 — Applied Practice: Process, Diagnosis & Quality [Core]

- **The layout process:**
  1. **Content inventory + priority ranking.**
  2. **Thumbnails** (10–40, tiny, fast).
  3. **Pick 2–3 structures.**
  4. **Wireframe in greyscale** with real content lengths.
  5. **Establish the grid** from type (Part 1).
  6. **Place type**, then images (crop decisions).
  7. **Refine spacing** with the scale.
  8. **Test** at thumbnail size, at extremes and with real users (a 5-second test).
  9. **Polish:** optical alignment, rag, details.

  Colour usually enters after step 6. Hierarchy must already work in greyscale.
- **The diagnostic table** (from 02 Part 7 and `TD-05#8`), layout-specific additions:
  - "Feels off": count alignment lines, check the grid.
  - "Flat": increase scale contrast between the dominant and the rest.
  - "Don't know where to look": force-rank, one big.
  - "Heavy": remove, then enlarge the white space.
  - "Disjointed": unify the gaps, tighten groups.
  - "Static": introduce a diagonal, an asymmetric split, or a crop.
  - "Cramped at mobile": reduce content, not type size.
  - "Empty at desktop": a max-width container and a larger scale, not more content.
- **Swapping fonts won't fix a structural problem.** The one salvageable idea in an otherwise over-promising reel (`TD-05#4 · @ibithecreator · DaxezfTMiVC`) is exactly this. Structure first, surface second.
- **Spacing as a system:** document the spacing scale and its roles (inline gap, stack gap, section gap, page margin) and bind them to variables. The same logic makes layouts consistent across a team and a codebase (bridge to 14 and L18).
- **Localisation and variable content:** German runs ~30% longer than English, Tamil often more, and CJK shorter. Plan flexible containers, avoid fixed-width text boxes, and never bake text into images.
- **Layout critique language:** use the grid, structure, hierarchy, path and space vocabulary from this file: "the hero splits focus between the headline and the product image at equal scale; make one dominant (2/3) and let the other support (1/3)".

**Intuition anchors**
- Good layout is mostly decided before the first pixel, in the ranking and the thumbnails. The rest is careful execution.

**Mastery checks**
- Recite the nine-step layout process and say where colour and imagery enter.
- Give eight layout symptoms with their first fixes.
- Explain how localisation lengths affect layout decisions.

**Analysis**
- Take a layout you made more than a month ago. Run the full diagnostic table, write the findings, and produce a revised version following the nine-step process strictly *[Figma: Yellow]*. Compare the two at thumbnail size.

**Taste**
- Aim for layouts that look inevitable: every element seems to be where it has to be. You get there by removing options early (ranking, a grid, a spacing scale), not by trying more arrangements late.

---

## PART 9 — How People Scan and Use Layouts: Evidence Across Print, Web & Product [Core → Deep]

Part 3 describes eye movement in general. This Part is about **behaviour by medium**: what readers of a page, visitors to a site and users of a product each do, what the research shows, and what that means for layout decisions.

- **Three reader states, three layouts.** A person holding a magazine has *chosen* to read and will browse. A person landing on a web page is *deciding* whether to stay. A person inside a product is *doing a task* and sees everything else as an obstacle. Most layout mistakes come from designing for the wrong state: a product screen laid out like a magazine (beautiful, slow), or a landing page laid out like a dashboard (complete, unread).
- **Print: entry through images and headlines.** Mario Garcia and Pegie Stark's *Eyes on the News* (1991), from the Poynter Institute's early eye-tracking work, found print readers usually entered a page through its dominant photograph, then headlines and captions, and reached body text last. Later Poynter studies (EyeTrack07 compared print and online) found that once readers chose a story, many read most of it. **Print readers scan to choose, then commit.** Layout implication: the dominant image and headline decide *whether* a story is read, and the grid and measure decide *how comfortably* (Part 1, 04).
- **Web: attention concentrates at the top and left.** NN/g's scrolling research found that people spend most of their viewing time in the first screenful and most of the rest in the second. Their 2018 update found the share above the fold had fallen compared with 2010 (people scroll more on long pages), but more than half of viewing time still went to the first screen. In left-to-right languages, NN/g's eye-tracking also found most viewing time on the **left half** of the page. Layout implications: put the page's meaning (what this is, for whom, why continue) in the first screen, left-align the scannable spine (headings, labels, the start of each row), and never put essential navigation only on the right. Scrolling isn't the problem. A first screen that doesn't earn the scroll is (Part 4).
- **Web pages have a narrative order.** A landing page is read top to bottom as a story, so the order of sections is a layout decision as much as the arrangement within them. `TD-02#66 · @nikgoodner · C93DMOCyPnl` gives a useful skeleton: **header → stakes → value proposition → plan**. The "stakes" block (what happens if the visitor does nothing) is the one most pages omit. Section order is how you apply hierarchy to a scroll.
- **Product: people look where the task is.** Inside an app, users ignore anything that doesn't serve the current task: navigation after the first week, promotional tiles always. They learn positions quickly, so **moving things is expensive** (spatial memory is part of the interface). Consequences: keep persistent controls (navigation, primary actions, filters) in stable positions across screens, never reshuffle a dashboard automatically, and reserve layout change for real mode changes (13).
- **Mobile: one column, one thumb, one screen at a time.** On phones the reading path is almost always a vertical stack, and the viewport shows little context. Put the question the user came with at the top, the action within thumb reach (Part 4), and repeat key context (the item name, the total) near the action so users don't scroll up to check.
- **The Indian context changes the test conditions:**
  - **Screen sizes:** narrow (about 360px-wide) Android viewports have long led screen-size statistics for India, and older 1366×768 laptops are still common in small offices. Check current figures before relying on them, but design and test at those sizes first, not on a large MacBook.
  - **Forwarded images:** posters, price lists and notices often travel as WhatsApp images and are first seen as a chat thumbnail, then compressed. A poster that fails the thumbnail test (Part 6) fails in the main place it will be seen.
  - **Mixed scripts:** a page mixing Devanagari headings with Latin body text needs a consistent baseline and spacing logic across both (04), or the scanning spine breaks.
  - **Connectivity:** on slow connections, text arrives before images and fonts. A layout that depends on its images for hierarchy is unreadable for its first seconds. Reserve image space (set aspect ratios) so nothing jumps when images load.
- **Measure what people do with your layout:**
  - **Scroll maps and click heatmaps** (Microsoft Clarity is free): where attention drops and what gets clicked that isn't clickable (a signifier problem, 02 Part 5).
  - **Find-tasks:** "find the facility with the highest emissions" timed on three people is the best single test of a dense layout (Part 5).
  - **5-second and first-click tests** for entry points (02 Part 9).
  - **Layout shift:** Core Web Vitals' Cumulative Layout Shift (CLS) measures how much content jumps while loading. Users misclick when targets move. Treat it as a layout metric, not just a performance one.
- **Reading heatmaps truthfully:** heatmaps aggregate many people's attention, so they hide sequences and individual strategies. A hot spot can mean interest or confusion. Always pair them with task success, and remember that the absence of clicks below the fold may mean people found what they needed above it.

**Intuition anchors**
- Readers choose, visitors decide, users act. Lay out for the state your person is in.
- People learn where things are faster than they learn what things are. Moving a control costs every user something.
- The first screenful is where most attention goes. Make it answer the question the person arrived with.

**Mastery checks**
- Describe the three reader states and one layout rule each implies.
- Summarise what print and web eye-tracking research found about entry points and attention, with sources.
- Explain why moving controls in a product is expensive and name two layout rules that follow.
- Name four Indian-context conditions that change how you should test a layout.

**Analysis**
- Install Microsoft Clarity on a page you've built (a portfolio or a project page), or use a free heatmap demo site. After a week of visits, compare the scroll map with the layout: mark where attention drops, what gets clicked, and one section you'd reorder. Write the decision and what you expect to change.

**Taste**
- Design the layout for the person's state of mind, not for the portfolio shot. A screen that looks calm in a case study but makes users hunt has failed at the only moment that counts.

---

## PART 10 — Layout Decisions in Practice: Worked Cases from EcoTrace & Meridian UI [Deep]

- **Case 1: the EcoTrace dashboard frame.** *Options:* (A) a bento grid of KPI tiles; (B) a single-column feed of tasks and alerts; (C) a left navigation rail, a top band with progress and the next deadline, and a table of disclosure sections with status. *Criteria:* the user's main job (complete a customer's data request before a deadline) > scanning 20–40 sections for what's missing > fit on a 1366×768 laptop without horizontal scroll > impressiveness in a demo. *Choice:* C. The top band answers "how far along am I and what's next?" (Gutenberg primary area, Part 3), and the table answers "which sections need me?" (sorted by status with Missing and Error first, one accent for Error). *Why not A:* bento tiles are equally loud by design, so a KPI bento answers no question first (Part 5's failure mode, `TD-01#33`). *Why not B:* a feed is good for new items but bad for surveying a fixed set of sections. *Consequences:* the dashboard looks plainer in screenshots; charts move to a separate "Insights" view that users reach once data is complete. *Verify:* a find-task ("which section is blocking your report?") under 5 seconds for 3 of 3 testers.
- **Case 2: the data-entry screen.** *Options:* one long form; a stepper (one section per screen); two panes (a section list on the left, the form on the right). *Criteria:* users jump between sections because documents arrive out of order > not losing place > mobile support. *Choice:* two panes at ≥1024px, collapsing to a stepper with a "jump to section" menu below that. *Layout details:* the section list is sticky, shows each section's status (the same four statuses as the dashboard, so similarity links them), and never reorders itself. Autosave status sits at the top of the form pane, where users look after typing. *Consequence:* two layouts to maintain, which container queries (Part 4) make cheaper. The form pane responds to its own width, not the viewport's.
- **Case 3: the generated PDF report.** EcoTrace's output is a document the customer's sustainability team reads, prints and files. *Decision:* A4 portrait, a two-column grid for narrative pages and a full-width grid for tables, classical margins with a wider outer margin for notes (Part 6), running heads with the company name and period, and folios. *Details:* tables must not split a row across pages (CSS `break-inside: avoid` on rows); table headers repeat on each page; numbers are right-aligned with tabular figures; the inner margin widens for reports that get spiral-bound or hole-punched. *Tooling:* browsers' print engines handle basic paged media, and fuller control (margin boxes, running heads) usually needs a paged-media tool such as Paged.js or WeasyPrint (bridge to `L8-design-12-print-editorial.md`). *Users then* scan headings and totals first, so the summary page carries the numbers the reader will quote.
- **Case 4: Meridian UI's layout primitives.** *Options:* let teams write raw CSS for layout; ship `Stack` (vertical), `Inline` (horizontal, wrapping), `Grid` and `Container` components whose `gap` and `padding` accept only spacing tokens; or ship a utility-class system. *Criteria:* spacing consistency across products > speed for developers > flexibility. *Choice:* primitives with token-only gaps, plus `Grid` built on CSS Grid with `minmax()` and `auto-fit`, and cards that use container queries to switch between horizontal and stacked arrangements. *Consequences:* arbitrary values (a 13px gap) become impossible without an escape hatch, which is the point (02 Part 3). Some designs will need a spacing value the scale lacks. When that happens, question the design before adding the token.
- **Case 5: the EcoTrace marketing page.** *Choice:* the story order from Part 9 (header → stakes → value → plan) on a 12-column grid, with the product screenshot as the dominant image. *Budget decision:* no photoshoot; the layout carries the quality with real product screens, strict alignment and generous section spacing (`TD-02#27 · @shovel.studio · Db8sR3tvZ3k`: cheap imagery can look expensive when the layout does the work). *Consistency decision:* one card style, one section rhythm and one reveal animation repeated throughout, because a small vocabulary applied consistently reads as polish and variety reads as indecision (`TD-02#42 · @josh_yolkk · DUI1tZcCZto`). *Verify:* a 5-second test on the first screen ("what does this product do, and for whom?") before any visual polish.
- **The pattern across the cases:** each decision started from what the user is doing (surveying, entering, reading, deciding), then chose the frame and grid, and only then the visual treatment. Every choice has a test that could reverse it.

**Intuition anchors**
- A dashboard is a question-answering machine. Lay it out in the order of the questions.
- If a layout changes by viewport, write the rule. If it changes by container, let the component own the rule.
- A generated PDF is still a printed document. It needs margins, running heads and rows that don't split.

**Mastery checks**
- Defend the rail + band + table dashboard against a bento proposal, using criteria and user behaviour.
- Explain when a two-pane data-entry layout beats a stepper, and how it should collapse.
- List five layout requirements of a printable compliance report and the CSS that supports two of them.
- Explain why Meridian's layout primitives accept only spacing tokens, and what to do when a design needs a missing value.

**Analysis**
- Pick one EcoTrace screen (or a screen from any product you're building). Write its layout decision in the options → criteria → choice → consequences form, build the chosen layout at 360, 1024 and 1440px *[Figma: Orange, auto layout with min/max widths]*, and run one find-task with three people. Log the result against your prediction.

**Taste**
- Choose the plain layout that answers the user's question over the striking one that answers yours. In product work, looking inevitable beats looking designed.

---

## PART 11 — One Message, Many Frames: Layout Across Print, Web, Product & Social [Core → Deep]

- **The same principles, different parameters.** Hierarchy, grids, proximity and paths apply everywhere (02 Part 7), but the reader's state, the frame and who controls the layout change by medium:

| Medium | Frame | Reader's state | Who controls the final layout | Typical failure |
|---|---|---|---|---|
| Poster | Fixed, seen at 3 distances | Passing, seconds | You | Details at the size of the gist |
| Book or report | Fixed spread, bound | Committed, long | You (and the binding) | Content lost in the gutter |
| Magazine or newspaper | Fixed spread, sequenced | Browsing, then reading | You | No pacing, every spread equal |
| Marketing web page | Fluid width, endless height | Deciding whether to stay | You and the browser | A first screen that doesn't earn the scroll |
| Product screen | Fluid, many states | Doing a task | You, the data and the user's settings | Designed for ideal content only |
| Mobile app | Narrow, one thumb | Doing a task in fragments | You, the OS and the data | Desktop squeezed into a column |
| Social post | Fixed ratio, then cropped as a thumbnail | Scrolling past | The platform | Illegible at thumbnail size |

- **Worked translation: one event, five frames.** A raga concert on campus needs a poster, an Instagram post, a story, a web event page and an app card.
  - **The poster** leads with one image or word for the far view, the date and venue for the mid view, and details for the near view (Part 6).
  - **The 4:5 post** keeps the poster's gist but enlarges the date, because it's seen at thumbnail size first. Since 2025 Instagram's profile grid shows portrait thumbnails (roughly 3:4), so check the crop.
  - **The 9:16 story** sequences the information over two or three frames and keeps text out of the top and bottom zones the interface covers.
  - **The web page** puts the answer to "when, where, how do I attend?" in the first screen, then the programme and the performers.
  - **The app card** is one line of title, one of date and one action, because it sits in a list among other events.

  Same content ranking, five structures. **Re-rank per medium; don't resize.** A layout resized from another format looks it (exercise: Part 2's frame study).
- **What transfers and what doesn't:**
  - **Transfers:** the content ranking, the type scale's ratios, the colour roles, the spacing *logic* (internal < external), the brand's structural gesture.
  - **Doesn't transfer:** absolute sizes, line lengths, image crops, the grid's column count, reading distance, the point where text must break.
- **Control and uncertainty:** in print you control every position. On the web you control rules, and the browser, the user's font size and the content decide the result (Part 4). Designers moving from print to screen must give up fixed positions. Designers moving from screen to print must learn the physical constraints: bleed, gutters and the spread (Part 6).
- **Platform capabilities change what's possible.** For thirty years, print-style multi-column text flow was awkward on the web, and new CSS features keep retiring layout limits designers had accepted as permanent (`TD-02#36 · @thevarunmayya · DWjhZLnAWce`). Re-check your "impossible on the web" list every year: container queries, subgrid and `:has()` each removed whole categories of workaround.
- **Deliberate rule-breaking across media:** a measured break works in any medium only when the grid is visible or strongly implied (`TD-07#15 · @pagustian_`, which shows the grid overlay under each broken layout). A crop that cuts decisively through a head reads as intent. One that clips the hairline reads as an error (`TD-07#41 · @ginyboi`). Part 2's "never crop at joints" is the rule for *accidental-looking* crops, and a decisive crop is the exception that proves it.

**Intuition anchors**
- A format is not a size. It's a reader's situation. Re-rank for each one.
- Print designers control positions, web designers control rules, product designers control rules for states they'll never see.

**Mastery checks**
- For five media, name the frame, the reader's state, who controls the final layout and the typical failure.
- Translate one content set into poster, 4:5 post and web page rankings, and explain every change.
- List what transfers between media and what doesn't.
- Explain when a crop through a head works and when it reads as a mistake.

**Analysis**
- Take one real campaign that exists in several formats (a film release, a festival, a government scheme). Collect the poster, the social post and the web page. For each, map the ranking and the structure *[Figma: White, overlay]*, and mark where the team resized instead of re-ranking.

**Taste**
- Be fluent in more than one medium. Designers who know print bring rhythm and restraint to screens, and designers who know screens bring systems thinking to print. The combination is rare and valuable.

---

## PART 12 — Connections [Core]

- **→ 02 Principles:** proximity, alignment and balance at page scale. **→ 04 Typography:** measure-driven columns, baseline grids, type-first grids. **→ 06 Neuroscience:** eye movement, faces, attention.
- **→ 09 Graphic Design and 12 Print & Editorial:** posters, spreads, publications. **→ 13 UI/UX and 16 Web:** screen patterns, responsive systems. **→ 14 Design Systems:** spacing tokens, grids as specs. **→ 18 Motion:** layout in time (scroll-driven composition, transitions preserving spatial models). **→ 22 Data Viz:** dashboard grids, small multiples.
- **Cross-pollination:** **photography** (framing, cropping, the rule of thirds came from painting through photography), **film** (shot composition, pacing, the edit as layout in time; watch films muted to see composition, `TD-13#11 · @anshmehra.in · DcDdlvuiXuk`, habit 3), **architecture** (circulation paths, rhythm of bays, proportion systems, Le Corbusier's Modulor, `TD-05#13 · @mr.desizner · C_bLic4T9zB`), **chess** (the board as a grid of forces, piece placement as composition: centralised, fianchettoed, outposted), **law** (the structure of a judgment or statute: headnote, facts, issues, reasoning, holding, which is hierarchy and grid in prose).

**Intuition anchors**
- Once you see grids and paths, you see them everywhere: in temple architecture, cricket field placements, a well-drafted statute. Use every domain you know as a layout teacher.

**Mastery checks**
- For five later modules, name the layout concept from this file each depends on.

**Analysis**
- Photograph the plan or elevation of a temple (the Srirangam gopurams are nearby) and analyse its compositional structure (axes, symmetry, rhythm, hierarchy of scale) as if it were a poster. 300 words.

**Taste**
- Borrow structure from the best-organised things in the world, not just the best-designed screens. Temples, railway timetables and courtrooms have solved layout problems for centuries.

---

## PART 13 — Taste Development in Composition & Layout [Lifelong]

- **What good layout looks like:** a clear entry, a path and a resting point; one dominant element; a grid derived from type; few alignment lines; consistent, systematic gaps; negative space with shape; crops that strengthen subjects; images and text in a deliberate relationship; structure that survives thumbnail, extreme content and every breakpoint; and one controlled break that gives the work life.
- **Voices and sources worth internalising:**
  - **Josef Müller-Brockmann**, *Grid Systems in Graphic Design*: the grid bible.
  - **Timothy Samara**, *Making and Breaking the Grid* (2nd ed. 2017): both halves of the argument, with examples.
  - **Karl Gerstner**, *Designing Programmes*: the grid as a system.
  - **Khoi Vinh**, *Ordering Disorder*: grids for screens.
  - **Kimberly Elam**, *Geometry of Design* and *Grid Systems*: proportion and structure analysed.
  - **Massimo Vignelli**, *The Vignelli Canon*: discipline.
  - **Alexey Brodovitch**'s *Harper's Bazaar*: pacing.
  - **Jen Simmons**' *Layout Land* videos: intrinsic web layout.
- **Deliberate taste exercises:**
  1. **Weekly overlay:** trace the grid of one master layout.
  2. **Thumbnail sprint:** 30 thumbnails for one content set in 30 minutes.
  3. **Film stills, muted:** extract compositional structure from five frames.
  4. **Extreme-content test** on every layout.
  5. **One grid, ten layouts:** prove a grid's range.
  6. **Break once:** a monthly piece with one deliberate, measured grid break.
- **Anti-taste:** grids chosen before content, centred everything, 50/50 splits by default, two equal focal points, inconsistent gaps, "nearly aligned" elements, key content in the gutter, faces looking out of the layout, crops at joints, bento-everything, a squeezed desktop as the mobile layout, visual order ≠ DOM order, layouts that break at 320px or with long names, fixing structure by swapping fonts, white space as a leftover, dashboards that reshuffle themselves, formats resized instead of re-ranked, content that jumps as images load, and layouts tested only on the designer's large screen.

**Intuition anchors**
- A good layout disappears into the task: people find what they came for and never notice the grid that put it there.
- Your taste in layout is only as good as the range of media you've laid out for.

**Mastery checks**
- List the ten marks of good layout from memory and score your latest build against them.
- Name the four anti-taste habits you fall into most, and the Part that corrects each.

**Analysis**
- Pick your best layout from this module and your favourite master layout from Part 7. Overlay both *[Figma: White]*, then write one page on the single structural decision the master made that you didn't, and redo yours with it.

**Taste**
- Build a compositional voice slowly: a few structures you understand deeply, one you're learning, and the discipline to choose the plain one when the user's task demands it.

---

## Resource Library

**Primary:** Müller-Brockmann, *Grid Systems in Graphic Design* (1981) · Marcotte, *Responsive Web Design* (A List Apart, 2010) · MDN: *CSS Grid Layout*, *Subgrid*, *Container queries* · WCAG 2.2 SC 1.3.2, 1.4.10, 1.4.12 · Apple HIG *Layout* and Material 3 *Layout* (window size classes, canonical layouts) · Hoober, *How Do Users Really Hold Mobile Devices?* (UXmatters, 2013) · NN/g articles on F-pattern and layer-cake scanning, *Scrolling and Attention* (2010; updated 2018) and horizontal attention · Garcia & Stark, *Eyes on the News* (Poynter Institute, 1991) and Poynter's EyeTrack07 · web.dev, *Cumulative Layout Shift* · Paged.js and WeasyPrint documentation (paged media for generated reports).

**Books:**
- **Timothy Samara**, *Making and Breaking the Grid*: the working textbook for this module.
- **Josef Müller-Brockmann**, *Grid Systems in Graphic Design*: the canonical source.
- **Kimberly Elam**, *Grid Systems: Principles of Organizing Type* and *Geometry of Design*: short, analytical.
- **Khoi Vinh**, *Ordering Disorder*: grids on screens.
- **Karl Gerstner**, *Designing Programmes*: systems thinking in layout.
- **Jan Tschichold**, *The Form of the Book*: page proportion and margins.
- **Ethan Marcotte**, *Responsive Web Design* (A Book Apart): the web's layout manifesto.
- **Andy Clarke**, *Art Direction for the Web*: editorial composition on screens.
- **Mario Garcia & Pegie Stark**, *Eyes on the News* (1991): how print readers enter a page (Part 9).

**Courses & labs:** CalArts *Fundamentals of Graphic Design* (Coursera Plus), composition week · Jen Simmons' *Layout Land* (YouTube) · Josh Comeau's *CSS for JavaScript Developers* layout modules (paid; ties to your front-end track) · Figma Learn: auto layout and layout grids tutorials (see `T8-design-34-figma.md` course map).

**Reading (work):** Müller-Brockmann's Tonhalle posters · Vignelli's NYC Subway map and *Heritage of Graphic Design* layouts · Brodovitch's *Harper's Bazaar* · *Monocle*, *Kinfolk*, *The Caravan* spreads · Apple product pages (cinematic composition on the web) · Stripe homepage (grid-aligned illustration) · Linear (bento and dense app layout) · award-site heroes and footers in `TD-02` (@zachex typologies, @malik.url teardowns).

**From your catalogue (layout spine):** all of `TD-05` (15 entries): `#3` grid types, `#8` diagnostic, `#1` experimental grids, `#11` and `#14` compositional overlays, `#15` portrait placement, `#9` gutter, `#12` white space, `#6` alignment, `#7` spacing, `#2` and `#5` hierarchy · `TD-01#33` (bento) · `TD-02` hero/footer typologies · `TD-07#2` (poster hierarchy at thumbnail) · Parts 9–11: `TD-02#66` (story order), `TD-02#27` (cheap imagery, strong layout), `TD-02#42` (repetition as polish), `TD-02#36` (platform limits expire), `TD-07#15` (measured breaks), `TD-07#41` (decisive crops).

**Practice:** `T8-design-05-composition-layout.md`: thumbnail sprints, grid-construction drills, responsive trials, spread rebuilds, scroll-map and find-task trials, cross-media translation exercises.

## Suggested Learning Order

1. Part 0 (frame and content ranking) · ~4 h
2. Part 2 (composition techniques) with poster overlays · ~8 h
3. Part 1 (grids), built from type (after 04 Parts 2–4) · ~10 h
4. Part 3 (eye movement) + 5-second tests · ~5 h
5. Part 4 (responsive and screen patterns), in parallel with Figma auto layout belts · ~10 h
6. Part 5 (depth and density), with a dense-screen redesign · ~6 h
7. Part 6 (print and physical formats) · ~6 h
8. Part 7 (history and masters) with Samara and a Müller-Brockmann rebuild · ~6 h
9. Part 8 (process and diagnosis) · ~3 h
10. Part 9 (scanning behaviour by medium), with a Clarity scroll map on a page you've built · ~5 h
11. Part 10 (worked EcoTrace and Meridian decisions), building one case at three widths · ~6 h
12. Part 11 (one message, many frames), with the five-frame translation · ~4 h
13. Parts 12–13: connections and taste; then re-audit your Phase 1 work · ~2 h

Total first pass ≈ 75 hours alongside the T8 file. Phase 1 complete → Phase 2 (Perception & Meaning) next.
