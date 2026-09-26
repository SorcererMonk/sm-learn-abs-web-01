# Data Visualisation & Information Design → Training Programme
## T8: Design: 22 · Encoding & Chart-Choice Drills · Palette & Table Reps · Dashboard & Map Builds · Honesty & Accessibility Trials · Story & Tool Builds · Taste Forge

> This is the **training** counterpart to `L8-design-22-data-visualisation.md`. The L file is the class: perception of quantity, chart choice by task, colour and words for data, dashboards, maps and India's boundaries, storytelling, accessible and honest charts, a React tool stack, and the EcoTrace BRSR visuals worked end to end. This file is the room afterwards. Nothing here is new material — repetition, pressure and production, aimed at:
>
> - **Muscle memory:** classifying a field's data type and picking a legal channel without deliberating, building a clean chart and a readable table on reflex, and reaching for a data table fallback and a source note by habit.
> - **Intuition:** feeling when a stacked bar is the wrong call, spotting a truncated axis or a rainbow palette in under a second, and predicting what a reader will misread before you test it.
> - **Taste:** your own data-design philosophy, proven on EcoTrace and Meridian UI and tested with real people.
>
> Reference: `L# N` means Part N of the L file. **Tools:** **Recharts 3** and **shadcn/ui charts**, **visx 4**, **Apache ECharts 6.1**, **D3 7.9**, Observable Plot for exploration; **Datawrapper** and **Flourish** free plans for one-off reports; **Figma** variables for data tokens (no native chart tool, so kits and plugins); **NVDA** (free) for screen-reader testing; Chrome DevTools' vision-deficiency emulation; a phone at 360px width.

---

## 1. How to Train

| Shape | Length | Use |
|---|---|---|
| **Drill** | 10–20 min | Section 3. Encoding, chart-choice, palette, table and honesty reps. |
| **Exercise** | 45–90 min | Section 4. One graded deliverable (a chart, a table, a dashboard, a map, a test). |
| **Build** | 2–5 h | Section 5. A component or product surface moved one milestone. |
| **Trial** | 30–45 min | Section 6. A planted failure, a timer, a diagnosis. |
| **Study** | 30–60 min | Section 7. Rebuild one admired chart from real data. |
| **Forge** | 30 min, weekly | Section 9. Philosophy, tokens, swipe files. |

**Rules of the room:**
1. **Write the reader and the sentence before opening any tool** (L# 0). No sentence, no chart.
2. **Use real data, including the ugly rows,** for every exercise past White belt — zeros, missing months, a supplier that is 80% of the total.
3. **Every chart ships with a source note and a fallback table.** No exceptions past Yellow belt.
4. **Stress every chart** before calling it done: greyscale, colour-blind simulation, a 360px phone, NVDA, Hindi labels (L# 3, 8).
5. **Log every failure** (Section 12) by mechanism: wrong channel, truncated axis, dual-axis, rainbow palette, missing-as-zero, area misjudged, unlabelled log scale, legal boundary, no fallback table.
6. **No chart in an EcoTrace exercise skips the India-boundary check** if it is a map (L# 6).

**The weekly minimum:** 3 drills · 1 exercise · 1 build session · 1 trial · 1 study rebuild · 1 forge entry.

---

## 2. The Belt Ladder

| Belt | Gate (cold, timed) | Covers |
|---|---|---|
| **White** | In 20 min: classify 15 described fields as nominal, ordinal or quantitative with a legal channel for each; recite the Cleveland–McGill ranking; explain magnitude vs identity channels. | L# 0–1 |
| **Yellow** | In 30 min: one clean bar chart, one readable table (right-aligned numbers, tabular figures, units in the header) and one legal India outline map, from real data, each with a title that states the finding. | L# 1, 4, 6 |
| **Orange** | In 40 min: given five described reader tasks, choose and justify a chart form for each, then build a small-multiples set replacing a tangled multi-line chart. | L# 2 |
| **Green** | In 60 min: an OKLCH sequential ramp and a categorical palette, both passing greyscale and deuteranopia simulation, applied to one chart in light and dark mode. | L# 3 |
| **Blue** | In 90 min: a decision-first dashboard for a named EcoTrace reader — three KPI tiles with comparisons, one bullet graph, and empty/partial/loading/error/stale states designed. | L# 5 |
| **Brown** | In 90 min: an accessible, honest chart pair — one chart with SVG accessible name, `<TableFallback>`, NVDA-tested, and one Lie Factor audit of a real published chart with a redrawn honest version. | L# 8–9 |
| **Black** | Over 2 weeks: the EcoTrace BRSR chart set built end to end — dashboard tile, PDF report page and a scrollytelling explainer from one data model, chart library chosen and documented, boundary and honesty QA passed, tested with two real people at three comprehension levels. | L# 0–13 |

---

## 3. Drill Bank

**D1 — Encoding reps** [L# 0]
| Drill | Target |
|---|---|
| Classify 10 fields as nominal/ordinal/quantitative, name a legal channel | 4 min |
| Spot the category error in 8 mis-encoded charts (rainbow for quantity, lightness steps for categories) | 5 min |
| State magnitude vs identity channel for 10 given channels | 3 min |

**D2 — Chart-choice reps** [L# 2]
| Drill | Target |
|---|---|
| Match 12 reader tasks (compare, rank, change, share, deviate, distribute, relate, flow, spatial) to a form | 5 min |
| Spot the dual-axis trick in 5 charts and propose the fix | 4 min |
| Redraw one tangled multi-line chart as small multiples, sketch only | 6 min |

**D3 — Palette reps** [L# 3]
| Drill | Target |
|---|---|
| Build a 7-step OKLCH sequential ramp, check lightness steps are even | 6 min |
| Run 5 saved palettes through greyscale and CVD simulation, flag failures | 5 min |
| Assign 8 categorical colours by distinctness, not preference | 4 min |

**D4 — Words, numbers, table reps** [L# 4]
| Drill | Target |
|---|---|
| Rewrite 5 descriptive titles as findings with subtitles | 4 min |
| Format 6 figures in `en-IN` and `hi-IN`, standard and compact | 4 min |
| Fix a badly formatted table against the 8 rules | 6 min |

**D5 — Dashboard & KPI reps** [L# 5]
| Drill | Target |
|---|---|
| Write the five-part anatomy of a KPI tile for 3 metrics | 4 min |
| Draw a bullet graph from a target and a range in 3 minutes | 3 min |
| Design the 5 dashboard states for one metric (empty/partial/loading/error/stale) | 6 min |

**D6 — Map & legal reps** [L# 6]
| Drill | Target |
|---|---|
| Spot area bias, counts-vs-rates and MAUP in 4 described maps | 4 min |
| Name the compliant India boundary sources and one risk in a global basemap | 3 min |
| Choose a classification method (quantile/equal-interval/natural-breaks) for 3 datasets | 4 min |

**D7 — Accessibility reps** [L# 8]
| Drill | Target |
|---|---|
| Write `<title>`/`<desc>` markup for 3 SVG chart types | 5 min |
| Navigate a live chart with NVDA and the keyboard only, log 3 gaps | 8 min |
| Write a one-sentence generated summary for 3 charts | 4 min |

**D8 — Honesty reps** [L# 9]
| Drill | Target |
|---|---|
| Compute the rough Lie Factor of 4 truncated-axis charts | 5 min |
| Spot the missing "log scale" or "projected" label in 4 charts | 3 min |
| Rewrite one compressed-bad-news chart as an honest, annotated version | 6 min |

**D9 — Recall (Anki)**
Data types and channels · Cleveland–McGill ranking · Anscombe/Datasaurus · OKLCH ramp construction · WCAG 1.4.1/1.4.11/1.1.1 for charts · Few's dashboard definition · Shneiderman's mantra · Section 2(2), Criminal Law Amendment Act 1961/1990 · CEA v21.0 grid factors (0.710/0.727) · BRSR Core glide path (FY 2026-27) · Tufte's Lie Factor · Huff (1954), Cairo (2019) · Recharts/visx/ECharts/D3 current versions · Datawrapper/Flourish free-plan terms. **Target: 95%, 10 min daily.**

---

## 4. Exercise Bank

**Level 1 — Seeing data** (L# 0)
1. **Field classification.** 15 EcoTrace fields classified with a legal channel each. *Accept:* zero category errors.
2. **Anscombe redraw.** Plot the quartet (or the Datasaurus Dozen) and write two sentences on what summary statistics hid.
3. **Channel audit.** One app you use, every chart labelled explore or explain, with the sentence it makes true. *Accept:* every chart gets a sentence, or is flagged as failing.

**Level 2 — Perception and chart choice** (L# 1–2)
4. **Five-form test** (L# 1 analysis). The same five-supplier dataset as pie, donut, bar, dot plot and treemap. 3 people rank suppliers from each, timed. *Accept:* results compared against the Cleveland–McGill ranking.
5. **Task-to-form map.** One real dataset (NPCI UPI volumes or similar), five charts answering five different questions, titled as the question. *Accept:* no chart answers a question it wasn't built for.
6. **Dual-axis rebuild.** Find or construct one dual-axis chart, rebuild it as two aligned charts or an indexed line. *Accept:* the misleading crossing point is gone.

**Level 3 — Colour, words, tables** (L# 3–4)
7. **OKLCH ramp build** (L# 3 analysis). 7-step sequential ramp, tested greyscale and CVD. *Accept:* order preserved in both.
8. **Data-colour tokens.** `--chart-cat-1…8`, `--chart-seq-1…7`, `--chart-div-neg…pos` for light and dark mode. *Accept:* no borrowed status colours.
9. **BRSR table rebuild** (L# 4 analysis). One listed company's Principle 6 table redone with the 8 table rules. 2 people find 3 values in each, timed. *Accept:* the rebuild is faster or you explain why not.
10. **Bilingual chart pass.** One chart's labels tested in Hindi and one long-string language. *Accept:* no rotated Devanagari, no clipped labels.

**Level 4 — Dashboards and maps** (L# 5–6)
11. **KPI tile set.** Three EcoTrace KPI tiles, each with value, comparison, trend, status where real, and a link. *Accept:* no tile without a comparison.
12. **Decision-first dashboard** (L# 5 analysis). One EcoTrace home dashboard, options A/B/C sketched, one chosen and built with the five states designed. *Accept:* a named decision, answerable in under ten seconds.
13. **Compliant supplier map** (L# 6 analysis). A sorted bar plus an SoI-compliant locator map, boundary checked against the Survey of India political map. *Accept:* boundary check documented, no third-party basemap used unchecked.
14. **Choropleth by rate.** The same district dataset as choropleth-by-count and choropleth-by-rate. 2 people asked which district "is worst" from each. *Accept:* the disagreement is logged.

**Level 5 — Story, accessibility, honesty** (L# 7–9)
15. **Scrollytelling build** (L# 7 analysis). A four-step explainer with Scrollama or Flourish's Scrolly template, one claim per step. *Accept:* each step's text and chart change match.
16. **Accessible chart pass** (L# 8 analysis). One chart with SVG accessible name, `<TableFallback>`, tested with NVDA and keyboard only. *Accept:* every value reachable without a mouse or sight.
17. **Lie Factor audit** (L# 9 analysis). Three published charts (Indian financial or corporate media), Lie Factor computed, one redrawn with a true baseline. *Accept:* the redraw's finding differs from the original's implied one, and you can say why.
18. **Uncertainty pass.** One forecast or projection chart, redrawn with a confidence band and a dashed, labelled projection line.

**Level 6 — Tools, product, testing, masters** (L# 10–13)
19. **Library decision memo** (L# 10 analysis). Options/criteria/choice/consequence for one real Meridian UI chart, built in the chosen library. *Accept:* the memo and the build agree.
20. **EcoTrace BRSR chart set** (L# 11 analysis). The full Step 1–6 workflow run on one Principle 6 dataset, all three output surfaces built from one data model. *Accept:* no surface rebuilds the chart from scratch.
21. **Five-second and comprehension test** (L# 12 analysis). Run all three testing methods on one chart, 3 people. *Accept:* elementary, intermediate and overall questions each answered by at least 2 of 3.
22. **Master rebuild** (L# 13 analysis). Rebuild one chart from a named master in code from real data. *Accept:* 3 sentences on what the rebuild taught that reading didn't.

---

## 5. Build Ladder

| # | Project | Hard constraint | Stretch |
|---|---|---|---|
| 1 | **Chart-choice audit** | Task-to-form map for 8 real EcoTrace fields, each titled as the question it answers | Tested with 2 readers, error rate logged |
| 2 | **Data-colour token set** | Full categorical/sequential/diverging tokens in OKLCH, light and dark, CVD-safe | Adopted into Meridian UI's Storybook |
| 3 | **Readable table component** | One BRSR Principle 6 table rebuilt to the 8 rules, real `<table>` markup | Mobile card view tested against horizontal scroll |
| 4 | **EcoTrace decision-first dashboard** | 3 KPI tiles, 1 bullet graph, 5 designed states, from real bills | A one-sentence generated summary above the tiles |
| 5 | **Compliant supplier map** | SoI-boundary-checked map plus sorted bar, no pin map | GeoJOSN joined on LGD codes |
| 6 | **Scrollytelling explainer** | 4-step "why BRSR applies to you" piece, Scrollama or Flourish | Works with JS-light fallback (a plain scroll page) |
| 7 | **Accessible chart component** | SVG accessible name, `<TableFallback>` required prop, NVDA-tested | Live-region announcement on keyboard focus move |
| 8 | **Honesty audit report** | 3 published charts, Lie Factor computed, 1 redrawn | A written product principle against compressed bad news |
| 9 | **Meridian UI chart library** | Recharts-based line/bar/area set plus one visx bespoke mark, documented tokens | Bundle-size comparison against a single-library approach |
| 10 | **Flagship: EcoTrace BRSR chart set** | The Black-belt gate: 3 surfaces, 1 data model, boundary and honesty QA passed | A short case-study write-up with before/after |

---

## 6. Critique & Failure Drills

- **Truncated-axis trial.** Five bar charts with planted non-zero baselines. Compute the Lie Factor of each and redraw with a true baseline.
- **Dual-axis trial.** Three dual-axis charts. Rebuild each as two aligned charts or an indexed line and note what relationship disappears.
- **Rainbow-palette trial.** A heatmap in a rainbow colour map. Rebuild in a perceptually even sequential ramp and compare false-boundary artefacts.
- **Stacked-bar trial.** A stacked bar where the middle segment matters. Un-stack it and measure which comparison got easier.
- **Choropleth-by-count trial.** A map shaded by raw count. Rebuild by rate, name the region whose story changes.
- **Missing-as-zero trial.** A time series with an undocumented gap drawn as zero. Fix it as a broken line with a note.
- **Screen-reader trial.** A chart with no accessible name and no fallback table. Fix it and verify with NVDA in 20 minutes.
- **Boundary-law trial.** Three maps of India from global tools or brands. Check each against the Survey of India political map and write a short compliance note, as you would for a client.
- **Live review.** Paste the chart's code sandbox link, a screenshot, or upload the files to a Claude chat: *"Live review for T8-22 [Belt]. Check chart choice against the reader's task, channel legality, palette (greyscale and CVD), table/number formatting, accessible name and fallback table, honesty (axis, scale, uncertainty), and any India map's legal boundary. List findings by severity with fixes."* Log findings by mechanism.

**Postmortem template:** chart · failure · mechanism (wrong channel, wrong form, palette, table, accessibility, honesty, legal boundary, missing test) · evidence (screenshot, Lie Factor, test result) · why missed · fix · the check that prevents it next time.

---

## 7. Study & Reproduce

**Weekly cycle:** pick one admired chart → find or approximate its real dataset → **predict** the chart form, palette and title before looking closely → rebuild in code → **diff** against the original (what's different, what's better) → write one sentence on what made it work.

**Target list for the first year:** an Alan Smith/FT chart from the Visual Vocabulary series · a Reuters Graphics explainer · an Our World in Data chart, rebuilt from its linked dataset · a state-election or budget graphic from The Hindu's Data Team · a Pudding scrollytelling piece, stepped through code-side · a Datawrapper blog "chart of the week" · a Flourish gallery example, including one built with its scrollytelling template · Minard's 1869 map of Napoleon's Russian campaign, redrawn in code with all six variables kept · Nightingale's 1858 rose diagram, rebuilt as a modern polar chart · a Gapminder bubble-chart animation, rebuilt with Observable Plot · RBI's DBIE time series · CPCB's AQI dashboard, boundary-checked if it maps India · NPCI's monthly UPI statistics · one Giorgia Lupi hand-drawn data piece, translated into a coded chart without losing its warmth · one BRSR Principle 6 table from a real listed company's annual report, rebuilt to the Part 4 rules.

**Choosing what to rebuild:** favour a source with public, downloadable data over one you'd have to guess at from a screenshot — the point is comparing your design decisions against a real designer's, not reverse-engineering pixels.

---

## 8. Intuition Probes

- **Chart-choice probes:** given a reader task, predict the right form before checking the L# 2 map. Target ≥ 80% match.
- **Lie Factor probes:** guess whether a chart's Lie Factor is near 1, above 2, or above 5, before computing it.
- **CVD probes:** predict which of two palettes fails deuteranopia simulation before running it.
- **Comprehension probes:** predict what a five-second viewer will say a chart shows, before testing.
- **Memorability probes:** predict which of two chart versions (plain vs annotated) three people will describe more accurately a day later.
- **Boundary probes:** look at a map of India for two seconds and predict compliant or non-compliant, before checking against the Survey of India outline.

Track hit rates in `LOG.md`. Target ≥ 70% over the last 30 probes.

---

## 9. Taste Forge

- **Data-design philosophy.** One page: explore vs explain defaults, how much decoration you allow, your stance on pie charts, your rule for compressed bad news (never). Revised after each real project.
- **Data tokens.** Your categorical, sequential and diverging palettes as DTCG JSON and CSS variables, light and dark, used in every build.
- **Two swipe files** (L# 13): charts that made you stop, and charts that fooled you until you looked twice. Add one a week; review both monthly.
- **Pattern journal.** One chart decision per week (e.g. "bullet graph vs gauge for a target-vs-actual view"), the alternatives, the choice, the source Part.
- **Decision log.** For every chart you ship: the reader, the sentence it makes true, the alternatives rejected, what a test showed, whether you'd keep it.
- **Context kit.** A saved test set run on every chart: greyscale, deuteranopia simulation, 360px phone, NVDA, a Hindi label, a missing-data month.
- **Constraint runs.** A KPI row with only two colours. A dashboard with zero legends. A chart honest enough to survive a hostile audit. A map that passes the boundary check on the first try.
- **Teaching turns.** Once a month, explain one Part of the L file to someone else (a classmate, a colleague, a rubber duck) in ten minutes with no notes. If you can't teach the Lie Factor or the Cleveland–McGill ranking cleanly, it isn't in muscle memory yet, only in notes.

---

## 10. Assessment & Graduation

You are **trained in data visualisation and information design** when all are true, with artefacts:

1. **Fluency:** D1–D8 within target; D9 recall at 95%; chart-choice probe ≥ 80%.
2. **Encoding and choice:** 15+ fields classified correctly; a task-to-form map built and defended for a real dataset.
3. **Colour and words:** a full CVD-safe data token set in OKLCH; one BRSR-style table rebuilt and tested faster than the original.
4. **Dashboards:** one decision-first EcoTrace dashboard with all five states, tested against a named decision.
5. **Maps:** one compliant India map shipped, with a documented boundary check.
6. **Story:** one scrollytelling piece built and tested step by step.
7. **Accessibility:** one chart component NVDA-tested with a required fallback table; zero charts shipped without an accessible name.
8. **Honesty:** three Lie Factor audits completed; one written product principle against compressed bad news.
9. **Tools and product:** a documented chart-library decision; the EcoTrace BRSR chart set built end to end across three surfaces from one data model.
10. **Users and taste:** at least three charts tested with real people at all three comprehension levels, with one changed because of what they did; philosophy revised ≥ 3 times.

---

## 11. Spaced Schedule

| Day | Session | Content |
|---|---|---|
| Mon | Drill (15 min) + Anki | D1/D2; D9 |
| Tue | Exercise (75 min) | Current exercise |
| Wed | Build (2 h) | Current build |
| Thu | Drill (20 min) + Probe | D3–D6; one probe |
| Fri | Trial (40 min) | Truncated-axis, dual-axis, rainbow or boundary trial |
| Sat | Study (60 min) | One admired chart rebuilt from real data |
| Sun | Forge (30 min) + Log (15 min) | Philosophy, tokens, swipe files, roll-up |

**Review cadence:** weekly, recompute one old chart's Lie Factor · fortnightly, an NVDA pass on your last three builds · monthly, a fresh belt attempt and one rebuild published as a short write-up · quarterly, a full honesty-and-accessibility QA of your flagship EcoTrace chart set.

**Spaced repetition (Anki), facts only:** Stevens' scales of measurement (1946) · Cleveland–McGill ranking (1984) and its replications (Heer & Bostock 2010, Mackinlay 1986) · Anscombe's quartet (1973), Datasaurus Dozen (2017) · OKLCH ramp construction · ColorBrewer, viridis · WCAG 1.4.1, 1.4.11, 1.1.1 · Few's dashboard definition (2004), Shneiderman's mantra (1996) · Section 2(1) and 2(2), Criminal Law Amendment Act 1961/1990 · *Hindustan Times v. State* (2002) · CEA v21.0 grid factors, 0.710 (2024-25) / 0.727 · BRSR Core assurance glide path (FY 2026-27) · Tufte's Lie Factor (1983) · Huff (1954), Cairo (2019) failure modes · Borkin (2013), Bateman "Useful Junk?" (2010) · Segel & Heer narrative genres (2010) · Recharts 3.10, visx 4.0, ECharts 6.1, D3 7.9 (2026) · Datawrapper Pro $21/user/month, API billed from 1 Oct 2026 · Flourish free for public projects.

---

## 12. Logbook

```
## 2026-10-12 · Exercise 4 · Five-form test · five-supplier emissions
Prediction: pie hardest to rank correctly, bar/dot fastest.
Results (3 people, timed): bar 8s avg, dot 9s, donut 14s, pie 19s, treemap 22s.
Ranking errors: pie 2/3 wrong order, treemap 1/3, bar/dot 0/3.
Rule confirmed: position beats area beats angle, exactly as L# 1 states.

## 2026-11-03 · Exercise 17 · Lie Factor audit · a business-page emissions chart
Chart: bar truncated at 85% of true baseline, showing a "sharp rise".
Lie Factor computed: ~6.3 (visual rise 6x the real proportional change).
Redraw: axis from zero, same data. The "sharp rise" reads as a modest one.
Mechanism: reader assumed bar length was proportional, as bars require (L# 1, L# 9).

## 2026-12-01 · Build 4 · EcoTrace decision-first dashboard · states pass
Built: 3 KPI tiles, 1 bullet graph, 5 states.
Test: 2 SME-owner-profile users, asked "what should you do next" after 10s.
Result: 2/2 answered correctly with the completeness-first layout; the earlier kit-style draft scored 0/2 on the same question last month.
Rule: task-based testing overrides "looks professional" feedback, every time (L# 12).
```

**Monthly roll-up:** charts and tables built · belts passed · Lie Factor audits completed · accessibility passes (NVDA) · India-boundary checks logged · comprehension-test results · recurring failure mechanisms · philosophy revisions · the one change for next month.

---

## 13. If You Only Have Thirty Days

About 60–90 minutes a day, six days a week, alongside your Figma and React work.

| Week | Focus | Outcome |
|---|---|---|
| 1 | L# 0–2; D1–D2 daily; Exercises 1, 4, 5 | White/Yellow belts; encoding fluency and one clean chart, table and legal map |
| 2 | L# 3–4; D3–D4 daily; Exercises 7, 9 | Green belt; a CVD-safe token set and one rebuilt table |
| 3 | L# 5–6; D5–D6; Exercises 12, 13; Build 4 started | Blue belt; a decision-first EcoTrace dashboard and a compliant supplier map |
| 4 | L# 7–9, 11; Exercises 15, 17, 20; Build 10 started | Brown/Black attempts; a scrollytelling piece, an honesty audit, and the EcoTrace BRSR chart set under way |

Black continues over the next 4–6 weeks. Everything else in this file is the long version of the same loop.
