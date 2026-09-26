# Motion Design (UI-Focused) → Training Programme
## T8: Design: 18 · Slow-Motion Studies · Timing & Curve Drills · Micro-interaction Rebuilds · Choreography Builds · Reduced-Motion Trials · Motion Systems · Taste Forge

> This is the **training** counterpart to `L8-design-18-motion-ui.md`. The L file is the class: why interfaces move, principles, timing, easing and springs, choreography, micro-interactions, accessibility and performance, motion systems and implementation. This file is the room afterwards. Nothing here is new material. Everything is repetition, pressure and production, aimed at:
>
> - **Muscle memory:** choosing a duration and curve without deliberating, building a micro-interaction in Figma Motion and in code, writing a complete motion spec, and producing reduced-motion variants by habit.
> - **Intuition:** feeling 50 ms differences, seeing when an ease-in is used where an ease-out belongs, predicting jank before profiling, and knowing when to cut an animation.
> - **Taste:** your own motion philosophy (calm vs playful, how much bounce, where delight belongs), proven on real products and tested with real people.
>
> Reference: `L#` means that Part of the L file. **Tools:** **Figma Motion** (open beta; you have it on your Full seat) and Smart Animate *[Figma: Orange → Blue]*; your **Next.js/React** stack with CSS, **Motion** (motion.dev) and **GSAP** (free); a phone with developer settings (animation scale, Reduce Motion); a screen recorder that captures 60 fps; Chrome devtools Performance panel.

---

## 1. How to Train

| Shape | Length | Use |
|---|---|---|
| **Drill** | 10–20 min | Section 3. Timing, curve, spring and spec reps. |
| **Exercise** | 45–90 min | Section 4. One graded deliverable (a micro-interaction set, a transition, a spec, a system). |
| **Build** | 2–5 h | Section 5. A product's motion moved one milestone. |
| **Trial** | 30–45 min | Section 6. Janky or misused motion, a timer, a diagnosis. |
| **Study** | 30–60 min | Section 7. Frame-by-frame study of a great interaction, then a rebuild. |
| **Forge** | 30 min, weekly | Section 9. Philosophy, motion tokens, component library. |

**Rules of the room:**
1. **No new theory during T time.**
2. **Every session ends with a moving artefact:** an MP4 or GIF export, a Figma prototype link, or a deployed code demo, logged in `design-training/18-motion/LOG.md`.
3. **Name the job** (orientation, feedback, continuity, attention, personality) for every animation before building it. No job, no animation.
4. **Spec everything:** trigger, property, from/to, duration, delay, curve or spring, reduced-motion behaviour.
5. **Reduced motion is a required state**, designed and exported alongside the full version, past White belt.
6. **Transform and opacity only** in code unless you can justify otherwise.
7. **Log every failure** (Section 12) by mechanism: no job, too long, wrong curve, competing motion, direction break, not interruptible, jank, reduced-motion ignored, motion-only information.

**The weekly minimum:** 3 drills · 1 exercise · 1 build session · 1 trial · 1 frame-by-frame study · 1 forge entry · 10 minutes of slow-motion viewing of apps you use.

---

## 2. The Belt Ladder

| Belt | Gate (cold, timed) | Covers |
|---|---|---|
| **White** | In 20 min: label the job of every motion in a 60-second screen recording; map the 12 principles to UI examples; state duration ranges and the four easing rules. | L# 0–2 |
| **Yellow** | In 30 min: five micro-interactions in Figma Motion (press, toggle, like, error shake with message, success check), each with a written spec and a reduced-motion variant, exported as MP4. *[Figma: Orange]* | L# 2, 4, 5 |
| **Orange** | In 45 min: a container-transform card-to-detail transition and its reverse, plus a staggered list entrance (capped stagger), with consistent spatial direction, in Figma Motion or Smart Animate. *[Figma: Orange → Blue]* | L# 3 |
| **Green** | In 60 min: the Yellow set built in code (CSS + Motion or GSAP), transform/opacity only, `prefers-reduced-motion` handled, holding 60 fps under 4× CPU throttling in a Performance trace. | L# 5, 7 |
| **Blue** | In 60 min: a sheet interaction with a spring that follows the finger and can be interrupted mid-animation (Motion drag or native), with velocity-aware dismissal. | L# 2, 7 |
| **Brown** | In 90 min: a motion system for a given product: 3–5 principles, duration/easing/spring tokens (DTCG-style), transition patterns per navigation type, productive vs expressive rules, reduced-motion variants, and one fully specced handoff. | L# 6 |
| **Black** | Over 2 weeks: the complete motion layer of a real product (EcoTrace, Meridian UI or your portfolio): a system, 12+ micro-interactions and 4 transitions built in code, reduced-motion versions, a performance report on a budget phone, a motion QA pass against prototypes, and a short case study video. | L# 0–12 |

---

## 3. Drill Bank

**D1 — Timing reps** *[Figma: Orange]*
| Drill | Target |
|---|---|
| Assign durations to 10 described motions (toggle, tooltip, sheet, page, celebration…) | 3 min |
| Same fade at 100, 200, 300, 500 ms: pick the right one for a tooltip, a dialog, a page | 4 min |
| Entrance + exit pair with exit ≈ 75% of entrance | 3 min |
| Count frames of 3 system transitions from a 60 fps recording and convert to ms | 5 min |

**D2 — Curve and spring reps**
| Drill | Target |
|---|---|
| Choose ease-out / ease-in / ease-in-out / linear for 10 described motions | 3 min |
| Read 5 `cubic-bezier()` values and sketch each curve | 5 min |
| Tune a spring to feel "calm", "friendly" and "playful" (duration + bounce) | 6 min |
| Write a `linear()` approximation of a bounce with 8+ points (use a generator, then read it) | 6 min |

**D3 — Micro-interaction reps** *[Figma: Orange]*
| Drill | Target |
|---|---|
| Press state with 3% scale and 100 ms ease-out | 3 min |
| Toggle with a spring thumb and a colour transition | 6 min |
| Like pop with overshoot, non-blocking | 6 min |
| Send → spinner → check transformation in one element | 10 min |
| Skeleton shimmer that matches a card's shape | 6 min |

**D4 — Choreography reps**
| Drill | Target |
|---|---|
| Stagger 12 list items, capping total stagger at 300 ms | 5 min |
| Choose transition pattern (container transform / shared axis / fade through / fade) for 8 navigation cases | 4 min |
| Sketch the spatial model of a 4-tab app with details and sheets | 5 min |

**D5 — Code and performance reps**
| Drill | Target |
|---|---|
| CSS transition for a hover/press state with `:focus-visible` parity | 4 min |
| `prefers-reduced-motion` override replacing slides with fades | 4 min |
| Convert a `height` animation into `transform: scaleY` (or a grid-rows trick) | 6 min |
| A Motion `AnimatePresence` exit animation in React | 8 min |
| A view transition between two routes in Next.js | 10 min |

**D7 — Gesture and data-motion reps** (L# 8–9)
| Drill | Target |
|---|---|
| For 5 described flicks (position %, velocity), decide dismiss or stay using projection, then check | 4 min |
| Sketch a rubber-band offset curve and mark where resistance starts | 3 min |
| Add `touch-action` and axis-locking rules to a horizontal carousel inside a vertical page | 6 min |
| Keyed list re-sort in React with Motion `layout` so items keep their identity | 8 min |
| Number change with `tabular-nums` and Indian grouping (`12,34,567`) that doesn't jitter | 6 min |

**D8 — Context and critique reps** (L# 10–11)
| Drill | Target |
|---|---|
| Split a Hindi and a Tamil phrase with `Intl.Segmenter` and animate by grapheme, then by word | 8 min |
| Mirror a slide-in transition for `dir="rtl"` (Urdu) | 4 min |
| Translate 6 critique words ("floaty", "abrupt", "busy"…) into a mechanism and a fix | 4 min |
| Slow an animation to 10% in Chrome's Animations panel and write its duration and curve | 5 min |

**D6 — Recall (Anki)**
The 12 principles, Willenskomer's principles, the five jobs, duration ranges, easing rules, spring parameters, transition patterns, WCAG 2.2.2/2.3.1/2.3.3, layout/paint/composite, frame budgets, motion token names, library facts (Motion independent Nov 2024, GSAP free 2025, Figma Motion open beta June 2026). **Target: 95%, 10 min daily.**

---

## 4. Exercise Bank

**Level 1 — Seeing motion**
1. **Job-labelling study** (L# 0 analysis). Three apps, five minutes each, slowed down. *Accept:* every motion labelled; jobless motions listed.
2. **Principle annotation** (L# 1 analysis). One rich interaction annotated with ≥ 4 of the 12 principles and timestamps.
3. **Frame-count table** (L# 2 analysis). Five system transitions measured in ms. *Accept:* compared with the L# 2 ranges.

**Level 2 — Timing and curves**
4. **Five-curve test** (L# 2 analysis). The same sheet at 300 ms in 5 curves, shown to 3 people. *Accept:* predictions vs responses logged.
5. **Spring personality set.** Calm, friendly and playful springs applied to the same toggle and card. *Accept:* 3 people match each to the right word.

**Level 3 — Micro-interactions and transitions**
6. **Five rebuilds** (L# 4 analysis). Five everyday micro-interactions rebuilt in Figma Motion, one in code. *Accept:* timings within ±30 ms of the originals.
7. **Container transform in two media** (L# 3 analysis). Figma Motion/Smart Animate and View Transitions in Next.js. *Accept:* reverse works; comparison notes.
8. **Spatial model map** (L# 3 analysis) of an app, with one broken direction found and a fix.
9. **Loading choreography.** Skeleton → content fade-in with zero layout shift. *Accept:* CLS ≈ 0 in Lighthouse.

**Level 4 — Accessibility and performance**
10. **Reduce Motion survey** (L# 5 analysis). Five apps with Reduce Motion on. *Accept:* each graded (adapts / ignores / breaks).
11. **Height vs transform trace** (L# 5 analysis). *Accept:* two Performance traces with frame-time comparison under throttling.
12. **Reduced-motion variants** for all of Exercise 6. *Accept:* feedback preserved without large movement.

**Level 5 — Systems and code**
13. **Motion section for Meridian UI** (L# 6 analysis). *Accept:* principles, tokens, patterns, reduced motion, one full spec.
14. **Three-way implementation** (L# 7 analysis). One micro-interaction in CSS, Motion and GSAP. *Accept:* size, smoothness and tuning effort compared.
15. **Handoff test.** Hand a Figma Motion prototype to a developer friend (or yourself a week later) with only the Dev Mode output and your spec. *Accept:* the build matches within ±30 ms and the same curve.

**Level 6 — Gestures, information, context and QA**
16. **Projection vs threshold sheet** (L# 8). Build two versions of a bottom sheet: one dismisses past 50%, one uses projected landing. Ask 3 people to dismiss it with quick flicks and slow drags. *Accept:* a log of false dismissals and failed dismissals for each; the projection version wins or you explain why not.
17. **Interrupt everything** (L# 8). Take three of your animated components and interrupt each at 25%, 50% and 90% with the opposite action. *Accept:* no jumps in position or velocity; a screen recording showing each.
18. **Staged chart transition** (L# 9). An EcoTrace emissions chart that filters, then re-sorts, then re-scales, with object constancy. *Accept:* two people describe the change correctly after one viewing; a hard-cut version performs worse or equal.
19. **Streaming response UI** (L# 9). A mock AI answer that streams tokens, auto-scrolls only while the user is at the bottom and never moves the line being read. *Accept:* scrolling up mid-stream stops following; no layout jumps in a recording.
20. **UPI-style confirmation set** (L# 10). Success, pending and failure screens with motion, haptic notes and a static final frame that works as a screenshot receipt. *Accept:* 3 people correctly name each state from a 1-second glimpse; the pending state is never confused with success.
21. **Indic and RTL motion** (L# 10). A headline reveal in Hindi, Tamil and Urdu. *Accept:* no broken conjuncts in any frame (screenshot proof at 3 moments); Urdu direction mirrored.
22. **Budget-phone pass** (L# 10). Run your micro-interaction library (Build 1) on a ₹10,000-class Android. *Accept:* a list of animations that dropped frames, with fixes and re-measured results.
23. **Motion critique and QA** (L# 11). Critique a site you admire and one you don't in the Part 11 order, with timestamps; then run a full motion QA pass on one of your own builds. *Accept:* ≥ 5 findings each, every one with a mechanism and a fix.

---

## 5. Build Ladder

| # | Project | Hard constraint | Stretch |
|---|---|---|---|
| 1 | **Micro-interaction library** | 12 micro-interactions as React components in Meridian UI, with reduced-motion variants and docs | Published Storybook with motion specs |
| 2 | **Transition kit** | Container transform, shared axis, fade through and sheet patterns in Next.js (View Transitions + Motion) | Works across routes with back/forward |
| 3 | **EcoTrace motion layer** | Loading, success, error and data-update motion for a dashboard, calm and productive | Value-change animations for numbers that don't mislead |
| 4 | **Portfolio motion pass** | Your portfolio with ≤ 2 signature animations plus consistent micro-interactions (`TD-02#46`) | A page-transition system |
| 5 | **Gesture sheet** | A draggable, interruptible, velocity-aware bottom sheet | Snap points and keyboard alternative |
| 6 | **Celebration moment** | One expressive moment (first filing submitted, course completed) with sound and haptic notes for 20 | A Rive version for comparison (43) |
| 7 | **Motion system doc** | The Brown-belt gate for a real product | Tokens exported as DTCG and consumed by CSS |
| 8 | **Scroll story** | A scroll-driven explainer section with native CSS, reversible, reduced-motion static version | A scroll-scrubbed video section (16 Part 5) |
| 9 | **Motion QA report** | Prototype vs build comparison for 10 interactions with fixes | Automated visual regression for motion states |
| 10 | **Flagship: a product's motion layer** | The Black-belt gate | Case study video with before/after |

---

## 6. Critique & Failure Drills

- **Jank hunt.** A page with 6 planted performance problems (animating width, top, box-shadow on scroll, a large blur, a JS scroll listener, a non-composited filter). Find them with a Performance trace in 30 minutes.
- **Misused-curve trial.** Ten animations with planted wrong curves (ease-in entrances, linear sheets, bouncy bank transfers). Fix and justify each.
- **Choreography trial.** A screen where five elements animate at once. Re-choreograph with a lead element and offsets.
- **Direction-break trial.** A prototype whose back transitions go the wrong way. Map and fix the spatial model.
- **Reduced-motion trial.** A site with parallax, auto-playing carousels and a scroll-jacked section. Produce the reduced-motion version without losing information.
- **Gesture trial.** A sheet and a carousel with planted gesture bugs (easing during drag, no velocity hand-off, fixed 50% threshold, captured page scroll, no close button). Find and fix them in 30 minutes.
- **Indic text trial.** A per-letter headline animation that breaks Devanagari conjuncts. Diagnose from screenshots and fix with `Intl.Segmenter` or word-level animation.
- **Receipt trial.** A payment-success animation whose key information appears only mid-animation. Redesign so the last frame stands alone.
- **Live review.** Copy the Figma frame link (Figma Motion timeline) and paste into a Claude chat: *"Live review for T8-18 [Belt]. Check each animation's job, durations, curves or springs, choreography and direction, interruptibility, reduced-motion variant, and whether the Dev Mode output matches the spec. List findings by severity with fixes."* For code builds, attach a screen recording and a Performance trace screenshot. Log findings by mechanism.

**Postmortem template:** motion · failure · mechanism (job, duration, curve, choreography, direction, interruptibility, performance, accessibility) · evidence (recording, trace, test) · why missed · fix · the check that prevents it.

---

## 7. Study & Reproduce

**Weekly cycle:** pick one interaction → record at 60 fps → step through frame by frame → **predict** durations, curves and choreography → rebuild in Figma Motion → rebuild in code → **diff** timing curves side by side (overlay the recordings) → write one sentence on what made it feel right.

**Target list for the first year:** iOS sheet presentation and dismissal · Dynamic Island expansion · Liquid Glass tab bar shrink on scroll · Material 3 container transform (Google apps) · Linear's command palette · Things 3's new-to-do animation · Stripe's checkout success · Duolingo's lesson-complete celebration · Google Pay/PhonePe payment success · Swiggy's live order tracking · Sonner's toast stacking (Emil Kowalski) · Vaul's drawer · CRED's reward reveal · a Smart Animate card carousel (`TD-08#12`) · Magic UI's Dock (`TD-08#25`) · a bottom sheet in Apple Maps (projection and snapping) · streaming answers in two AI assistants (auto-scroll behaviour) · a chart re-sort in a well-made data site (object constancy).

---

## 8. Intuition Probes

- **Duration probes:** watch an animation and guess its duration in ms before measuring. Target error ≤ 50 ms.
- **Curve probes:** name the curve (ease-in, ease-out, ease-in-out, linear, spring) from a recording. Check against the code or a frame plot.
- **Jank probes:** predict whether an animation will hold 60 fps on a budget phone before tracing.
- **Preference probes:** predict which of two variants 5 people will prefer. Test.
- **Reduced-motion probes:** predict how an app will behave with Reduce Motion on. Check.

- **Gesture probes:** before releasing a flick, predict whether the sheet will dismiss. Check against the rule you built.
- **User-reaction probes:** before a test, predict which animation users will try to skip or call "slow". Check against what they do.

Track hit rates in `LOG.md`. The target is ≥ 70% over the last 30 probes.

---

## 9. Taste Forge

- **Motion philosophy.** One page: calm vs playful, where bounce is allowed, your default durations and curves, your delight budget. Revised after each real project.
- **Motion tokens.** Your personal set (durations, easings, springs, stagger) as DTCG JSON and CSS variables, used in every build.
- **Component library.** Your micro-interactions as reusable components (Meridian UI), improved monthly.
- **Pattern journal.** One motion decision per week (e.g. "fade through vs shared axis for tab switches"), the alternatives, the choice.
- **Three ways.** One success state animated three ways (fade + check draw, spring pop, morph from button). Test with 5 people, keep one, write why.
- **Decision log.** For every animation you ship, one line: its job, the alternatives you rejected (no motion, CSS, Motion, Rive), what users did with it in testing, and whether you'd keep it. Review monthly and delete one animation that no longer earns its place.
- **Context kit.** A saved set of test conditions you run on every build: a budget Android, Reduce Motion on, a Hindi and a Tamil string, an RTL layout, 4× CPU throttling.
- **Constraint runs.** An app's motion with only 3 durations and 2 curves. A delightful moment in under 400 ms. A page transition using only opacity. A full micro-interaction set that still communicates with Reduce Motion on.

---

## 10. Assessment & Graduation

You are **trained in UI motion** when all are true, with artefacts:

1. **Fluency:** D1–D5 within target; D6 recall at 95%; duration probe error ≤ 50 ms.
2. **Micro-interactions:** 12+ built in Figma Motion and in code, with specs and reduced-motion variants.
3. **Transitions:** four transition patterns built in code, reversible and direction-consistent.
4. **Performance:** traces showing 60 fps under throttling for your core interactions.
5. **Accessibility:** every motion has a reduced-motion behaviour; no information conveyed by motion alone.
6. **Systems:** a motion system adopted in a real product with tokens consumed by code.
7. **Handoff:** one handoff built by someone else that matched your spec.
8. **Gestures and context:** one velocity-aware, interruptible gesture component; one motion set verified on a budget Android and in two Indic scripts.
9. **Users:** at least three animations tested with real people, with one changed or removed because of what they did.
10. **Taste and teaching:** philosophy revised ≥ 3 times; you can teach easing, springs, gestures and reduced motion in 10 minutes each.

---

## 11. Spaced Schedule

| Day | Session | Content |
|---|---|---|
| Mon | Drill (15 min) + Anki | D1/D2; D6 |
| Tue | Exercise (75 min) | Current exercise |
| Wed | Build (2 h) | Current build *[Figma Motion + code]* |
| Thu | Drill (20 min) + Probe | D3–D5; one probe |
| Fri | Trial (40 min) | Jank, curve, choreography or reduced-motion trial |
| Sat | Study (60 min) | Frame-by-frame study and rebuild |
| Sun | Forge (30 min) + Log (15 min) | Philosophy, tokens, component library, roll-up |

**Review cadence:** weekly, re-watch one old build in slow motion · fortnightly, a budget-phone performance check · monthly, a fresh gate attempt and one study published as a short video (useful for your planned faceless motion channel) · quarterly, a full motion QA of your flagship product.

**Spaced repetition (Anki), facts only:** 12 principles (Thomas & Johnston 1981) · Willenskomer's UI principles (2017) · five jobs · duration ranges and adjustments · easing rules · spring parameters and SwiftUI `.spring(duration:bounce:)` · container transform/shared axis/fade through/fade · WCAG 2.2.2, 2.3.1, 2.3.3 · layout/paint/composite · 16.7 ms / 8.3 ms · Carbon productive vs expressive · Motion (Nov 2024), GSAP free (2025), Figma Motion open beta (24 June 2026) · WWDC 2018 "Designing Fluid Interfaces" · projection and rubber-banding · WCAG 2.5.1 and 2.5.7 · object constancy (Bostock 2012) · Heer & Robertson (2007) · `Intl.Segmenter` for Indic text.

---

## 12. Logbook

```
## 2026-10-06 · Exercise 4 · Five-curve test · bottom sheet 300 ms
Prediction: ease-out "fastest", spring 0.2 "most natural".
Results (3 people): ease-out fastest 3/3 ✓; most natural: spring 2/3, ease-in-out 1/3.
Surprise: linear rated "broken" by all three.
Rule: sheets = decelerate curve or gentle spring; never linear.

## 2026-10-14 · Exercise 16 · Projection vs threshold sheet
Threshold version: 4 failed dismissals from quick flicks (released at ~20%).
Projection version: 0 failed, 1 accidental dismiss from a slow drag released while moving down.
Mechanism: velocity sign ignored when the drag was slow.
Rule: below a minimum velocity, fall back to position; above it, trust the projection.

## 2026-10-09 · Trial · Jank hunt · 28 min · 5/6 found
Missed: box-shadow animating on hover of 40 cards (paint storm).
Mechanism: shadow transitions look cheap in Figma, cost paint every frame in the browser.
Fix: animate opacity of a pre-rendered shadow pseudo-element.
```

**Monthly roll-up:** interactions built · belts · duration-probe error · performance results · reduced-motion coverage · recurring failure mechanisms · philosophy revisions · the one change for next month.

---

## 13. If You Only Have Thirty Days

About 60–90 minutes a day, six days a week, alongside Figma's Blue belt.

| Week | Focus | Outcome |
|---|---|---|
| 1 | L# 0–2; D1–D2 daily; Exercises 1, 3, 4 | White belt; a trained sense of duration and curve |
| 2 | L# 4; D3 daily; Exercises 6, 12 | Yellow belt; five micro-interactions with specs and reduced-motion variants |
| 3 | L# 3, 5; D4–D5; Exercises 7, 9, 11 | Orange and Green belts; transitions in Figma and code at 60 fps |
| 4 | L# 6–8, 11; Exercises 13, 16, 17, 23; Build 1 started | Blue/Brown attempts; a motion section for Meridian UI and a micro-interaction library under way |

Black continues over the next 4–6 weeks. Everything else in this file is the long version of the same loop.
