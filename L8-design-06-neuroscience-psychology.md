# Neuroscience & Psychology → How Minds Meet Designs
## L8: Design: 06 · The Predictive Brain · Visual System · Attention · Memory & Load · Time & Motion · Emotion & Aesthetics · Decisions & Behaviour · Human Variation · Evidence Literacy · Behavioural Evidence & Ethical Persuasion · Trust, Error & Automation in Real Products

> This is the **learning** file for the science underneath every other module: how the visual system turns light into objects, how attention is captured and steered, how memory and cognitive load limit what people can process, how time and motion are perceived, how emotion and aesthetic judgement form in fractions of a second, how decisions are shaped by framing and defaults, and how all of this varies across ages, cultures and minds. It also covers how to tell real findings from folklore. It deliberately stops where application begins: principles built on this science are `L8-design-02-theory-principles.md`, behavioural product design (habit loops, gamification) is `L8-design-27-gamification-behavioural.md`, the ethics of influence is `L8-design-31-ethics-philosophy.md`, and research methods in practice are `L8-design-24-design-research.md`. The training counterpart is `T8-design-06-neuroscience-psychology.md`.
>
> **Currency stamp (September 2026):** psychology is still recovering from its **replication crisis** (the Open Science Collaboration's 2015 attempt reproduced roughly 36–39% of 100 published effects). Several design-folklore staples are casualties or were never supported: ego depletion, strong priming effects, choice-overload as a universal law, learning styles, and the "8-second attention span". Meanwhile **dark patterns became a legal category**: the EU's Digital Services Act (2022) prohibits deceptive interface design on platforms, and India's Central Consumer Protection Authority issued *Guidelines for Prevention and Regulation of Dark Patterns* (November 2023), naming 13 specified patterns. A designer who uses psychology is now also a designer who can break the law with it.

---

## How To Use This Document

**Depth ladder:** **L1** Name it · **L2** Use it correctly · **L3** Choose it over alternatives · **L4** Explain the mechanism · **L5** Design an experiment or artefact that demonstrates it · **L6** Teach it and critique misuse.

**Tier tags:** **[Core]** every designer · **[Deep]** senior depth · **[Frontier]** contested or moving.

**Each Part closes with:** *Intuition anchors* · *Mastery checks* · *Analysis* · *Taste*.

**The science-specific learning loop:**
1. **Find the primary source once.** For every effect you rely on, read the original paper's abstract and method (and a replication, if one exists). A reel or a "Laws of UX" card is a pointer, not evidence.
2. **Ask four questions of every claim:** *who were the participants* (WEIRD students?), *how big was the effect*, *has it replicated*, and *does the lab task resemble my design situation*?
3. **Demonstrate it on yourself.** Most perceptual effects can be experienced in 30 seconds (change blindness, the Stroop effect, simultaneous contrast, the Müller-Lyer illusion). Feel it before you cite it.
4. **Translate every mechanism into a design rule and a failure mode.** "Attention is captured by motion onset" becomes "animate only what needs attention now" and "autoplay carousels steal attention from primary content".
5. **Run tiny experiments.** 5-second tests, first-click tests and A/B comparisons with five friends aren't science, but they train you to treat design claims as hypotheses.
6. **Keep a myths ledger.** Every time you catch a myth (in a reel, a deck, a textbook), log the claim, the source and the correction. It's the fastest way to become the most trusted voice in a critique.

**Relationship to the other files:**
- `L8-design-02-theory-principles.md`: Gestalt, hierarchy, Fitts, Hick and Doherty get their mechanisms here.
- `L8-design-03-colour-theory-science.md` Part 0 (cones, opponency) is expanded here into the whole visual pathway.
- `Instagram - To Learn/10-MEMORY-AND-RETENTION.md` and `12-ATTENTION-FOCUS-AND-HABITS.md` apply the same science to *your own* learning, and the T8 spaced schedules rest on it.

---

## PART 0 — Foundations: The Mind as a Prediction Machine [Core]

- **Why designers need this:** every design principle is a bet about human perception, cognition or behaviour. Knowing the mechanism tells you *when the bet holds*, *when it fails* and *how to extend it* to situations no rule-book covers (a new device, a new culture, a new medium).
- **Levels of processing** (a working stack, from photons to choices): **sensation** (receptors respond to light, sound, touch) → **perception** (the brain constructs objects, depth, motion, colour) → **attention** (a small subset gets selected for further processing) → **memory** (working memory holds a few items, long-term memory stores schemas) → **emotion and evaluation** (fast judgements of value and threat) → **decision and action** (choices, habits, motor output). Design touches every level, and failures at a lower level (unreadable contrast) can't be fixed at a higher one (clever copy).
- **Perception is inference, not recording.** Hermann von Helmholtz (1867) called perception **"unconscious inference"**: the brain guesses the most likely world that could have produced the signals. Modern **predictive processing** (Karl Friston; Andy Clark, *Surfing Uncertainty*, 2016) formalises this: the brain constantly predicts incoming input and mostly processes **prediction errors**. Design consequences: **conventions work because they're predicted** (Jakob's law), **surprise costs processing** (use it deliberately for delight or alerts, never for navigation), and **illusions are the brain's correct bets in unusual situations**.
- **Two modes of thinking:** Daniel Kahneman's *Thinking, Fast and Slow* (2011) popularised **System 1** (fast, automatic, associative, effortless) and **System 2** (slow, deliberate, effortful, limited). It's a simplification of dual-process theories (Stanovich & West, Evans), useful as a design heuristic: **most interface use is System 1**. People scan, recognise and act on habit. Good design lets System 1 succeed and calls System 2 only when the stakes justify it (a confirmation before deleting, a review screen before payment).
- **The limits that shape everything:** a tiny high-resolution visual window (the fovea), a narrow attentional bottleneck, a working memory of about **4 chunks**, perceptual thresholds in time (about 100 ms feels instant), and energy-conserving laziness (the "cognitive miser", Fiske & Taylor, 1984). **Good design is a set of workarounds for these limits.**
- **Evidence posture:** psychology gives **probabilistic, context-dependent regularities**, not laws. Effects vary with culture, age, expertise, stakes and task. The designer's skill is **transfer with humility**: apply the mechanism, then check with real people.

**Intuition anchors**
- Your user isn't seeing your design. They're seeing their brain's best guess about it, built from every interface they've seen before.
- Design for System 1 by default, and wake System 2 only when a mistake would be expensive.

**Mastery checks**
- Explain Helmholtz's "unconscious inference" and one modern design consequence of predictive processing.
- Explain System 1 and System 2, and name two interface moments where you'd deliberately engage System 2.
- List the five core cognitive limits and one design workaround for each.

**Analysis**
- Take one app you use daily. Walk through a core task and label each step by the level it mostly engages (sensation, perception, attention, memory, emotion, decision). Mark the one step where a lower-level failure makes the higher level harder, and redesign it *[Figma: Yellow]*.

**Taste**
- Respect the user's brain as a tired, efficient guesser. The kindest thing a design can do is be exactly what the brain expected wherever it needs to be, and pleasantly surprising only where surprise is the point.

---

## PART 1 — The Visual System: From Photons to Objects [Core → Deep]

- **The eye:** about **120 million rods** (low light, no colour, concentrated in the periphery) and about **6 million cones** (colour and detail, concentrated in the **fovea**, the central ~1–2° of vision, roughly a thumbnail at arm's length). Outside the fovea acuity drops steeply. **You only see sharply where you're looking**, and the rest is reconstructed. The eye moves 3–4 times a second (saccades) to sample the scene (04 Part 2).
- **Lateral inhibition and edges:** retinal cells enhance **contrast at edges** by inhibiting their neighbours. That's why you see **Mach bands** (illusory light and dark stripes at gradient boundaries) and the **Hermann grid** dots, and why the visual system is fundamentally an **edge and contrast detector**, not a light meter. Design consequence: boundaries matter more than fills, and value contrast at edges is what makes shapes legible (03 Part 2).
- **Primary visual cortex (V1):** David Hubel and Torsten Wiesel (1959–62; Nobel 1981) found neurons tuned to **edges and lines at specific orientations**, the building blocks of shape perception. Higher areas combine them: **V4** (colour and form), **MT/V5** (motion), the **fusiform face area** (Nancy Kanwisher, 1997) and the **visual word form area** (Stanislas Dehaene, *Reading in the Brain*, 2009), a region repurposed by literacy to recognise letters, which explains why reading is fast yet learned.
- **Two streams:** the **ventral "what" pathway** (object identity, toward the temporal lobe) and the **dorsal "where/how" pathway** (location, motion, action guidance, toward the parietal lobe) (Ungerleider & Mishkin, 1982; Goodale & Milner, 1992). Loosely: you *recognise* a button with the ventral stream and *reach* for it with the dorsal stream. Fitts's-law targeting is dorsal. Icon recognition is ventral.
- **Peripheral vision** is low resolution but **highly sensitive to motion and flicker**, an evolutionary alarm system. Hence notification badges, animated ads and blinking cursors in the periphery grab attention involuntarily (Part 2). **Crowding** (Denis Pelli and others): objects in the periphery become unrecognisable when cluttered by neighbours, which is why dense icon grids are hard to scan out of the corner of the eye.
- **Contrast sensitivity and spatial frequency:** the visual system is most sensitive to mid spatial frequencies (roughly 3–5 cycles per degree), and sensitivity falls with age and low light. Thin, low-contrast strokes (hairline fonts, 1px grey borders) are among the first things to disappear for older users and in sunlight.
- **Depth and the flat screen:** the brain uses monocular cues (occlusion, relative size, shading from an overhead light, atmospheric perspective, texture gradients) to infer depth. UI elevation relies on **shadow from an assumed top light**. Flip the shadow and a button looks pressed in. Material's elevation system and Apple's layered materials are applied depth perception (05 Part 5).
- **Faces and objects:** faces are detected pre-attentively, processed holistically (upside-down faces are hard to read, the Thatcher illusion) and followed for gaze direction (05 Part 3). **Pareidolia** (seeing faces in cars, sockets and logos) is why front-facing product design and mascots carry "personality".
- **Illusions as lessons:** the **Müller-Lyer** illusion (lines look different lengths because of their arrowheads, so optical alignment matters), the **Ebbinghaus** illusion (size relative to neighbours, so icons look different sizes in different contexts), the **checker-shadow illusion** (Edward Adelson, 1995: identical greys look different under an implied shadow, which is constancy at work, 03 Part 2), the **Kanizsa triangle** (illusory contours, the basis of closure). Every "optical correction" in 02 and 04 compensates for one of these.

**Intuition anchors**
- The eye sees edges, motion and faces first. Colour and detail arrive later, and only where the fovea points.
- Anything thin, pale or peripheral is fragile. Design critical information to survive a tired eye in bright sunlight.

**Mastery checks**
- Explain the fovea's size and what it implies for "seeing" a whole screen.
- Explain lateral inhibition and connect it to Mach bands and edge-based legibility.
- Distinguish the ventral and dorsal streams with an interface example of each.
- Explain crowding and one layout consequence.

**Analysis**
- Build a Figma page *[Figma: White]* reproducing the Müller-Lyer, Ebbinghaus, Kanizsa and Adelson checker-shadow illusions from scratch (no images). For each, write the design situation where the same mechanism causes an error (e.g. an icon appearing smaller inside a large container) and the correction.

**Taste**
- Design for the eye you actually have: an edge detector with a pinhole of detail and a motion alarm around it. Designs that respect that architecture feel effortless. Designs that fight it feel noisy, however beautiful the parts.

---

## PART 2 — Attention: Capture, Guidance & Blindness [Core]

- **Attention is a bottleneck:** far more reaches the eye than can be processed. Donald Broadbent's filter model (1958) framed attention as selection. Modern accounts distinguish **bottom-up (exogenous) capture**, driven by salience (motion onset, sudden appearance, high contrast, faces, one's own name), from **top-down (endogenous) guidance**, driven by goals and expectations. Michael Posner's cueing studies (1980) separated the two. Maurizio Corbetta and Gordon Shulman (2002) mapped them onto a **dorsal attention network** (goal-directed) and a **ventral network** (stimulus-driven reorienting).
- **Visual search:** Anne Treisman & Garry Gelade's **feature-integration theory** (1980): single-feature targets **pop out** in parallel, while conjunction targets need serial search (02 Part 2). Jeremy Wolfe's **Guided Search** (1994–) adds top-down guidance: knowing a target is "red and round" narrows the search. **Saliency maps** (Laurent Itti & Christof Koch, 1998–2000) compute bottom-up conspicuity from colour, intensity and orientation contrast. Free tools approximate them, and they predict first fixations reasonably well on free viewing, **but poorly when users have a task**, because goals override salience.
- **Inattentional blindness:** in Daniel Simons & Christopher Chabris's 1999 "gorilla" study, about half of the observers counting basketball passes missed a person in a gorilla suit walking through the scene. **People don't see what they aren't attending to, even when it's in plain view.** Design consequence: an error message outside the user's focus (a toast at the top while they look at a form field) often goes unseen. **Put feedback where attention already is.**
- **Change blindness:** Ronald Rensink's flicker paradigm (1997): large changes go unnoticed across a brief interruption (a blink, a page reload, a screen transition). Users miss that a price updated, a field cleared or a list re-sorted, unless the change is **animated in place** (motion reveals change) or **explicitly highlighted**. This is the perceptual argument for transition animation (bridge to 18).
- **Attentional capture by motion onset:** the *appearance* of motion captures attention more reliably than ongoing motion (Abrams & Christ, 2003). Constant motion eventually habituates, but new motion always interrupts. Rules: **animate state changes, not ambient decoration**; never animate near content that requires reading; treat autoplay as an attention tax.
- **Habituation and banner blindness:** repeated stimuli lose their power (the orienting response habituates). Users learn to skip ad-shaped regions (Benway & Lane, 1998; 05 Part 3), permanent badges, and confirmation dialogs that always appear ("dialog blindness", where users click OK without reading). **Rationed salience stays salient.**
- **The attention economy and ethics:** the same mechanisms (variable interruptions, red badges, infinite feeds) are used to capture time against users' interests. Tristan Harris and the Center for Humane Technology framed this as the "race to the bottom of the brainstem". Using capture for users' goals (an error in view) is design, and using it against them (a manufactured-urgency badge) is manipulation (Part 6; module 31).
- **Designing with attention, a checklist:** one primary salient element per view; feedback at the locus of attention; animate changes the user must notice; mute everything else; place status where eyes return (headers, near the action); test with a *task*, not free viewing.

**Intuition anchors**
- Attention is what users pay you with. Every salient element you add is a charge on their account.
- If a user must notice a change, animate it where they're already looking. Otherwise assume they won't see it.

**Mastery checks**
- Distinguish bottom-up and top-down attention and explain why saliency maps fail on task-driven use.
- Explain inattentional blindness and change blindness, each with an interface failure it predicts.
- Explain why motion *onset* is special and state three animation rules that follow.
- Explain habituation and "dialog blindness", and a design response.

**Analysis**
- Experience it first: watch Simons & Chabris's selective-attention video and a Rensink flicker demo (both are online). Then find two change-blindness failures in real apps (a price or total that updates silently, a filter that re-sorts without cue). Redesign each with in-place animation or highlight *[Figma: Blue, Smart Animate or Motion]*.

**Taste**
- Be stingy with salience. Interfaces that shout everything train users to hear nothing, and quiet interfaces with one clear signal are both calmer and more effective.

---

## PART 3 — Memory, Mental Models & Cognitive Load [Core]

- **The memory system, as designers need it:** Atkinson & Shiffrin's modal model (1968) runs sensory memory → short-term → long-term. Alan Baddeley & Graham Hitch's **working memory** (1974; episodic buffer added 2000) has a **phonological loop** (words), a **visuospatial sketchpad** (images, positions) and a **central executive** (control). Capacity is about **4 ± 1 chunks** (Nelson Cowan, 2001), not Miller's 7 ± 2 (02 Part 5). Items fade in seconds without rehearsal and are displaced by interruptions. **Every time your interface makes a user hold something in mind** (a code from SMS, a price from the previous screen, which filter was on) **you're spending their scarcest resource.**
- **Chunking and expertise:** William Chase & Herbert Simon (1973) showed chess masters recall real game positions far better than novices, but not random positions. Expertise is **stored patterns (chunks)**, not bigger memory. Design consequence: **experts and novices need different interfaces** (dense, shortcut-rich tools vs guided flows), and good grouping creates chunks for everyone (card numbers in fours, OTPs in threes, the Indian lakh grouping 1,23,456).
- **Recognition beats recall:** Roger Shepard (1967) found people recognised ~98% of 612 pictures shortly after viewing. Recognition is vastly easier than free recall. That's the mechanism behind Nielsen's heuristic 6 (*recognition rather than recall*): menus over commands, recent items, autocomplete, visible options, icons **with labels**.
- **Picture superiority and dual coding:** Allan Paivio's dual-coding theory (1971) holds that information encoded both verbally and visually is remembered better. Images are remembered better than words (the picture superiority effect). But decorative images that don't carry meaning add load without benefit (Richard Mayer's **coherence principle**, *Multimedia Learning*, 2001/2020).
- **Schemas and mental models:** Frederic Bartlett (*Remembering*, 1932) showed memory reconstructs events through **schemas**, expectations about how things go. Kenneth Craik (1943) and Philip Johnson-Laird (1983) framed **mental models** as internal simulations of how a system works. Norman's version (1988): the **designer's model**, the **system image** (what the design shows) and the **user's model** must align, and the only channel between designer and user is the system image. Wrong mental models produce confident errors (the "save" icon as a floppy disk, a model built from history; users who think "archive" means "delete").
- **Cognitive Load Theory** (John Sweller, 1988), from learning science and directly usable in UI:
  - **Intrinsic load** is the inherent complexity of the task. You can't remove it, only sequence it (Tesler, 01 Part 4).
  - **Extraneous load** is imposed by poor design: clutter, split attention, inconsistent layouts, jargon. **Remove it ruthlessly.**
  - **Germane load** is effort spent building understanding. Support it in onboarding and learning contexts.

  Techniques: **progressive disclosure**, **chunking and grouping**, **sensible defaults**, **inline help at the point of need**, **consistency** (learn once, apply everywhere), **eliminating split attention** (labels next to what they label), and **worked examples** (show a filled form).
- **Forgetting and learning:** Hermann Ebbinghaus (1885) plotted the **forgetting curve**: rapid loss, then a plateau. The **spacing effect** (distributed practice beats cramming) and the **testing effect** (Roediger & Karpicke, 2006: retrieval practice beats rereading) are among the most robust findings in psychology, and they're the basis of your T8 spaced schedules and Anki decks. For products: people forget how to use features they rarely use, so design rarely used flows as if for a first-timer.
- **Interruptions and resumption:** users are interrupted constantly (notifications, calls, context switches). **Preserve state** (drafts, scroll position, form progress), show **where they were** (breadcrumbs, "continue where you left off"), and make **every step self-explanatory** so resuming doesn't depend on memory. The Zeigarnik effect (unfinished tasks stay active) is weaker in replications than its popular reputation, so don't rely on it and do design for resumption.

**Intuition anchors**
- Every "remember this for the next screen" is a small tax. Carry the information forward and let the user forget.
- Users don't read your manual. They build a mental model from what the interface shows, so make it show the right one.

**Mastery checks**
- Explain working memory's components and capacity, and three interface patterns that overload it.
- Explain Chase & Simon's chess result and what it implies for expert tools.
- Explain intrinsic, extraneous and germane load with a UI example of each.
- Explain the designer's model / system image / user's model triangle and a real mismatch.

**Analysis**
- Audit one multi-step flow you use (booking a Tatkal ticket on IRCTC, filing on the income-tax portal, a bank's add-payee flow). List every place it makes you *remember* something across steps, every source of extraneous load, and every mental-model mismatch. Redesign the worst three steps *[Figma: Yellow]*.

**Taste**
- Design so the user never has to hold anything in their head that the screen could hold for them. The best interfaces feel like memory prosthetics, because they are.

---

## PART 4 — Time, Motion & Performance Perception [Core]

- **Response-time thresholds:** Robert Miller (1968, *Response time in man-computer conversational transactions*), refined by Card, Robertson & Mackinlay (1991) and popularised by Nielsen (1993): **~0.1 s** feels instantaneous (direct manipulation must hit this), **~1 s** keeps the flow of thought (show a subtle indicator beyond it), **~10 s** is the limit of focused attention (show progress, allow other work). Google's RAIL model (2015) turned these into web budgets. Doherty & Thadani's **400 ms** productivity threshold (1982) sits in the same band.
- **Apparent motion:** Max Wertheimer's **phi phenomenon** (1912, the paper that founded Gestalt psychology) showed that two stationary lights flashed in alternation are seen as one moving light. All screen animation relies on this: 24, 30, 60 or 120 frames per second of still images are fused into motion. Below ~24 fps motion looks steppy, and dropped frames (jank) are noticed at 60 fps because the eye expects regularity. Interfaces should target the display's refresh rate, and animating `transform` and `opacity` keeps it (bridge to L18 web).
- **Biological and physical motion:** Gunnar Johansson (1973) showed that a few moving dots on joints are instantly seen as a walking person, so the brain is tuned to physically plausible motion. That's why **easing** (acceleration and deceleration) feels natural and linear motion feels mechanical, why **springs** feel alive, and why the 12 principles of animation (Disney's Thomas & Johnston, *The Illusion of Life*, 1981) transfer to UI. Motion that violates physics (objects teleporting, stopping without deceleration) reads as broken (bridge to 18).
- **Perceived duration and waiting:** David Maister's *The Psychology of Waiting Lines* (1985): **occupied time feels shorter than unoccupied time**; **uncertain waits feel longer than known waits**; **unexplained waits feel longer than explained ones**; anxiety makes waits feel longer; and pre-process waits feel longer than in-process ones. These map directly onto loading design:
  - **Progress indicators** for known durations.
  - **Skeleton screens** for unknown, content-shaped waits (`TD-01#7 · @synsation_ · DYcbCoiIKK1`; `TD-01#11 · @synsation_ · DZIHbbIt5mc`).
  - **Status text** for long waits (`TD-01#8 · @synsation_ · DYkRtX1oKKN`: silence during a wait is the defect).
  - **Optimistic UI** (update first, confirm later) when success is likely and failure is cheap (`TD-01#19 · @designwithrajatpatel · DcNtszPqERn`).
  - Acknowledge input within ~100–300 ms (`TD-01#18 · @designwithrajatpatel · DcgYR03KCB2`).

  Chris Harrison and colleagues (2007, 2010) found that progress-bar behaviour changes perceived duration: bars that accelerate toward the end, and backwards-moving ripples, feel faster.
- **Weber–Fechner and just-noticeable differences:** the smallest detectable change is roughly **proportional to the base magnitude** (Weber's law, 1834; Fechner's logarithmic formulation, 1860). A 2px change is obvious at 10px and invisible at 200px. A 100 ms delay matters at 100 ms and not at 10 s. Stevens' power law (1957) refines this per sense. **Design differences in ratios, not absolute units:** modular type scales, spacing scales and duration scales are all Weber's law in action.
- **Timing ranges for UI motion** (full craft in 18): micro-feedback ~100–150 ms, small transitions ~200–300 ms, larger movements across the screen ~300–500 ms. Longer durations read as sluggish unless they're expressive, one-off moments. Larger distances need slightly longer durations to preserve perceived velocity. **Exits are faster than entrances.**
- **The Indian device reality changes the budget, not the thresholds.** The 0.1 / 1 / 10-second limits belong to the user and don't relax on a budget phone on patchy data. Render the shell or skeleton from cache before any network call, keep tap feedback local, write status text for the long tail ("Still uploading: 3 of 5 bills"), and test with throttling on. Users report silence as "it hung".

**Intuition anchors**
- Perceived time is what counts. A 2-second wait with honest progress feels shorter than a 1-second wait of silence.
- The brain predicts physics. Motion that obeys it disappears, and motion that breaks it gets noticed.

**Mastery checks**
- State the 0.1 / 1 / 10-second thresholds and the design response to each.
- Explain the phi phenomenon and why dropped frames are noticed.
- Apply four of Maister's propositions to a payment-processing screen.
- Explain Weber's law and why spacing and type scales use ratios.

**Analysis**
- Record three loading experiences (a food-delivery tracker, a bank transfer, an app cold start). Time each actual wait with a stopwatch, then rate how long each *felt* (1–10). Map the gap onto Maister's propositions, and redesign the worst one using skeletons, status text or optimistic UI *[Figma: Blue]*.

**Taste**
- Treat time as a design material. The moments between actions (waiting, transitioning, confirming) shape how a product feels more than any static screen, and most products leave them undesigned.

---

## PART 5 — Emotion, Aesthetics & First Impressions [Core → Deep]

- **Affect comes first and fast.** Robert Zajonc's *"preferences need no inferences"* (1980) and later work show affective reactions often precede and shape reasoning. Emotions are commonly mapped on James Russell's **circumplex** (1980): **valence** (pleasant–unpleasant) × **arousal** (calm–excited). A banking app aims for pleasant-calm, a game launch for pleasant-excited, and an error state must avoid unpleasant-excited (panic).
- **First impressions in 50 ms:** Gitte Lindgaard and colleagues (2006) found that people rate a web page's visual appeal within **50 milliseconds**, consistently with longer viewing. Alexandre Tuch and colleagues at Google (2012) found **low visual complexity** and **high prototypicality** (looking like what a site of that kind usually looks like) predicted higher beauty ratings in those first 50 ms. **Familiar, uncluttered designs win the first glance**, and distinctiveness must be earned within a recognisable frame.
- **Processing fluency:** Rolf Reber, Norbert Schwarz & Piotr Winkielman (2004): things that are **easier to process** (clearer contrast, symmetry, familiarity, prototypicality) feel more **beautiful, true and trustworthy**. Fluency explains why readable typography makes statements seem more credible, and why clean design raises perceived trust. The flip side: **disfluency** can slow people down usefully (a deliberately effortful confirmation) and can signal craft or exclusivity when chosen deliberately (luxury, art).
- **Mere exposure:** Zajonc (1968): repeated exposure increases liking, which is the mechanism behind brand consistency (`TD-06#6 · @growthforbreakfast · Dcg76NIqlE0`: consistency over time is the only mechanism) and behind the backlash when a familiar logo changes (the Gap 2010 logo lasted about a week).
- **Complexity and the inverted U:** Daniel Berlyne (1971): liking rises with complexity and novelty up to a point, then falls. Raymond Loewy's **MAYA** principle ("Most Advanced Yet Acceptable") is the designer's version. Optimal novelty depends on audience expertise, since experts prefer more complexity.
- **Form preferences with evidence behind them:**
  - **Curvature:** Moshe Bar & Maital Neta (2006) found people prefer curved objects over sharp-angled ones, possibly because sharp contours signal threat. Rounded corners feel friendlier, and sharp geometry feels precise or aggressive.
  - **Symmetry and balance** are processed fluently and generally liked.
  - **Baby schema** (Konrad Lorenz's *Kindchenschema*, 1943): big heads, big eyes, round forms trigger care and cuteness responses. It's the engine of mascots, character design and "cute" product forms (`TD-06#11 · @koystudio_ · DcOPvQtT_pX`: character systems in food brands).
  - **Faces** and eyes attract and hold attention (Part 1).
- **The aesthetic–usability effect** (Kurosu & Kashimura, 1995; Noam Tractinsky, 2000, replicated in Israel): attractive interfaces are *perceived* as more usable. Two consequences: beauty buys tolerance, and **usability tests on pretty prototypes can hide real problems**, because users blame themselves rather than the attractive interface.
- **Premium and quality perception:** perceived value comes from cues of **care and affordable restraint**: white space as "affordable waste" (`TD-06#30 · @craze_.marketing · DAkzEP1C-av`; `TD-05#12 · @reputeforge · C7du5bCy9c2`), clarity ("clarity always feels expensive", `TD-06#16 · @madani_branding · DKJhHBtzM8h`), material precision (`TD-12#9 · @fineasjackson · DXmKv7LmAea`: why $100 nail clippers cut differently), even pricing over charm pricing (`TD-06#31 · @therobbiemurray · C5bBRfiCLzM`; the charm-pricing left-digit effect is real in some contexts, and premium brands avoid it to avoid discount signals). **These cues are learned and cultural.** In lower-trust markets, density and guarantees signal reliability (`TD-13#28 · @anuragattri_ · DKBFOAFJG_n`).
- **Neuroaesthetics, cautiously:** Semir Zeki (*Inner Vision*, 1999) and Anjan Chatterjee (*The Aesthetic Brain*, 2014) study brain responses to beauty (e.g. medial orbitofrontal cortex activity for experienced beauty). It's interesting and **not yet a design tool**. Be sceptical of "neuro-design" claims that promise brain-scan-optimised layouts.

**Intuition anchors**
- You have 50 milliseconds to look like you belong and be clear. Distinctiveness comes after that, never instead of it.
- Beauty makes people forgive. Use that generosity to earn trust, not to hide problems.

**Mastery checks**
- Explain the 50 ms findings (Lindgaard; Tuch et al.) and what they imply for a novel landing page.
- Explain processing fluency and two opposite uses of it (fluency for trust, disfluency for care or friction).
- Explain Berlyne's inverted U and MAYA, with a product that hit the sweet spot.
- Explain why the aesthetic–usability effect is a risk in usability testing.

**Analysis**
- Run a 50 ms-style impression test cheaply: show 6 landing pages from one category (e.g. Indian fintech) for about 1 second each to five people (a Figma prototype with after-delay transitions *[Figma: Orange]*), and collect "trust" and "beauty" ratings from 1 to 7. Compare the results with visual complexity and prototypicality as you judge them, and write what surprised you.

**Taste**
- Aim for designs that feel effortless at first sight and reward a second look. First impressions come from fluency and familiarity, and lasting affection comes from the details people discover later.

---

## PART 6 — Decisions, Persuasion & Behaviour [Core → Deep]

- **Bounded rationality:** Herbert Simon: people make "good enough" choices under limited time, information and attention (satisficing, 01 Part 2). Amos Tversky & Daniel Kahneman's **heuristics and biases** programme (1974) catalogued the shortcuts: **availability** (judging frequency by ease of recall), **representativeness** (judging by resemblance), **anchoring** (the first number biases estimates).
- **Prospect theory** (Kahneman & Tversky, 1979): outcomes are judged as **gains or losses relative to a reference point**, and **losses loom larger than gains** (roughly twice as large in many studies). **Framing** (Tversky & Kahneman, 1981, the "Asian disease" problem): logically identical options described as gains or losses produce different choices. Interfaces constantly set reference points (the "was ₹999, now ₹499" anchor) and frames ("save ₹500" vs "don't lose ₹500").
- **Defaults are the most powerful design decision:** Eric Johnson & Daniel Goldstein (2003): organ-donor registration was dramatically higher in opt-out countries than in opt-in ones. Most people keep defaults because of effort, implied endorsement and loss aversion. **Every default you set is a choice made on behalf of millions.** Set them in the user's interest, and disclose them.
- **Choice architecture:** Richard Thaler & Cass Sunstein, *Nudge* (2008): the way options are presented influences choices, so there's no neutral design. Tools: defaults, ordering, salience, simplification, social norms, feedback and commitment devices. **Sludge** (Thaler, later Sunstein) is the reverse: friction added against the user's interest, like cancellation mazes.
- **Other well-supported effects**, with their honest status:
  - **Decoy (asymmetric dominance):** Huber, Payne & Puto (1982). Adding an inferior option shifts choice toward the option that dominates it. This is the logic of the highlighted middle pricing tier (`TD-13#30 · @itsdesignertom · DBO18isvjcb`).
  - **Social proof:** Robert Cialdini, *Influence* (1984). People follow others' behaviour under uncertainty. Reviews, "N people bought this", testimonials.
  - **Scarcity and urgency:** real scarcity informs, and fake scarcity manipulates (and is now illegal in India: false urgency is a specified dark pattern).
  - **Choice overload:** Iyengar & Lepper's jam study (2000) is famous, but a meta-analysis (Scheibehenne, Greifeneder & Todd, 2010) found the average effect near zero, with overload appearing under specific conditions (complex options, no clear preferences, time pressure). **Don't cite "too many choices paralyse" as a law.** Design for comparability instead.
  - **Goal gradient** and **endowed progress** (Kivetz et al., 2006; Nunes & Drèze, 2006): pre-filled progress increases completion (loyalty cards, profile completeness).
  - **Peak–end rule** (Kahneman et al., 1993): design the high point and the ending (02 Part 5).

  How big these effects are likely to be in a live product, which ones failed replication, and how to tell persuasion from manipulation are in Part 9.
- **Habit formation:** habits are cue → routine → reward loops that become automatic through repetition in stable contexts (Wendy Wood, *Good Habits, Bad Habits*, 2019). B.J. Fogg's **Behaviour Model** (B = MAP: behaviour happens when **Motivation**, **Ability** and a **Prompt** converge; *Tiny Habits*, 2019) is a practical design lens: **increase ability** (make it easier) before trying to increase motivation. Nir Eyal's *Hooked* model (trigger → action → variable reward → investment, 2014) describes engagement design, and its variable-reward logic (B.F. Skinner's variable-ratio schedules) is exactly what makes feeds compulsive. Use it knowingly or not at all. Retention through presence rather than interruption (`TD-01#31 · @chris.raroque · DZdIWw6ixWA`: iOS widgets as habit surfaces).
- **Dark patterns (deceptive design):** Harry Brignull coined the term in 2010 (deceptive.design). The main types are forced continuity, roach motel (easy in, hard out), confirmshaming, disguised ads, sneak into basket, bait and switch, nagging, false urgency, hidden costs and privacy zuckering. **India's CCPA Guidelines (2023)** specify 13: false urgency, basket sneaking, confirm shaming, forced action, subscription trap, interface interference, bait and switch, drip pricing, disguised advertisement, nagging, trick question, SaaS billing and rogue malware. The **EU DSA (2022, Art. 25)** prohibits deceptive interfaces on online platforms, and US FTC enforcement targets "negative option" traps. **For you this sits exactly where design meets law**, and it's a portfolio-grade and paper-grade niche (bridge to 27, 31, and your IPR/consumer-law work).

**Intuition anchors**
- There's no neutral interface. Order, defaults and emphasis always push. Decide where you're pushing and whether you'd say it out loud to the user.
- Make the right action easy before you try to make people want it. Ability beats motivation.

**Mastery checks**
- Explain prospect theory, loss aversion and framing with an interface example of each.
- Explain the Johnson & Goldstein default study and state a rule for setting defaults ethically.
- Explain the decoy effect and critique a three-tier pricing page with it.
- Summarise the choice-overload replication status accurately.
- Name the 13 dark patterns in India's CCPA Guidelines and give an Indian app example of any three.

**Analysis**
- Audit the checkout and cancellation flows of one Indian subscription service (an OTT platform, a food-delivery membership, a SaaS tool) against the CCPA's 13 patterns. Document each finding with screenshots, the pattern's legal definition and a compliant redesign *[Figma: Yellow]*. (This can become a short paper, since it sits exactly between your law and design work.)

**Taste**
- Use psychology to lower friction for what users want and never to raise it for what they don't. The line between persuasion and manipulation is whether the user would thank you or sue you once they understood what you did.

---

## PART 7 — Human Variation: Age, Neurodiversity, Culture & Situation [Core → Deep]

- **The average user doesn't exist.** Todd Rose's *The End of Average* (2016) retells the US Air Force's 1950 cockpit study: of 4,063 pilots measured on 10 dimensions, **none** was average on all ten. The fix was adjustability, not a better average. Design for **ranges and adjustability**: text size, density, motion, theme, input method.
- **Ageing:**
  - **Presbyopia** (difficulty focusing up close) from about 40, which means larger text and higher contrast.
  - **Reduced contrast sensitivity** and more glare sensitivity.
  - **Yellowing lens** that makes blues and greens harder to distinguish.
  - **Slower processing and reaction times.**
  - **Reduced working-memory capacity** on average.
  - **Less fine motor control**, so bigger targets and fewer precise gestures.

  India's population is ageing quickly and many first-time smartphone users are older adults, so **design for your parents, not your peers**.
- **Neurodiversity:**
  - **ADHD:** sensitivity to distraction, difficulty with long multi-step tasks. Helps: fewer interruptions, saved progress, clear next steps, reduced motion option.
  - **Autism:** sensitivity to sensory overload and unpredictability, literal reading of language. Helps: predictable layouts, plain language, no surprise sounds or motion, clear consequences.
  - **Dyslexia:** decoding effort. Helps: generous spacing, left-aligned text, short lines, clear sans or serif (not "dyslexia fonts", 04 Part 2), text-to-speech support.
  - **Vestibular disorders:** motion can trigger nausea, so **honour `prefers-reduced-motion`**.

  The W3C's **Cognitive Accessibility guidance** (*Making Content Usable for People with Cognitive and Learning Disabilities*, 2021) is the design-ready summary (bridge to 15).
- **Culture and perception:** Richard Nisbett's *The Geography of Thought* (2003) and Takahiko Masuda & Nisbett's aquarium study (2001) suggest East Asian participants attend more to context and relationships (holistic), and North American participants more to focal objects (analytic). The effects are real but modest, contested in magnitude, and **not a stereotype licence**. Practical implications: information density preferences, the role of context imagery, and trust cues all vary by market (`TD-13#28`, low- vs high-trust markets). **WEIRD samples** (Henrich, Heine & Norenzayan, 2010: Western, Educated, Industrialised, Rich, Democratic) dominate psychology, so be careful transferring findings to Indian users without checking (bridge to 28).
- **Expertise:** novices need guidance, recognition and forgiving errors. Experts need speed, density, shortcuts and power features (Part 3, chunking). Most products must serve both. The pattern is **progressive disclosure plus accelerators** (keyboard shortcuts, command palettes, saved views), as in Figma's own UI.
- **Situational and temporary impairment:** Microsoft's *Inclusive Design* toolkit (2016) frames disability as a mismatch between person and context, across **permanent** (one arm), **temporary** (an arm injury) and **situational** (holding a baby) conditions. Sunlight on a phone is situational low vision, a noisy bus is situational deafness, and stress is situational cognitive impairment. **Designing for the permanent case improves the situational case for everyone** (captions, large targets, voice input).
- **Stress and high-stakes contexts:** under stress, attention narrows (tunnel vision), working memory shrinks and people fall back on habits. Medical, emergency, financial-loss and legal interfaces must work for a panicking user: clear primary action, no ambiguity, undo, confirmation for irreversible actions, calm language.

**Intuition anchors**
- There's no average user, only ranges. Design the extremes and the middle takes care of itself.
- Everyone is situationally impaired sometimes. Accessibility is design for the worst five minutes of anyone's day.

**Mastery checks**
- Explain the Air Force cockpit story and its design lesson.
- List six age-related changes and a design response to each.
- Give design responses for ADHD, autism, dyslexia and vestibular sensitivity.
- Explain the permanent/temporary/situational framing with three examples.

**Analysis**
- Watch an older relative (60+) complete one task on a common app (UPI payment, booking a doctor's appointment, a video call). Don't help. Note every hesitation, mis-tap and misread. Classify each by mechanism (vision, motor, memory, mental model) and propose one fix per mechanism.

**Taste**
- Test your designs on people unlike you: older, tired, distracted, new. The interface that works for them works for everyone, and the one that works only for you is decoration.

---

## PART 8 — Evidence Literacy: Reading Research & Killing Myths [Core]

- **How to read a study in five minutes:**
  1. **Question:** what exactly was tested?
  2. **Participants:** how many, who (students? WEIRD? experts?).
  3. **Method:** lab or field? What task? How artificial?
  4. **Effect size:** not just "significant" (p < .05) but how big (Cohen's d, the percentage difference, the confidence interval).
  5. **Replication:** has it been independently repeated, and was it pre-registered?
  6. **Transfer:** does my design situation resemble the study's?

  A large, replicated effect in a similar context is strong evidence. A single small study of 40 students on a lab task is a hint.
- **The replication crisis in brief:** the Open Science Collaboration (2015) replicated about 36–39% of effects from top psychology journals. Social priming, ego depletion and power posing have weakened or collapsed under large replications. The robust findings tend to be perceptual (Gestalt, contrast, pop-out), cognitive (working-memory limits, spacing and testing effects, Fitts, Hick) and some decision effects (defaults, loss aversion in many contexts, anchoring). **Perception is safer ground than social psychology.**
- **Methods designers actually use:** **eye-tracking** (where people look, not what they understand, and costly to do properly), **5-second tests** (first impressions and recall), **first-click tests** (whether the first click is correct, which predicts task success), **A/B tests** (causal but narrow, needing traffic and good metrics, and they tell you *what* but not *why*), **usability testing** (think-aloud, qualitative, 5 users find many problems: Nielsen & Landauer, 1993), **surveys** (attitudes, not behaviour), **analytics and heatmaps** (behaviour at scale, no intent). Full craft in 24.
- **Neuromarketing hype:** EEG, fMRI and galvanic skin response studies of ads and interfaces exist, but consumer "neuro-design" claims (a "brain-optimised layout", "85% more emotional engagement") usually overreach small, noisy data. Ask for the study, the sample and the replication.
- **Myths to retire** (the start of your myths ledger):
  - "We use 10% of our brain." We use all of it.
  - "Left-brain logical, right-brain creative." Lateralisation exists for specific functions, not personality types.
  - **Learning styles** (visual/auditory/kinaesthetic matching): Pashler et al. (2008) found no evidence that matching instruction to styles helps.
  - "Humans have an 8-second attention span, less than a goldfish": traced to a misreported 2015 marketing brief with no real source.
  - "The brain processes images 60,000× faster than text" and "90% of information is visual": no traceable source.
  - "Colour X increases conversions by Y%": context-specific at best (03 Part 4).
  - "The magical number 7 ± 2 for menus" (02 Part 5).
  - "Three-click rule" (02 Part 5).
  - "Red makes people hungry" as a universal law.
- **Honest sources to prefer:** Nielsen Norman Group (research-backed articles, flagged as such in `TD-13#9 · @khushidotjpeg · DcYfbleIbP_`), Baymard Institute (large-scale e-commerce UX research), the *Annual Review of Psychology*, Jeff Johnson's *Designing with the Mind in Mind* (evidence-grounded), Colin Ware's *Visual Thinking for Design*, and primary papers via Google Scholar.

**Intuition anchors**
- A finding without an effect size and a replication is a rumour with a citation.
- Perception science is solid ground, and social-psychology folklore is sand. Build on the first and test the second.

**Mastery checks**
- Apply the six-question reading protocol to one study cited in this file.
- Explain what the replication crisis was and which categories of findings are most robust.
- Debunk five myths with sources.
- Explain what eye-tracking can and cannot tell you.

**Analysis**
- Pick one popular "UX psychology" carousel or reel from your catalogue or feed (e.g. `TD-01#3 · @daniel.margu · DczAv1ZM5NV` on Hick's law). Trace every claim to a primary source, classify each as solid, overstated or unsupported, and rewrite the post as an accurate version. This is also good content for your faceless channel.

**Taste**
- Be the designer in the room who asks "where's that from?", kindly and every time. Evidence literacy is rare in design, and it makes every other argument you make more persuasive.

---

## PART 9 — Behavioural Evidence in Products: Effect Sizes, Replication & Ethical Persuasion [Core → Deep]

- **Effects shrink between the journal and the product.** Stefano DellaVigna & Elizabeth Linos (*Econometrica*, 2022) compared over a hundred trials run by two US government "nudge units" with published academic nudge studies: about **8.7 percentage points** of lift in the journals, about **1.4** in the units' trials. Selective publication explains most of the gap. **So** expect a real lift of one or two points. "+30% conversions from one psychology trick" is a red flag, and your own A/B tests need enough traffic to detect small effects.
- **Replication status of the effects designers cite most** (as of 2026):

| Effect | Evidence status | What it means for a product |
|---|---|---|
| **Defaults** | Robust. A meta-analysis (Jachimowicz et al., 2019) found a medium average effect with wide variation, strongest where the default looks like a recommendation and switching costs effort | Treat every default as a decision you're accountable for |
| **Anchoring** | Replicated strongly in the Many Labs 1 project (Klein et al., 2014) | Reference prices and first numbers shape judgement, so never fake them |
| **Framing** | Replicates widely; the size of loss aversion is debated and smaller for low stakes | Test copy frames; don't assume "losses count double" |
| **Social proof** | Supported in many field studies with modest, variable effects; some famous demonstrations didn't replicate | Show real numbers from similar users; test it |
| **Ego depletion** ("willpower runs out") | A 23-lab registered replication (Hagger et al., 2016, about 2,100 participants) found an effect close to zero | Don't justify designs with "decision fatigue". Cut steps because steps cost time and errors |
| **Behavioural (social) priming** | Classic demonstrations failed direct replication (Doyen et al., 2012, on old-age words slowing walking); Kahneman warned in 2012 of a "train wreck looming" | Don't claim background words or images silently change purchases. *Semantic* priming (faster recognition of a related word) is robust and different |

- **Persuasion or manipulation: a four-question test.**
  1. **Publicity:** would it still work if you told the user exactly what it does? (*Nudge* borrows this test from John Rawls.) "We pre-selected monthly billing because most small firms prefer it" survives being said. A pre-ticked add-on that works only if nobody notices doesn't.
  2. **Alignment:** does it push toward what users would choose if fully informed, "as judged by themselves" (Thaler & Sunstein)?
  3. **Symmetry:** is the opposite choice as easy? Cancelling should take no more steps than subscribing.
  4. **Bypass:** does it give reasons, or exploit a limit (inattention, a false belief, time pressure)? Susser, Roessler & Nissenbaum (2019) define online manipulation as hidden influence that exploits vulnerabilities.

  A failure on any question means redesign. The levers that build good hierarchy (spacing, contrast, motion, pacing) also build dark patterns; intent is the difference (`TD-02#68 · @jerrythewebdev · DbqMxlNRRbe`).
- **What dark patterns do.** Arunesh Mathur and colleagues (2019) found them on roughly 11% of about 11,000 shopping sites. In an experiment, Jamie Luguri & Lior Strahilevitz (2021) found mild dark patterns more than doubled sign-ups to a dubious paid service and aggressive ones nearly quadrupled them. Mild patterns provoked little backlash. **Subtle manipulation works and users don't punish it**, so it takes design discipline and law (CCPA 2023), not market pressure, to stop it.
- **Worked decision: EcoTrace's trial-to-paid flow.**
  - **Options:** (A) card up front, auto-renewal, cancel by emailing support; (B) card up front, a reminder three days before the first charge, one-click cancel; (C) no card, and the trial ends in read-only mode with data kept.
  - **Criteria:** the CCPA's subscription-trap, SaaS-billing and drip-pricing patterns; SME owners' wariness of automatic debits; and paid accounts still active at 90 days, not trial starts, as the metric.
  - **Choice:** C for monthly plans, with B's reminder for annual renewals. A fails the symmetry test outright.
  - **Consequences:** fewer automatic conversions, but those who pay chose to, so refunds, chargebacks and angry tickets fall. Read-only mode is honest loss aversion: the user really would lose work by leaving.
- **Worked decision: urgency.** "Filing due in 12 days (SEBI timeline for your financial year)" is information. A countdown on a discount the business can renew at will is false urgency. **EcoTrace's rule: urgency only when tied to an external date the user can verify.**
- **Worked decision: endowed progress.** "Profile 30% complete" is fine when the 30% is data the user really entered. Counting "account created" as 40% is a small lie that costs trust in every other number.

**Intuition anchors**
- Expect small effects. If a psychology trick promises a big one, it's either unreplicated or it's manipulation.
- Persuasion survives being explained to the user. Manipulation only works while they don't know.

**Mastery checks**
- Give the evidence status of defaults, anchoring, choice overload, ego depletion and social priming, with one source each.
- State the four-question persuasion test and apply it to a pre-ticked checkbox and a cancellation flow.
- Summarise Luguri & Strahilevitz's finding and why it matters for regulation.

**Analysis**
- Take three screens from Indian apps that push a choice (a pricing page, a permission prompt, a cancellation flow). Run the four-question test, grade each effect against the replication table, and redesign the worst *[Figma: Yellow]* with a rationale: options, criteria, choice, expected effect size and how you'd measure it.

**Taste**
- Only persuade in ways you'd publish as a design rationale. Anything that would embarrass you in a case study belongs in your dark-pattern casebook.

---

## PART 10 — Trust, Error & Automation: How Users Behave in Real Products [Core → Deep]

- **Errors come in kinds, and each kind has its own fix.** James Reason (*Human Error*, 1990) and Don Norman separate:
  - **Slips:** the right intention, the wrong action (tapping the adjacent row, a mode error). **Fix with** spacing, constraints, clear modes and undo.
  - **Lapses:** memory failures (forgetting to attach the evidence file after an interruption). **Fix with** checklists, reminders, saved state and forcing functions.
  - **Mistakes:** a wrong intention from a wrong mental model (filing purchased electricity under Scope 1 because "we use it on site"). **Fix with** a better system image, examples and explanations at the point of decision (Part 3).

  Log errors by type in testing: bigger buttons can't fix a mistake, and help text can't fix a slip.
- **Worked decision: Meridian UI's destructive actions.** Confirmation dialogs habituate (Part 2: dialog blindness), so users press OK by reflex.
  - **Options:** (A) always confirm; (B) undo for reversible actions, a confirmation that needs a different action (typing the item's name, as GitHub does for repository deletion) for irreversible ones; (C) no protection.
  - **Choice:** B, encoded in the API: a `Dialog` with `intent="destructive"` requires a `confirmText` prop for irreversible actions, and reversible deletes ship an undo toast instead.
  - **Consequences:** fewer reflex confirmations and wrong deletions; the cost moves to engineering (soft deletes, a restore window), where it belongs.
- **Worked decision: where Meridian UI puts feedback.** Inattentional blindness (Part 2) predicts that a corner toast is missed by someone watching a form field. **Rule:** field errors go inline, with a summary on submit that moves focus to the first error; toasts are only for events away from the user's focus (an export finished), and a toast with an action must not vanish before the user can reach it (WCAG 2.2.1, timing).
- **Trust calibration and automation bias.** Raja Parasuraman & Victor Riley (1997) described **misuse** (over-reliance on automation) and **disuse** (rejecting it after errors). Parasuraman & Dietrich Manzey (2010) reviewed **automation bias**: people, trained professionals included, accept automated suggestions without checking. The goal is **calibrated trust**: users trust the system exactly as much as it deserves, field by field.
- **Worked decision: EcoTrace's AI-drafted BRSR answers** (13 Part 7).
  - **Options:** (A) auto-fill every field from uploaded bills with an "Accept all" button; (B) per-field suggestions showing source and a data-quality level, with bulk accept disabled for low-confidence fields; (C) no AI drafting.
  - **Choice:** B. A invites automation bias on a legal filing; C throws away real value for accountants with many clients.
  - **How to verify:** track the share of suggestions accepted unedited, then run a **planted-error test**: seed three wrong suggestions in a test account and count how many testers catch. Near-total acceptance plus missed planted errors means automation bias; the fix is friction on low-confidence fields, not better copy.
- **False precision changes trust.** Chris Janiszewski & Dan Uy (2008) found that precise anchors ("₹4,985") pull estimates more strongly than round ones ("₹5,000"), because precision reads as knowledge. "412.37 tCO₂e", computed from emission factors that are themselves estimates, claims certainty the data lacks. **EcoTrace's choice:** show meaningful precision ("≈ 410 tCO₂e"), a data-quality tag (measured, calculated, estimated) and a "View calculation" drill-down. Some users first read rounding as less rigorous, and the drill-down answers them.
- **Who actually uses a compliance product.** Mechanisms, not stereotypes:
  - **Proxy users:** SME owners often delegate to an accountant handling many clients: a domain expert, a product novice, constantly switching. **Design for resumption** (Part 3) and make the current client unmistakable, since filing into the wrong client's account is a mode error with legal consequences.
  - **Mixed vocabulary:** the accountant knows "Scope 2"; the plant supervisor uploading bills doesn't. Keep the regulatory term with a plain gloss (17 Part 5).
  - **Satisficing under deadlines** (01 Part 2): near a filing date users take the first plausible answer, so defaults and examples matter most, and misleading ones do most harm.
  - **Designers aren't the users** (`TD-01#22 · @ayzz.thedesigner · DcWBFMkiBgx`): test with the accountant on a laptop at month-end.

**Intuition anchors**
- Name the error type before you fix it: slips need guards, lapses need reminders, mistakes need a better model.
- Aim for calibrated trust: a product nobody questions is as broken as one nobody believes.

**Mastery checks**
- Distinguish slips, lapses and mistakes with a compliance-product example and fix for each.
- Explain why undo usually beats confirmation, and when a typed confirmation is justified.
- Explain automation bias and describe a planted-error test.
- Explain the precision effect and how EcoTrace should display estimated emissions.

**Analysis**
- Watch an accountant or finance student do a three-step data-entry task in a real product (Tally, Zoho Books, the GST portal), interrupted halfway. Log every error by type, mechanism and fix. Then design EcoTrace's client switcher and "resume where you left off" state so the two worst errors can't recur *[Figma: Blue]*.

**Taste**
- Design for the user at month-end: interrupted, rushed, handling someone else's account. A product that stays correct in their hands has earned the trust it asks for.

---

## PART 11 — History & Masters of Perception and Cognition for Design [Deep]

- **Founding figures:**
  - **Hermann von Helmholtz:** unconscious inference, colour vision, 1850s–60s.
  - **Wilhelm Wundt:** the first psychology lab, Leipzig, 1879.
  - **Gestalt psychologists:** Wertheimer, Koffka, Köhler, 1910s–30s.
  - **J.J. Gibson:** *The Ecological Approach to Visual Perception*, 1979. Direct perception and affordances, the concept Norman adapted.
  - **Donald Broadbent:** attention as a filter, 1958.
  - **George Miller:** the magical number, 1956, and co-founder of the cognitive revolution.
  - **Ulric Neisser:** *Cognitive Psychology*, 1967, named the field.
  - **David Marr:** *Vision*, 1982. Three levels of analysis (computational, algorithmic, implementational), a thinking tool for any design problem.
- **HCI and design translation:** Stuart Card, Thomas Moran & Allen Newell, *The Psychology of Human-Computer Interaction* (1983), gave engineering models of users (GOMS, the Keystroke-Level Model). **Don Norman** (*DOET*, 1988; *Emotional Design*, 2004). **Ben Shneiderman** (direct manipulation, 1983; the "eight golden rules"). **Jakob Nielsen** (heuristics, discount usability). **Colin Ware** (*Information Visualization: Perception for Design*, 4th ed. 2020). **Jeff Johnson** (*Designing with the Mind in Mind*, 3rd ed. 2020). **Susan Weinschenk** (*100 Things Every Designer Needs to Know About People*, popular and uneven, so check its claims).
- **Behavioural economics:** Kahneman & Tversky (the Nobel went to Kahneman in 2002, Tversky having died in 1996), Richard Thaler (Nobel 2017), Cass Sunstein, Dan Ariely (*Predictably Irrational*, 2008; note that some of his research has since faced serious data-integrity questions, a lesson in source scrutiny in itself).
- **Error, automation and evidence reform:** **James Reason** (*Human Error*, 1990: slips, lapses, mistakes, the "Swiss cheese" model of layered defences). **Raja Parasuraman** (automation misuse, disuse and bias). **Brian Nosek** (Center for Open Science, which coordinated the 2015 reproducibility project). **Harry Brignull** and **Arunesh Mathur** (naming and measuring dark patterns).
- **What the masters understood:** Gibson that perception is for *action* in an environment; Marr that you must specify *what problem* a system solves before *how*; Norman that the user's model is built only from the system image; Kahneman that intuition is fast, confident and often wrong in predictable ways; Simon that people satisfice; Reason that errors are predictable by type and are stopped by layers, not by blaming the person. **Each is a design principle in disguise.**

**Intuition anchors**
- The cognitive revolution and the design of interactive computers grew up together. HCI was born as applied psychology, and the best designers still treat it that way.

**Mastery checks**
- Name ten figures and one idea each that changed design practice.
- Explain Marr's three levels and apply them to a login flow.

**Analysis**
- Read Norman's *DOET* chapter 2 and Gibson's affordance chapter (ch. 8 of *The Ecological Approach*). Write one page on how Norman's use of "affordance" differs from Gibson's, and why Norman later introduced "signifier".

**Taste**
- Read the originals once in your life. The paraphrases lose the nuance that makes the ideas usable.

---

## PART 12 — Connections & Taste Development [Lifelong]

- **What good science-literate design looks like:** it works for the fovea, attention and working memory it will meet; feedback sits at the locus of attention; changes are animated where they must be noticed; waits are occupied and explained; defaults serve the user; salience is rationed; it's tested with people unlike the designer; claims in the rationale cite real evidence with honest confidence; and it's free of dark patterns by design, not by legal review.
- **Voices and sources worth internalising:**
  - **Jeff Johnson**, *Designing with the Mind in Mind*: the best single bridge from cognitive science to UI.
  - **Colin Ware**, *Visual Thinking for Design*: perception for designers.
  - **Don Norman**, *DOET* and *Emotional Design*.
  - **Daniel Kahneman**, *Thinking, Fast and Slow*: read critically, since some chapters rely on priming studies that failed replication.
  - **Margaret Livingstone**, *Vision and Art*.
  - **Stanislas Dehaene**, *Reading in the Brain*.
  - **Harry Brignull**, *Deceptive Patterns* (2023).
  - **B.J. Fogg**, *Tiny Habits*.
  - **Wendy Wood**, *Good Habits, Bad Habits*.
- **Deliberate taste exercises:**
  1. **Myths ledger:** one entry a week.
  2. **Effect of the week:** read one primary paper and write its design rule and failure mode.
  3. **Illusion lab:** rebuild one perceptual illusion a week in Figma.
  4. **Dark-pattern spotting:** one per week in apps you use, with the CCPA category named.
  5. **Watch-don't-help sessions:** one monthly usability observation of someone unlike you.
- **Anti-taste:** "users are stupid", neuro-hype claims, 7±2 menus, goldfish attention spans, learning-styles personas, salience everywhere, silent waits, change without animation, feedback far from the action, defaults that serve the business at the user's cost, fake urgency, confirmshaming, testing only with designers, and citing a reel as evidence.
- **Connections:**
  - **→ 02:** mechanisms for the principles.
  - **→ 03:** the colour pathway.
  - **→ 04:** reading science.
  - **→ 05:** eye movement and faces.
  - **→ 13:** mental models, load, feedback.
  - **→ 15:** perceptual and cognitive accessibility.
  - **→ 17:** reading behaviour, plain language.
  - **→ 18:** perceptual timing.
  - **→ 20:** auditory perception.
  - **→ 22:** pre-attentive encoding.
  - **→ 24:** research methods.
  - **→ 27:** behaviour design.
  - **→ 31:** the ethics of influence.
  - **Cross-pollination:** your own learning systems (the same memory science drives your Anki and spaced schedules), chess (chunking, pattern recognition, expert intuition), law (consumer protection, dark-pattern regulation, the reasonable-person standard as a model of bounded rationality), music (auditory streaming, expectation and surprise in raga development).

**Intuition anchors**
- Mechanism first, rule second, test third. A rule you can't trace to a mechanism can't be adapted when the situation changes.

**Mastery checks**
- For five other modules, name the mechanism from this file each depends on most, and the failure that ignoring it causes.

**Analysis**
- Write EcoTrace's "psychology of the product" page: ten mechanisms from Parts 1–10, each with source, evidence strength, the decision it drove and the metric that checks it. Revise it after the next usability test.

**Taste**
- Let the science make you humbler, not more certain. "This should work, and here's how we'll know" beats quoting a law.

---

## Resource Library

**Primary:** Wertheimer (1912, 1923) · Hubel & Wiesel (1962) · Miller (1956) and Cowan (2001) · Treisman & Gelade (1980) · Simons & Chabris (1999) · Rensink, O'Regan & Clark (1997) · Kahneman & Tversky (1979) · Johnson & Goldstein (2003) · Lindgaard et al. (2006) · Tuch et al. (2012) · Reber, Schwarz & Winkielman (2004) · Scheibehenne et al. (2010) · Open Science Collaboration (2015) · Pashler et al. (2008) · Hagger et al. (2016) · Jachimowicz et al. (2019) · DellaVigna & Linos (2022) · Mathur et al. (2019) · Luguri & Strahilevitz (2021) · Parasuraman & Manzey (2010) · Janiszewski & Uy (2008) · W3C *Making Content Usable for People with Cognitive and Learning Disabilities* (2021) · India CCPA *Guidelines for Prevention and Regulation of Dark Patterns, 2023* · EU Digital Services Act, Art. 25.

**Books:**
- **Jeff Johnson**, *Designing with the Mind in Mind* (3rd ed.): the spine of this module.
- **Colin Ware**, *Visual Thinking for Design*: perception mechanics for designers.
- **Don Norman**, *The Design of Everyday Things* and *Emotional Design*.
- **Daniel Kahneman**, *Thinking, Fast and Slow*: essential, read with replication awareness.
- **Richard Thaler & Cass Sunstein**, *Nudge: The Final Edition* (2021).
- **Harry Brignull**, *Deceptive Patterns* (2023): the definitive dark-patterns book.
- **Margaret Livingstone**, *Vision and Art*.
- **Stanislas Dehaene**, *Reading in the Brain*.
- **Todd Rose**, *The End of Average*.
- **Richard Mayer**, *Multimedia Learning* (3rd ed.): load and learning in design.
- **James Reason**, *Human Error*: the error taxonomy behind Part 10.

**Courses & labs:** NN/g articles on attention, memory and cognitive load (free) · Coursera Plus: Yale's *The Science of Well-Being* (behaviour change, habits) and introductory psychology courses from major universities (e.g. *Introduction to Psychology*, Yale) · Michael Bach's *Optical Illusions & Visual Phenomena* (michaelbach.de, free interactive illusions) · deceptive.design (the pattern library and hall of shame).

**Reading (work):** Google Material's motion and elevation rationale (perception applied) · Apple HIG *Accessibility* and *Motion* · Baymard Institute's checkout research · Gov.UK's service manual (cognitive load in public services) · the Tatkal booking flow on IRCTC (a real-world stress-interface case).

**From your catalogue:** `TD-01#3`, `#7`, `#8`, `#11`, `#12`, `#18`, `#19`, `#21`, `#22`, `#24`, `#25`, `#31` (perception, effort and behaviour in UI) · `TD-02#68` (attention levers and the manipulation line) · `TD-04#17`, `#29` (colour perception) · `TD-05#10` (figure–ground as attention) · `TD-06#6`, `#16`, `#30`, `#31` (exposure, premium perception, pricing signals) · `TD-12#9` (quality perception) · `TD-13#28` (trust and culture).

**Practice:** `T8-design-06-neuroscience-psychology.md`: illusion labs, attention trials, load audits, loading-state builds, dark-pattern audits, myth-busting.

## Suggested Learning Order

1. Part 0 (the predictive mind) + Johnson ch. 1–2 · ~5 h
2. Part 1 (the visual system) + Livingstone ch. 1–4 + illusion demos · ~8 h
3. Part 2 (attention) + the gorilla and flicker demos · ~6 h
4. Part 3 (memory and load) + Johnson ch. 7–10 · ~8 h
5. Part 4 (time and motion), in parallel with Figma Blue belt · ~5 h
6. Part 5 (emotion and aesthetics) + Norman *Emotional Design* · ~6 h
7. Part 6 (decisions and behaviour) + *Nudge* + Brignull · ~10 h
8. Part 7 (human variation) + W3C COGA guidance · ~5 h
9. Part 8 (evidence literacy), then start the myths ledger · ~4 h
10. Part 9 (effect sizes, replication, ethical persuasion) + Luguri & Strahilevitz + one CCPA audit · ~5 h
11. Part 10 (trust, error, automation) + Reason ch. 1–3 + a watch-don't-help session with an accountant · ~5 h
12. Parts 11–12 (history, connections, taste) · ~4 h

Total first pass ≈ 70 hours alongside the T8 file.
