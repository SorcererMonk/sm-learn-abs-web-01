# Motion Design (UI-Focused) → Movement That Explains
## L8: Design: 18 · Why Interfaces Move · Principles · Timing, Easing & Springs · Choreography & Transitions · Micro-interactions & Feedback · Accessibility & Performance · Motion Systems · Implementation Landscape · Gestures · Data, Text & AI Motion · India · Critique & QA · Masters

> This is the **learning** file for motion in interfaces: why products move at all, the principles (from Disney's animators to UI-specific ones) that make movement read as natural, how timing, easing and spring physics work, how transitions are choreographed so screens feel like one continuous space, how micro-interactions give feedback and personality, how to keep motion accessible and fast, how motion becomes a tokenised system, and how designs reach code. It deliberately stops where neighbours take over: storytelling motion, title sequences, character animation and the full production pipeline are `L8-design-19-motion-full-pipeline.md`; sound and haptics paired with motion are `L8-design-20-sound-audio-ux.md`; 3D is `L8-design-21-3d-design.md`; tools are `L8-design-34-figma.md` (Figma Motion), `L8-design-38-after-effects.md` and `L8-design-43-lottie-rive.md`. The training counterpart is `T8-design-18-motion-ui.md`.
>
> **Context stamp (September 2026):** UI motion now has a native home in the design tool: **Figma Motion** (open beta since **24 June 2026**) adds a timeline, keyframes, easing and spring curves, **motion variables**, animated components, and Dev Mode handoff as **CSS, React (motion.dev) or JSON**, with exports to MP4, GIF, WebM and SVG. Platforms have moved towards **physics**: Apple's SwiftUI springs (`.spring(duration:bounce:)` since iOS 17) and Liquid Glass's morphing controls, and Google's **Material 3 Expressive** (May 2025) with spring-based motion. On the web, **scroll-driven animations** and **view transitions** are Interop 2026 focus areas, CSS `linear()` makes springs and bounces possible without JavaScript, **GSAP became completely free** (all plugins, commercial use included) under Webflow in 2025, and Framer Motion became the independent **Motion** library (motion.dev, November 2024). The craft hasn't changed: the numbers that feel instant are still **100–300 ms** (`TD-01#21 · @aleksandra.uxui · DceGjM0iMwy`), and **animation is a spotlight: if everything is lit, nothing is** (`TD-02#46 · @alchmy.studio · DQmvgkoldKK`).

---

## How To Use This Document

**Depth ladder:** **L1** Name it · **L2** Use it correctly · **L3** Choose the right duration, curve and pattern over alternatives · **L4** Explain the mechanism (why ease-out feels responsive, why springs feel physical, why transform is cheap) · **L5** Design a complete motion system and hand it off · **L6** Teach it and critique others' motion.

**Tier tags:** **[Core]** every designer · **[Deep]** senior depth · **[Frontier]** specialist or still moving · **[Lifelong]** never finished.

**Each Part closes with:** *Intuition anchors* · *Mastery checks* · *Analysis* · *Taste*.

**The motion-specific learning loop:**
1. **Slow it down.** Record your screen and scrub interactions frame by frame (or turn on "slow animations" in iOS/Android developer settings). You can't learn timing at full speed.
2. **Name what each motion is for.** Orientation, feedback, continuity, attention or personality. If you can't name it, remove it.
3. **Design the curve, not just the duration.** The same 250 ms feels sluggish or snappy depending on the easing.
4. **Prototype in the medium it will ship in.** Figma Motion for exploration, then CSS or your React stack, because motion that can't be built is a mood board.
5. **Test with reduced motion on and on a budget phone.** Motion that fails either isn't finished.
6. **Rebuild admired interactions.** Copy one micro-interaction a week from an app you love, then deviate.

**Relationship to the other files:**
- `L8-design-06` Part 4: time, motion and performance perception, the psychology under this file.
- `L8-design-13` Part 4: states and feedback, which motion animates.
- `L8-design-14` Part 2: motion tokens in the design system.
- `L8-design-15` Part 2: vestibular disorders, flashing and reduced motion.

---

## PART 0 — Foundations: Why Interfaces Move [Core]

- **Motion is information.** In an interface, movement answers questions a static screen can't:
  - **Orientation:** where did this come from and where did it go? A sheet sliding up from the bottom tells you it's temporary and can be dismissed downward.
  - **Feedback:** did my action register? A button that depresses, a toggle that slides, a heart that pops.
  - **Continuity:** these two screens are related. A card that expands into a detail page keeps your eye on the thing you chose.
  - **Attention:** look here. A subtle pulse on a new message, a shake on a wrong PIN.
  - **Personality:** this product has a character. The weight of a bounce or the calm of a fade says something about the brand (10 Part 4).
- **Motion is also a cost.** It takes time (every 300 ms transition is 300 ms of waiting), attention, battery, frames on slow devices and, for some people, physical comfort. Good motion design is mostly **deciding what not to animate**.
- **Restraint is the recurring lesson.** A whole site with two animations can be exactly right, and heavy motion reads as compensation (`TD-02#46`). A small, consistent motion vocabulary reads as polish (`TD-02#42 · @josh_yolkk · DUI1tZcCZto`).
- **Motion design vs animation:** "animation" makes clients think of cartoons; **motion design** is the discipline of designed movement for products, brands and interfaces. The label decides the brief you get (`TD-08#9 · @mikevdvisuals · DcN7g4FtVGg`). UI motion is the most functional corner of motion design: it serves tasks first.
- **Perception basics** (06 Part 4): below ~100 ms, a response feels instantaneous; people perceive smooth motion from about 24 frames per second, but interfaces need **60 fps** (and 120 fps on ProMotion and high-refresh Android screens) to feel fluid; a single dropped frame during a scroll is noticeable. Motion also shapes perceived speed: an immediate acknowledgement plus a short transition feels faster than a long wait with nothing happening (`TD-01#18 · @designwithrajatpatel · DcgYR03KCB2`).

**Intuition anchors**
- Every animation should answer a question the user would otherwise have.
- The best UI motion is felt more than noticed.
- If removing an animation loses no information, it was decoration. Keep it only if it's cheap and on-brand.

**Mastery checks**
- Name the five jobs of UI motion with an example of each.
- Explain the costs of motion (time, attention, performance, comfort).
- Explain frame rates and why 60/120 fps matters for interfaces.

**Analysis**
- Screen-record five minutes of using three apps (e.g. iOS Settings, a banking app, Instagram). Slow the recordings down and label every motion by its job. Which motions have no job?

**Taste**
- Motion is where interfaces reveal whether they were designed or assembled. Calm, purposeful movement is a sign of a team that cared.

---

## PART 1 — Principles: From Disney's Animators to UI [Core]

- **The 12 principles of animation** (Frank Thomas & Ollie Johnston, *The Illusion of Life: Disney Animation*, 1981), and what each means in UI:
  1. **Squash and stretch:** objects deform to show weight and flexibility. In UI: a subtle scale on press, a pill that stretches as it moves. Use sparingly.
  2. **Anticipation:** a small movement before the main action. In UI: a button that dips before launching a sheet; a pull-to-refresh that resists before it triggers.
  3. **Staging:** present an idea clearly, one thing at a time. In UI: animate the most important change first; don't animate five things at once.
  4. **Straight-ahead vs pose-to-pose:** frame by frame vs keyframes and in-betweens. UI is almost always pose-to-pose (start state, end state, a curve between).
  5. **Follow-through and overlapping action:** parts of an object settle at different times. In UI: a card lands, then its content settles a few frames later; springs with slight overshoot.
  6. **Slow in and slow out:** acceleration and deceleration, the origin of **easing** (Part 2).
  7. **Arcs:** natural motion follows curved paths. In UI: elements moving diagonally across the screen often look better on a slight arc (a FAB expanding into a sheet).
  8. **Secondary action:** a supporting motion that adds life. In UI: an icon that rotates as a menu opens.
  9. **Timing:** the number of frames decides weight and mood. In UI: duration tokens (Part 2).
  10. **Exaggeration:** push motion beyond realism for clarity. In UI: a wrong-PIN shake that's more pronounced than physics would suggest.
  11. **Solid drawing:** form and volume. In UI: consistent light, depth and elevation during transitions.
  12. **Appeal:** charisma. In UI: brand personality in motion.
- **UI-specific principles** (Issara Willenskomer, *UX in Motion*, 2017, the most useful UI adaptation): **easing**, **offset and delay** (staggered elements imply hierarchy), **parenting** (child elements move with their parent), **transformation** (one element morphs into another: a button into a progress ring), **value change** (numbers counting to show change), **masking** (revealing content through a changing mask), **overlay** (layers sliding over one another), **cloning** (new elements emerging from existing ones), **obscuration** (blur or dim to show what's behind), **parallax** (different speeds for depth), **dimensionality** (3D flips and folds), and **dolly and zoom** (moving the camera into content).
- **Platform principles:**
  - **Material motion:** motion is **informative, focused and expressive**; transitions follow patterns (container transform, shared axis, fade through, fade), and M3 Expressive adds **spring physics** and shape morphing.
  - **Apple HIG and "Designing Fluid Interfaces"** (WWDC 2018): motion should be **interruptible and redirectable**, respond to the user's gesture velocity, and behave like objects with momentum. Liquid Glass extends this: controls morph fluidly between states and shapes.
  - **IBM Carbon** distinguishes **productive motion** (efficient, subtle, for task-focused moments) from **expressive motion** (more visible, for significant moments), a useful pair for any system.

**Intuition anchors**
- UI motion borrows Disney's physics, not Disney's theatre.
- Offset and delay create hierarchy in time the way size creates hierarchy in space.
- If a user can't interrupt your animation, it's a video, not an interface.

**Mastery checks**
- Map each of the 12 principles to a UI example.
- Name ten of Willenskomer's UI principles with an example each.
- Explain productive vs expressive motion and when each applies.
- Explain why interruptibility matters and what "gesture velocity" means for a transition.

**Analysis**
- Find one app interaction that uses at least four of the 12 principles. Slow it down and annotate each principle with timestamps.

**Taste**
- The best UI motion uses animation principles invisibly. Nobody should think "cartoon", only "that felt right".

---

## PART 2 — Timing, Easing & Springs [Core → Deep]

- **Duration ranges** (guides, not laws):
  - **Micro-feedback** (button press, toggle, checkbox): **~100–150 ms**.
  - **Small component transitions** (tooltip, dropdown, chip, fade): **~150–250 ms**.
  - **Larger transitions** (sheets, dialogs, page transitions, container transforms): **~250–400 ms**; up to ~500 ms for full-screen, complex choreography.
  - **Beyond ~500 ms** feels slow for anything the user triggered repeatedly. Reserve longer durations for rare, significant moments (onboarding, celebration) or ambient motion.
  - The widely quoted **100–300 ms** window (`TD-01#21`) covers most UI transitions.
- **Rules that adjust duration:**
  - **Distance and size:** bigger movements need a little more time; a sheet crossing the whole screen takes longer than a chip changing colour.
  - **Device:** larger screens (tablets, desktop) often use slightly longer durations; wearables shorter.
  - **Exits are faster than entrances:** users already know where something is going. A common ratio is exit ≈ 70–80% of entrance.
  - **Frequency:** the more often a motion happens, the shorter and subtler it should be.
- **Easing curves** (the shape of acceleration):
  - **Ease-out (decelerate):** starts fast, ends slow. For **entering** elements and responses to user input: it feels immediate and settles gently. The default for most UI.
  - **Ease-in (accelerate):** starts slow, ends fast. For **exiting** elements leaving the screen.
  - **Ease-in-out (standard):** slow, fast, slow. For elements **moving from one on-screen position to another**.
  - **Linear:** constant speed. For continuous, mechanical motion (spinners, progress, marquee text, colour cycling). Linear on anything that starts and stops looks robotic.
  - **Cubic Bézier:** CSS and design tools describe custom curves as `cubic-bezier(x1, y1, x2, y2)`. Material's **emphasized** and **standard** curves and Apple's system curves are all cubic Béziers or springs. Learn to read the curve graph: steep at the start = fast start.
  - **The easing is what connects frames into one motion.** In a Smart Animate card carousel, the final ease-out is what makes four offsets read as one continuous movement (`TD-08#12 · @thedesignely · DUlQR18jZW3`).
- **Springs** (physics-based motion):
  - Defined by **stiffness** (how strongly it pulls towards the target), **damping** (how quickly oscillation dies) and **mass** (inertia). Designer-friendly parameterisations use **duration (response)** and **bounce (damping ratio)**: Apple's SwiftUI `.spring(duration: 0.4, bounce: 0.2)`.
  - **Why springs:** they have no fixed end time, so they can be **interrupted and redirected** smoothly (a sheet dragged halfway, then flicked, continues from the current velocity). They feel physical. Apple (SwiftUI), Material 3 Expressive and Motion (motion.dev) all default to or strongly support springs.
  - **Bounce is personality.** Zero bounce (critically damped) is calm and professional; a little bounce (0.1–0.3) is friendly; a lot is playful and gets tiring fast.
  - On the web, CSS **`linear()`** can approximate spring and bounce curves as a list of points, and libraries (Motion, GSAP, React Spring) run true springs in JavaScript.
- **A curve reference you can type from memory** (values as published; check the current docs before hard-coding):

| Curve | `cubic-bezier` | Use |
|---|---|---|
| CSS `ease` (browser default) | `0.25, 0.1, 0.25, 1` | Rarely right on purpose; the sign that nobody chose a curve |
| CSS `ease-out` | `0, 0, 0.58, 1` | A soft deceleration; weaker than most design-system curves |
| CSS `ease-in` | `0.42, 0, 1, 1` | Exits |
| CSS `ease-in-out` | `0.42, 0, 0.58, 1` | On-screen moves |
| Material 3 **standard** | `0.2, 0, 0, 1` | Most on-screen transitions |
| M3 **standard decelerate** / **accelerate** | `0, 0, 0, 1` / `0.3, 0, 1, 1` | Entering / exiting, utility-scale |
| M3 **emphasized decelerate** | `0.05, 0.7, 0.1, 1` | Entering elements in expressive moments |
| M3 **emphasized accelerate** | `0.3, 0, 0.8, 0.15` | Exiting elements in expressive moments |

  Material 3's duration tokens run in 50 ms steps from **short1 (50 ms)** to **long4 (600 ms)**, with extra-long values up to 1000 ms for rare, large motions: a ready-made scale to compare yours against. Notice how much sharper the M3 curves are than the CSS keywords: the first control point near `x = 0` with a high `y` makes the element cover most of its distance in the first third of the duration, which is why these curves feel responsive even at 300 ms.
- **Spring maths in one paragraph** (Apple's WWDC 2023 talk "Animate with springs" explains it well): a spring's force pulls the object towards its target in proportion to distance (**stiffness** `k`) and resists motion in proportion to speed (**damping** `c`), acting on a **mass** `m`. The **damping ratio** `ζ = c / (2√(k·m))` decides character: `ζ = 1` is critically damped (arrives fastest with no overshoot), `ζ < 1` overshoots and oscillates, `ζ > 1` creeps in slowly. SwiftUI's designer-friendly `bounce` is effectively `1 − ζ` (0 = no bounce), and its `duration` is a *perceptual* duration from which stiffness is derived (for mass 1, `k = (2π / duration)²`). Libraries name the same three numbers differently (Motion: `stiffness`, `damping`, `mass`, or `visualDuration` and `bounce`), so translate through the damping ratio when you move a spring between tools.
- **Stagger:** delaying each item in a group by 20–50 ms creates flow and hierarchy (a list animating in top to bottom). Cap total stagger time so long lists don't take seconds: stagger the first few items, then show the rest together.
- **Time is relative to the whole sequence:** motion systems often define a small set of durations (e.g. 100, 150, 250, 400 ms) and curves (standard, emphasised, decelerate, accelerate, plus 2–3 springs) and use only those (Part 6).

**Intuition anchors**
- Enter with ease-out, leave with ease-in, move with ease-in-out, spin with linear.
- If it feels slow, try a sharper curve before you shorten the duration.
- Springs are for things the user touches. Curves are fine for things that just happen.

**Mastery checks**
- Give duration ranges for four classes of UI motion and the rules that adjust them.
- Explain ease-out, ease-in, ease-in-out and linear and when each is right.
- Read a cubic-bezier value and sketch its curve.
- Explain stiffness, damping and mass, and the duration/bounce parameterisation.
- Explain why springs are interruptible and fixed-duration tweens aren't.

**Analysis**
- Build the same sheet transition five times in Figma Motion (linear, ease-in, ease-out, ease-in-out, spring with bounce 0.2) at 300 ms. Show them to three people and ask which feels "fastest" and which "most natural". Compare with your predictions.
- Measure five system transitions on your phone by recording at 60 fps and counting frames. How close are they to the ranges above?

**Taste**
- Great timing feels inevitable. You notice bad timing immediately and good timing never, which is exactly the point.

---
## PART 3 — Choreography & Transitions: One Continuous Space [Core → Deep]

- **Choreography** is the arrangement of multiple motions over time: what moves first, what follows, what stays still. Without it, simultaneous animations compete and the eye doesn't know where to look.
  - **Lead with the primary element** (the thing the user touched or chose), then bring in supporting elements with offsets.
  - **Keep one focal motion at a time.** Background and secondary changes are quieter (fades rather than moves).
  - **Everything shares a spatial model.** If the detail screen comes from the right, the back gesture returns to the right. If sheets come from the bottom, they leave downwards. Inconsistent directions break people's mental map of the app.
- **Transition patterns** (Material's names are the clearest vocabulary):
  - **Container transform:** a card, list item or button expands into the screen it opens, and shrinks back. Maximum continuity for "open this item" flows (e-commerce product cards, email threads).
  - **Shared axis:** screens move together along x, y or z to show a navigational relationship (steps in onboarding: x-axis; parent to child: z-axis scale-and-fade).
  - **Fade through:** the old screen fades out, the new one fades and scales in. For moving between unrelated destinations (tab bar switches).
  - **Fade:** for elements entering or leaving within the screen bounds (dialogs, menus, snackbars).
  - **Push and modal (iOS):** hierarchical navigation slides in from the right with a parallax of the previous screen; modals rise from the bottom as sheets.
- **Shared-element transitions:** an element that exists on both screens (an avatar, a product image, a title) moves and resizes between its positions, while everything else transitions around it. In Figma, **Smart Animate** matches layers **by name** (34 Part 3); on the web, **view transitions** do this natively by giving elements a `view-transition-name`; in native apps, SwiftUI's `matchedGeometryEffect` and Compose's shared-element APIs.
- **Page transitions on the web:** transitions between pages (not just effects within a page) are what make a site feel like one continuous object rather than a stack of documents (`TD-02#32 · @design4me__ · DW6NzC-iFYz`). Cross-document view transitions now make this possible without a single-page app.
- **Scroll as a timeline:** scroll-linked motion (progress indicators, reveals, parallax, pinned sections, scroll-scrubbed video) turns reading into playback (16 Part 5). Keep it **reversible** (scrolling back undoes it), **never block scrolling** (no scroll-jacking), and give reduced-motion users a static version.
- **Loading choreography:** skeletons that match the content's shape (`TD-01#11 · @synsation_ · DZIHbbIt5mc`), content that fades in as it arrives rather than popping, and **no layout shift** when real content replaces placeholders (16 Part 6).

**Intuition anchors**
- In a good transition, the user's eye never has to search for where things went.
- Direction is meaning. Keep it consistent across the product.
- A transition that doesn't reverse cleanly on "back" is only half designed.

**Mastery checks**
- Explain container transform, shared axis, fade through and fade, and choose one for five navigation cases.
- Explain how Smart Animate, view transitions and native shared-element APIs match elements.
- Design a spatial model (directions and layers) for a four-tab app with detail screens and sheets.

**Analysis**
- Map the spatial model of one app you use: sketch where every screen "lives" (left, right, above, below, in front). Find one transition that breaks the model.
- Prototype a card-to-detail container transform in Figma Motion (or Smart Animate) and then with the View Transitions API in your Next.js stack. Compare smoothness and effort.

**Taste**
- The most admired apps feel like physical spaces you move through, not slides you flip between.

---

## PART 4 — Micro-interactions & Feedback [Core]

- **Micro-interactions** (Dan Saffer's model: **trigger → rules → feedback → loops and modes**, 13 Part 4) are where motion does most of its everyday work:
  - **Press states:** a scale-down of 2–4% or a darkening on press, released on lift. Immediate (< 100 ms).
  - **Toggles and checkboxes:** the thumb slides, the check draws itself; a small spring for personality.
  - **Likes, saves and reactions:** a pop with slight overshoot, maybe particles for special moments. Keep it under ~500 ms and don't block further taps.
  - **Pull to refresh:** resistance (anticipation), a threshold, a spinner, content settling in.
  - **Form feedback:** a field border animating to the error colour with a gentle shake for rejected input (paired with text, never motion alone, 15 Part 2); a success check drawing on submit.
  - **Value change:** numbers counting up or rolling when balances, prices or counts change (useful to show *that* something changed; keep it short for money so people don't doubt the final value).
  - **Progress and loading:** determinate bars, spinners, skeleton shimmer (a subtle moving gradient) and **optimistic updates** that animate instantly and roll back visibly if the server fails (`TD-01#19 · @designwithrajatpatel · DcNtszPqERn`).
  - **Transformations:** a "Send" button morphing into a spinner, then into a check. Excellent feedback in one element.
- **Delight, carefully:** celebration moments (a first payment, a completed course, a goal reached) earn more expressive motion. Libraries of "delight details" such as designspells.com are useful references (`TD-15#36 · @andresthedesigner · C8NgOCFyS1c`), but delight repeated fifty times a day turns into friction.
- **Web interaction categories** that feel alive: **physics** (things that fall and collide), **tactility** (things you can pick up and tilt, like a holographic sticker) and **revelation** (masks that uncover content) (`TD-08#4 · @ui.ananya_ · DclaEIyonIA`). A page that simply **acknowledges the cursor** often does more than heavy WebGL (`TD-02#11 · @thedesignely · Dcdb8FNNTVi`). Some "animations" are really **navigation patterns** (orbit galleries, infinite canvases), which is a bigger design decision than an entrance effect (`TD-08#5 · @sypcreative · Dciq_c7MSed`).
- **Solve the library problem once.** If you rebuild the same interactions on every project, you don't have a craft problem, you have a library problem: package your motion components (`TD-08#1 · @juli_fella · DdBTl8XoPOE`), or start from open-source libraries with real APIs and docs (`TD-08#25 · @adrien.ninet · C9kG-nuNj9J`: Magic UI; `TD-10#40 · @setupsai · DappXCcvuE3`). Meridian UI can carry your motion primitives.
- **Pair motion with sound and haptics** for important feedback (a payment success, a long-press menu), carefully and with user control (20).

**Intuition anchors**
- Feedback must start within ~100 ms of input, even if the result takes longer.
- One element transforming through its states beats three elements appearing and disappearing.
- Delight is a budget. Spend it where the moment matters.

**Mastery checks**
- Break down three micro-interactions into trigger, rules, feedback, loops and modes.
- Design press, toggle, like, error and success micro-interactions with durations and curves.
- Explain optimistic animation and its rollback.
- Name the three categories of "alive" web interaction and one example each.

**Analysis**
- Rebuild five micro-interactions from apps you use daily (a like, a toggle, pull to refresh, a send-to-check transformation, a success state) in Figma Motion, then one of them in code with Motion or CSS. Compare timings with the originals frame by frame.

**Taste**
- The best micro-interactions are the ones you'd miss if they were gone but never consciously noticed while they were there.

---

## PART 5 — Accessibility & Performance [Core]

- **Motion can make people ill.** Vestibular disorders (and migraine, concussion and some other conditions) make large movements, parallax, zooms, spinning and auto-scrolling cause dizziness and nausea (15 Part 2).
  - Respect **`prefers-reduced-motion`** (web), **Reduce Motion** (iOS/macOS) and **Remove animations** (Android). Reduced motion doesn't mean *no* feedback: replace large movements with **fades or instant changes**, keep small state changes (a colour change on a toggle), and remove parallax, auto-play and decorative loops.
  - **WCAG 2.2:** **2.2.2 Pause, Stop, Hide** (A) for anything moving automatically for more than five seconds; **2.3.1 Three Flashes** (A); **2.3.3 Animation from Interactions** (AAA): motion triggered by interaction can be disabled unless essential.
  - Never convey information by motion alone (a shake means "error" only if the error message is also shown).
- **Performance: animate the cheap properties.**
  - Browsers render in stages: **layout** (geometry), **paint** (pixels), **composite** (layering). Animating **`transform`** (translate, scale, rotate) and **`opacity`** can usually run on the compositor, often on the GPU, without re-layout. Animating `width`, `height`, `top`, `left`, `margin` or `box-shadow` triggers layout or paint every frame and janks on slow phones.
  - **Frame budgets:** 60 fps leaves ~16.7 ms per frame; 120 fps ~8.3 ms. On a budget Android phone, JavaScript-heavy animations easily blow the budget.
  - Use `will-change` sparingly (it costs memory), avoid animating large blurred areas, and test with CPU throttling (16 Part 6). Heavy animation on input also hurts **INP** (the Core Web Vital for responsiveness).
  - Native apps: SwiftUI and Compose animations are optimised when they animate the right properties too; Lottie and Rive have their own performance characteristics (43).
- **Battery and data:** continuous animations drain battery; large Lottie JSON or video backgrounds cost data. Pause off-screen animations.

**Intuition anchors**
- Reduced motion means different motion (fades, instant changes), not broken or missing feedback.
- Transform and opacity are cheap; almost everything else is expensive.
- Test motion on the slowest phone your users have.

**Mastery checks**
- Explain vestibular triggers and what to change under reduced-motion settings.
- Name WCAG 2.2.2, 2.3.1 and 2.3.3 and what each requires.
- Explain layout, paint and composite, and why transform and opacity are preferred.
- State frame budgets at 60 and 120 fps.

**Analysis**
- Turn on Reduce Motion on your phone and use five apps. Which ones adapt sensibly (fades instead of slides)? Which ignore it? Which break?
- Record a Chrome Performance trace of an animation that animates `height` and the same one using `transform: scaleY`. Compare frame times with 4× CPU throttling.

**Taste**
- Accessible, fast motion isn't a compromise. The motion that survives reduced-motion and a budget phone is usually the most purposeful motion anyway.

---

## PART 6 — Motion Systems: Tokens, Principles & Handoff [Core → Deep]

- **Why a motion system:** without one, every designer picks durations and curves by feel, and the product moves inconsistently. A system makes motion **consistent, fast to design and easy to build**.
- **What's in it:**
  - **Principles:** 3–5 statements ("Responsive: acknowledge every input within 100 ms", "Calm: motion serves orientation, not decoration", "Physical: things the user touches follow their finger").
  - **Tokens** (14 Part 2): durations (`motion.duration.short = 150ms`, `medium = 250ms`, `long = 400ms`), easings (`motion.easing.standard`, `emphasized`, `decelerate`, `accelerate`), springs (`motion.spring.gentle = {duration: 0.35, bounce: 0}`, `bouncy = {…0.25}`), and stagger values. In DTCG these are `duration` and `cubicBezier` tokens (14 Part 1).
  - **Patterns:** which transition for which navigation (Part 3), standard micro-interactions (Part 4), loading behaviour.
  - **Productive vs expressive** categories (Carbon's split), with rules for when expressive motion is allowed.
  - **Reduced-motion variants** for every pattern.
- **Brand motion:** the identity's motion principles (10 Part 4) carry into the product at a lower volume. A playful brand might allow a little spring bounce in celebrations; a bank keeps everything calm.
- **Designing it in Figma:** **motion variables** (easing curves and timings as variables with modes, so a "calm" or "playful" mode changes the whole file) and **animated components** in Figma Motion; Smart Animate prototypes for flows (34).
- **Handoff:** specify each motion with **trigger, property, from/to values, duration, delay, curve or spring, and reduced-motion behaviour**. Figma Motion's Dev Mode shows the timeline and generates **CSS, React (motion.dev) or JSON** code; the MCP server gives coding agents the same context. Still record a short video of the intended feel, because numbers alone rarely capture it. Review the build side by side with the prototype (motion QA).

**Intuition anchors**
- Five durations and four curves are enough for almost any product.
- If motion isn't specified, it will be improvised in code.

**Mastery checks**
- Write motion principles, tokens and pattern rules for one product.
- Write a motion spec for a sheet transition with all seven properties plus reduced motion.
- Explain Figma motion variables and Dev Mode motion handoff.

**Analysis**
- Compare the motion documentation of Material 3, Carbon and Apple's HIG. What tokens and patterns does each define? Draft a motion section for Meridian UI based on the best of each.

**Taste**
- A great motion system makes a product feel like one hand designed every movement.

---

## PART 7 — The Implementation Landscape (What Designers Must Know) [Core → Deep]

Your React and Next.js background means you can build most UI motion yourself. Know the options and their trade-offs.

- **CSS:** `transition` for state changes, `@keyframes` for sequences, `linear()` for spring-like curves, **scroll-driven animations** (`animation-timeline: scroll()/view()`), and **view transitions** (same- and cross-document). Cheapest and most robust; check Baseline status for the newer features.
- **Web Animations API:** JavaScript control of the same engine (play, pause, reverse, scrub).
- **Libraries:**
  - **Motion** (motion.dev, formerly Framer Motion, independent since November 2024): declarative React (and vanilla JS) animation, springs, layout animations, gestures, exit animations. Figma Motion generates code for it.
  - **GSAP:** timeline-based animation and ScrollTrigger; **completely free, including all plugins, since 2025** (Webflow acquired it in 2024). The standard for complex, award-site choreography (16 Part 5).
  - **Anime.js:** a lightweight, code-driven engine for DOM and SVG (`TD-08#22 · @ezsnippet · DIYtfVvSk9L`).
  - **React Spring** and similar physics-first libraries.
- **Runtime animation formats:** **Lottie** (designed in After Effects or other tools, played from JSON/dotLottie) and **Rive** (interactive state machines, very small files: a whole Duolingo-style character in about 80 KB; `TD-08#19 · @abnux · DQ_lpOuAXs4`). Module 43 covers both.
- **Native:** **SwiftUI** (`withAnimation`, springs, `matchedGeometryEffect`, phase and keyframe animators) and **Jetpack Compose** (`animate*AsState`, `AnimatedVisibility`, shared-element transitions).
- **Prototyping tools:** Figma Motion (timelines and components), Smart Animate (flows), ProtoPie (sensor- and logic-driven device prototypes), Framer (production sites with motion) (40).
- **Designer–developer sync:** ambitious animation is a cost someone has to pay; it works when designer and developer are in sync (`TD-08#14 · @bee_ui.ux · DTFozXEj3EB`).

**Intuition anchors**
- Reach for CSS first, a library second, a runtime format when designers need to own complex animation.
- Choose the tool the team can maintain, not the one with the flashiest demo.

**Mastery checks**
- Choose CSS, Motion, GSAP, Lottie or Rive for eight given motion needs, with reasons.
- Explain view transitions and scroll-driven animations and their fallbacks.
- Name the native animation APIs in SwiftUI and Compose.

**Analysis**
- Implement one micro-interaction three ways (CSS, Motion, GSAP) in a small Next.js page. Compare code size, bundle cost, smoothness under throttling and ease of tuning.

**Taste**
- Designers who can prototype motion in code have fewer arguments and better products.

---

## PART 8 — Gesture-Driven Motion: Direct Manipulation, Velocity & Interruption [Deep]

Parts 2–4 treated motion as something that *plays*. On a touch screen much of the best motion *follows your finger*: the user is the animator, and the interface decides only what happens when the finger lets go.

- **Direct manipulation** (Ben Shneiderman's term, 1983): objects stay visible, the user acts on them physically rather than through commands, and every action gives immediate, reversible, visible feedback. On a phone, a sheet you drag, a card you swipe, a photo you pinch, a list you pull. The rule: **while the finger is down, the object tracks it 1:1 with no easing and no delay.** Easing during a drag feels like the object is on a rubber leash.
- **The three phases of a gesture:**
  1. **Tracking:** the object follows the finger. Only constraints apply (a sheet only moves vertically; a switch thumb stays inside its track).
  2. **Release:** the finger lifts with a **velocity** (points per second). This is the most important number in gesture design.
  3. **Settling:** the object animates to a resting state (open, closed, next card, snapped position), usually with a **spring whose starting velocity is the finger's release velocity**. That hand-off makes the gesture feel continuous: no jump in speed at the moment of release.
- **Deciding where it lands: position *and* velocity.** A naive rule ("dismiss if dragged past 50%") ignores flicks. A good rule **projects** where the object would stop if it kept moving and decelerated naturally, then snaps to the nearest valid resting point. Apple's "Designing Fluid Interfaces" (WWDC 2018) shared a projection function based on the scroll view's deceleration rate: `projectedDistance = (velocity / 1000) × rate / (1 − rate)`, with `rate ≈ 0.998` for normal scroll deceleration. In practice: a short, fast flick can dismiss a sheet that was only dragged 15% of the way, and a slow drag to 60% that's released while moving back up should *not* dismiss it.
- **Thresholds and hysteresis:** where a gesture commits, add a small dead zone so tiny jitters don't flip states, and make the threshold feel physical (a haptic tick as a swipe-to-archive crosses its commit point, 20 Part 2).
- **Rubber-banding:** when the user drags beyond a limit (the top of a list, the edge of a carousel), the content moves **less and less** the further they pull, then springs back on release. It tells the user "this is the edge" without an error. A widely used approximation of the iOS curve, reverse-engineered by developers, is `offset = (1 − 1 / ((x × c / d) + 1)) × d`, where `x` is the raw drag distance, `d` the dimension of the view and `c ≈ 0.55`. The exact numbers matter less than the shape: resistance should grow smoothly, never hit a wall.
- **Interruption and redirection:** a user must be able to grab a moving object mid-animation (catch a sheet as it closes, reverse a swipe). This is why springs matter (Part 2): the new animation starts from the object's *current position and velocity*. A fixed-duration tween restarts from wherever it happens to be, with a visible jerk. Test every gesture by interrupting it at 25%, 50% and 90%.
- **Momentum and snapping:** carousels, pickers and paged lists coast after a flick, then **snap** to an item. The snap target should be chosen from the projected landing point, not the release point, or fast flicks feel "sticky".
- **Latency is part of the feel:** touch-to-screen delay above a few tens of milliseconds makes dragging feel like the object lags behind the finger. On the web: avoid heavy work in pointer handlers, use `transform` for the moving element, set **`touch-action`** correctly so the browser doesn't wait to decide between your gesture and a scroll, and use passive listeners where you don't need `preventDefault()`.
- **Gesture conflicts:** a horizontal swipe inside a vertically scrolling list, a sheet with its own scrollable content, a map inside a page. Decide who wins by **initial direction** (lock the axis after the first ~10 px) and by **scroll position** (a sheet's content scrolls until it reaches the top, then further dragging moves the sheet). Emil Kowalski's **Vaul** drawer and Apple's sheets are good studies.
- **Discoverability:** gestures are invisible. Every gestural action needs a visible alternative (a close button on a swipe-dismissable sheet, an overflow menu for swipe actions), which is also an accessibility requirement: **WCAG 2.5.1 Pointer Gestures** (A) needs a single-pointer alternative to multipoint or path-based gestures, and **2.5.7 Dragging Movements** (AA, new in 2.2) needs a non-dragging alternative (15 Part 4).
- **Building it:** in React, **Motion** offers `drag` with `dragConstraints`, `dragElastic` (rubber-banding) and `dragMomentum`, plus `useVelocity` and springs that accept an initial velocity; `@use-gesture/react` handles raw gesture maths; CSS **scroll snap** (`scroll-snap-type`, `scroll-snap-align`) gives native momentum and snapping for free on carousels. In SwiftUI, `DragGesture` supplies `predictedEndTranslation`, a built-in projection; in Compose, `AnchoredDraggable` handles anchors and velocity thresholds.

**Intuition anchors**
- While the finger is down, the object belongs to the user. After it lifts, it belongs to physics.
- Decide by where it *would* land, not where it was let go.
- Every gesture needs a visible, non-gestural twin.

**Mastery checks**
- Describe the three phases of a gesture and what each needs.
- Explain velocity hand-off and projection, and why a 50% threshold alone fails.
- Explain rubber-banding and draw its offset curve.
- Explain how to resolve a sheet-with-scrolling-content conflict.
- Name the WCAG 2.2 criteria that apply to gestures and dragging.

**Analysis**
- Slow-record five gestures on iOS or Android (dismiss a sheet, swipe a notification, pull to refresh past the top, flick a photo gallery, drag a slider). For each, note tracking behaviour, the release rule you infer, the settling curve, and whether it can be interrupted.
- Build a bottom sheet in Next.js with Motion: 1:1 drag, a projection-based dismiss rule, a spring settle with velocity hand-off, rubber-banding above the top, and a close button. Interrupt it mid-animation and fix every jerk.

**Taste**
- The difference between an app that feels "native" and one that feels "web" is mostly how it behaves in the 300 ms after a finger lifts.

---

## PART 9 — Motion for Data, Numbers, Text & AI Interfaces [Deep → Frontier]

Some of the most important UI motion shows **change in information**: a chart updating, a balance changing, a response streaming in. Here motion is closer to data visualisation (22) than to animation.

- **Object constancy** (Mike Bostock's 2012 essay): when data updates, each visual mark should stay attached to the same data item, so a bar that represents "Tamil Nadu" moves to its new height or position rather than disappearing and being redrawn somewhere else. The eye follows the object and understands the change. Key functions in D3, stable `key`s in React lists and `layout` animations in Motion all serve the same idea.
- **What the research says:** Heer & Robertson (2007, *Animated Transitions in Statistical Data Graphics*) found that well-designed, **staged** transitions (first change the axes, then move the marks, then change the chart type) help people track changes better than instant cuts. Robertson and colleagues (2008) found that for *analysing* trends, animated playback (the Gapminder style Hans Rosling made famous in his 2006 TED talk) was less accurate than small multiples or trace lines, though audiences found it more engaging. The lesson: **animate transitions between states; don't make people read data from moving pictures.** Presentations can play; analysis tools should let people compare still states.
- **Staging data transitions:** one kind of change at a time (filter, then sort, then re-scale), around 300–700 ms per stage for charts (longer than UI chrome because the eye tracks many objects), with ease-in-out. Stagger large sets lightly or not at all: 200 bars staggered by 20 ms is a four-second wait.
- **Numbers:**
  - **Rolling or counting** shows *that* a value changed and in which direction. Keep it short (≈ 300–600 ms), always end on the exact value, and never count up a balance slowly enough that people read an intermediate number.
  - Use **tabular figures** (`font-variant-numeric: tabular-nums`) so digits don't jitter as they change width (04 Part 3). Libraries such as **NumberFlow** animate digits per place value with correct formatting.
  - Format with `Intl.NumberFormat` and animate the *formatted* value carefully for Indian grouping (`12,34,567`): the comma positions move as digits are added, which is a motion design problem in itself.
  - **Direction colour** (green up, red down) must also be shown by an arrow or sign, never by colour or motion alone (15 Part 2).
- **Text in motion:** text is read, so animate it less than shapes. Fade or slide whole lines or words, not scrambled letters, for anything the user needs to read. Letter-by-letter effects belong to brand moments (19), and they break Indic scripts (Part 10).
- **AI interfaces** (a frontier where motion conventions are still forming in 2026):
  - **Streaming text:** responses arrive token by token. Render them without layout jumps (reserve space, avoid re-flowing earlier lines), fade new chunks in very lightly or not at all, and **auto-scroll only while the user is at the bottom**: the moment they scroll up to read, stop following.
  - **Waiting and thinking states:** a subtle shimmer on a "Thinking…" label or a pulsing indicator tells users the system is alive during multi-second waits (06 Part 4, 13 Part 4). Show *progress* where you can (steps completed, sources being read) rather than an endless loop.
  - **Generated UI appearing:** when an agent inserts a card, table or edit into the interface, animate its arrival so the user sees *where* the change happened, and highlight changed regions briefly. In editors (code or documents), a short highlight fading over ~1 s is the established pattern.
  - **Voice interfaces:** an orb or waveform that reacts to the user's and the system's voice shows turn-taking. Keep it calm; it's on screen for the whole conversation (20).
- **Maps and spatial data:** fly-to animations should zoom out, pan, then zoom in (the "van Wijk" optimal path, 2003) rather than panning at high zoom, so the user keeps context.

**Intuition anchors**
- In data, motion shows *what changed*; stillness shows *what is*.
- Keep each mark attached to its datum. If you can't, cut instead of animating.
- Streaming interfaces should never move the line the user is reading.

**Mastery checks**
- Explain object constancy and how keys implement it in D3 and React.
- Summarise what Heer & Robertson (2007) and Robertson et al. (2008) found, and the design rule that follows.
- Specify a number-change animation for a balance, including figures, duration and the Indian grouping problem.
- Describe motion rules for a streaming AI response and its thinking state.

**Analysis**
- Build a bar chart of EcoTrace emissions by scope that re-sorts on a filter change, once with a hard cut, once with a staged transition (re-scale, then move). Show both to two people and ask what changed.
- Compare how three AI assistants you use handle streaming, auto-scroll and waiting states. Write down one rule each gets right and one each gets wrong.

**Taste**
- Motion for information is judged by what people remember afterwards, not by how it looked while it moved.

---

## PART 10 — Motion for Indian Users, Devices & Scripts [Core → Deep]

Most motion guidance is written for new iPhones on fast networks. EcoTrace, Meridian UI and most Indian products are used on something else, and the differences change real design decisions.

- **The device reality:** a large share of Indian smartphone users are on budget and mid-range Android phones: modest GPUs, 4–6 GB of RAM or less, 60 Hz screens (90–120 Hz is spreading fast in the mid-range, but you can't assume it), aggressive battery savers that throttle background work, and Chrome WebViews inside other apps. Design motion for a phone around ₹10,000, not a flagship.
  - Keep the number of simultaneously animating elements small; avoid animating blurs, shadows and large gradients; prefer `transform` and `opacity` (Part 5).
  - Animate less when the device is struggling. On the web, a simple frame-time check or the `navigator.deviceMemory` / `hardwareConcurrency` hints (where available) can drop to a "lite" motion tier; in native apps, check battery-saver or power-saving mode.
  - **Data cost and size:** a 400 KB Lottie on a sign-up screen costs real money on a prepaid plan and delays first paint. Budget animation weight like image weight (43 Part 3).
- **Money moments:** UPI has made the payment-success screen the most-seen animation in Indian digital life. The common pattern (a check that draws or pops, often with a sound and a haptic on the confirmation, and a large amount and payee name) does three jobs: it confirms, it reassures, and it gives the payer something to show the shopkeeper. Paytm's soundbox extends the same confirmation into sound for the merchant (20 Part 6). Rules that follow:
  - **Confirmation must be unmistakable and fast.** The success state should appear the moment the server confirms, never after a decorative intro.
  - **Failure and pending states need the same care.** "Payment pending" (money debited but not confirmed) is common enough that it needs its own calm, clearly different motion, never the success animation with a different colour.
  - **Screenshots are receipts.** People screenshot the success screen, so the final frame must be complete, legible and static; nothing important should exist only mid-animation.
- **Bold brands, calm tasks:** CRED is the best-known Indian example of motion-heavy, brand-forward product design, and it works because the audience and the brand promise (premium, playful) support it. A government or banking flow for the widest possible audience should stay calm and productive (Part 1's productive vs expressive split). Choose the register from the audience, not from what's admired on Dribbble.
- **Scripts in motion:**
  - Devanagari, Tamil, Bengali and other Indic scripts form **conjuncts and combining marks**: one visible syllable (a grapheme cluster) can be several Unicode code points. Animating "letter by letter" on JavaScript string indices splits clusters and shows broken glyphs mid-animation. Split text with **`Intl.Segmenter`** (granularity `'grapheme'` or `'word'`) or animate whole words and lines.
  - Headline-style per-letter effects are usually a mistake in Indic scripts anyway: the shaping engine needs the whole word to position matras and conjuncts, so animate **words or lines** (04 Part 7).
  - Text length changes between languages (Tamil and Malayalam strings are often much longer than English), so transitions that animate width or wrap should be tested in every supported language (17 Part 5).
  - **Urdu** runs right to left: directional motion (slide-in from the right for "next") must **mirror** in RTL layouts. CSS logical properties and `dir="rtl"` do most of the layout work, but motion values written as `translateX(100%)` need flipping.
- **Motion as instruction:** for first-time digital users and users with limited literacy, short looping demonstrations (how to scan a QR code, where to tap to enter an amount, how to hold a phone for a document photo) often teach better than text. Keep them short, silent by default, pausable and labelled, and remove them once the user has succeeded once.
- **Festive and seasonal motion:** Diwali, Holi, Onam and Eid themes are common in Indian consumer apps. Treat them as time-boxed brand moments with a kill switch, respect reduced motion (confetti and fireworks are classic vestibular triggers) and never put them in the path of a payment.

**Intuition anchors**
- Design the motion for the ₹10,000 phone first; the flagship will be fine.
- The success screen is a receipt. Its last frame must stand alone.
- Animate Indic text by words or grapheme clusters, never by code points.

**Mastery checks**
- List five constraints of budget Android devices and the motion decision each changes.
- Specify success, pending and failure states for a UPI-style payment confirmation.
- Explain grapheme clusters and how `Intl.Segmenter` prevents broken Indic text animation.
- Explain how motion direction changes in RTL layouts.

**Analysis**
- Compare the payment-success, pending and failure screens of three Indian payment apps (screen-record them in a test flow if you can, or collect recordings from the web). Tabulate durations, sound, haptics, what's legible in the final frame and how pending differs from success.
- Animate the Hindi word "प्रक्रिया" and the Tamil word "க்ஷேத்திரம்" letter by letter using string indices, then using `Intl.Segmenter`. Screenshot the broken and fixed frames for your notes.

**Taste**
- Motion that respects its users' phones, data plans and scripts is not a lesser version of "real" motion design. It *is* the real version for most people.

---

## PART 11 — Critiquing, Debugging & QA-ing Motion [Deep]

Motion is the part of a product most often approved from a video and then shipped differently. This Part gives you the vocabulary to critique it and the tools to check it.

- **A vocabulary that maps to fixes:**

| What people say | Usually means | Try |
|---|---|---|
| "Sluggish", "slow" | Too long, or too soft a start | Sharper ease-out before shortening |
| "Floaty" | Long, low-contrast curve; springs with too little stiffness | More stiffness, less duration |
| "Snappy", "abrupt" | Too short or too sharp an end | Longer deceleration tail |
| "Robotic", "mechanical" | Linear easing on something that starts and stops | Ease-out or a spring |
| "Bouncy", "toy-like" | Too much overshoot | Reduce bounce towards 0 |
| "Busy", "noisy" | Too many simultaneous motions | One focal motion, quieter secondaries |
| "Jumpy", "jittery" | Dropped frames, layout shift, number width changes | Transform-only, reserve space, tabular figures |
| "Disorienting" | Inconsistent direction, broken spatial model | Fix the spatial map (Part 3) |

- **Critique order:** (1) **purpose** (what job does this motion do? Part 0), (2) **spatial logic** (does direction make sense and reverse cleanly?), (3) **timing and curves**, (4) **choreography** (what leads, what follows), (5) **performance** (frame drops, jank), (6) **accessibility** (reduced motion, flashing, alternatives to gestures), (7) **brand fit** (productive or expressive in the right places).
- **Tools for looking closely:**
  - **Chrome DevTools → Animations panel:** captures CSS animations and transitions, lets you replay at 25% or 10% speed and scrub. The **Performance** panel records frame timings and shows long tasks; the **Rendering** tab has paint flashing, layer borders and a frame-rendering stats overlay.
  - **iOS Simulator:** Debug → Slow Animations. On devices, Accessibility → Motion → Reduce Motion for testing; Xcode Instruments' hitches tools to measure dropped frames.
  - **Android developer options:** Window, Transition and Animator duration scales (set to 5× or 10× to see motion clearly), and "Profile HWUI rendering" bars for frame time.
  - **Screen recordings at 60 fps** scrubbed frame by frame in any video editor (or DaVinci Resolve, 38) are the universal fallback, and they let you compare prototype and build side by side.
- **Common motion bugs** (a checklist for motion QA):
  - **Jank:** dropped frames from layout-triggering properties, heavy JavaScript or big paint areas.
  - **Flash of unstyled or unanimated state:** the end state renders for a frame before the animation begins, or an exit animation is skipped because the element unmounted first (in React, use `AnimatePresence` or the View Transitions API).
  - **Double animation:** a parent and child both animate the same change.
  - **Z-order pops:** an element jumps above or below another mid-transition.
  - **Easing mismatch:** the build uses the browser default `ease` instead of the token curve.
  - **Interruption bugs:** tapping twice quickly queues two animations or snaps to the end.
  - **Layout shift on load:** content arriving pushes other content (hurts CLS).
  - **Reduced-motion gaps:** the main transitions respect the setting, but a carousel, a Lottie or a scroll effect doesn't.
  - **Timing drift:** each animation is fine, but the sequence together is too long (sum the choreography: Part 3).
- **Motion QA in practice:** for each motion in the spec (Part 6), check trigger, property, values, duration, delay, curve, reduced-motion variant and interruptibility against the build, on a budget phone and a desktop, then log discrepancies as tickets with a side-by-side recording. The tokens should make most fixes a one-line change.
- **Critiquing someone else's work kindly:** describe what you *felt* (floaty, disoriented), then point to the frame range and the likely mechanism, then suggest one change. Motion critique without timestamps is opinion; with timestamps and a proposed curve it's useful.

**Intuition anchors**
- Motion bugs hide at full speed. Slow everything down before you judge it.
- Every vague word ("floaty", "janky") has a mechanical cause. Find it.
- Approve motion from the build on a real phone, never from the video.

**Mastery checks**
- Map six critique words to their likely mechanisms and fixes.
- Name the slow-motion and frame-timing tools on web, iOS and Android.
- List eight common motion bugs and how to spot each.
- Run a motion QA pass against a spec and write it up.

**Analysis**
- Pick a site you admire and one you don't. Use Chrome's Animations panel at 10% speed and a Performance trace to find three decisions in each. Write a critique in the Part's order, with timestamps.
- Take a build you made in Parts 4 or 8 and run a full motion QA pass. Log at least five findings, even small ones.

**Taste**
- Teams that can talk precisely about motion ship better motion. Precision is a skill, and it's learnable.

---

## PART 12 — Masters, Connections & Taste [Lifelong]

- **People and sources worth studying:**
  - **Frank Thomas & Ollie Johnston**, *The Illusion of Life* (1981): the 12 principles.
  - **Issara Willenskomer**, *UX in Motion* (2017 principles; workshops).
  - **Val Head**, *Designing Interface Animation* (2016), and **Rachel Nabors**, *Animation at Work* (2017).
  - **Apple's WWDC 2018 talk "Designing Fluid Interfaces"**: the best single talk on gestural, interruptible motion.
  - **Google's Material motion guidance** (including M3 Expressive) and **IBM Carbon's motion** pages.
  - **Rauno Freiberg** (*Invisible Details of Interaction Design*, 2023) and **Emil Kowalski** (animation craft on the web; his open-source components Sonner and Vaul are small studies in excellent motion).
  - **Sarah Drasner** (*SVG Animations*, 2017).
  - **Mike Bostock** ("Object Constancy", 2012; D3) and **Jeffrey Heer** (animated transitions research): motion for data.
  - **Ben Shneiderman** (direct manipulation, 1983) and **Bret Victor** (*Inventing on Principle*, 2012): interfaces you touch and see respond immediately.
- **Products to study frame by frame:** iOS system apps (sheets, Dynamic Island), Linear, Things 3, Arc/Dia-era browser experiments, Stripe's product pages, Duolingo (character motion via Rive), CRED (bold motion in Indian fintech), Google Pay/PhonePe payment success moments.
- **Anti-taste:** everything animating at once; 800 ms transitions on frequent actions; bouncy springs on a banking app; linear easing on moving objects; animations that block input; parallax everywhere; scroll-jacking; motion that ignores Reduce Motion; animating `width`/`top` instead of transforms; carousels that auto-advance; spinners for 200 ms waits; "delight" confetti on routine actions; motion that doesn't reverse on back.
- **Connections:**
  - **→ 02, 05:** hierarchy and rhythm in time.
  - **→ 06:** perception of time and motion.
  - **→ 10:** brand motion principles.
  - **→ 13:** states, feedback, perceived performance.
  - **→ 14:** motion tokens.
  - **→ 15:** reduced motion and vestibular safety.
  - **→ 16:** web motion and performance.
  - **→ 19:** the full motion pipeline.
  - **→ 17:** motion for multilingual text.
  - **→ 20:** sound and haptics paired with motion.
  - **→ 22:** animated transitions in data visualisation.
  - **→ 34, 38, 40, 43:** Figma Motion, After Effects and Cavalry, prototyping tools, Lottie and Rive.

**Intuition anchors**
- Motion craft is timing craft. Train your sense of 100 ms the way a musician trains rhythm.

**Mastery checks**
- Name five people or sources and the idea from each you'll use.

**Analysis**
- Watch "Designing Fluid Interfaces" (WWDC 2018) and write one page on three principles you'll apply to Meridian UI's components.

**Taste**
- Aim for motion that makes an interface feel faster, clearer and kinder, in that order.

---

## Resource Library

**Primary:** Material Design 3 motion guidance (m3.material.io: easing and duration tokens, transitions, M3 Expressive motion) · Apple Human Interface Guidelines: Motion; WWDC 2018 "Designing Fluid Interfaces" · IBM Carbon motion guidelines · MDN: CSS transitions and animations, `linear()` easing, scroll-driven animations, View Transitions API, `prefers-reduced-motion` · WCAG 2.2 (2.2.2, 2.3.1, 2.3.3) · Figma Help Center: Figma Motion (explore, motion variables, hand off animations to development).

**Books:** Thomas & Johnston, *The Illusion of Life* (1981) · Val Head, *Designing Interface Animation* (2016) · Rachel Nabors, *Animation at Work* (2017) · Dan Saffer, *Microinteractions* (2013) · Sarah Drasner, *SVG Animations* (2017).

**Courses (free or covered):** Google's Material motion articles and codelabs (free) · web.dev's *Learn CSS: Animations* (free) · Motion (motion.dev) docs and examples (free) · GSAP's learning centre (free) · Emil Kowalski's *animations.dev* (paid, optional) · Figma Learn's Figma Motion tutorials (free).

**Reference libraries:** designspells.com (`TD-15#36`) · Magic UI (`TD-08#25`) · Rauno's and Emil's interaction write-ups · UI Movement and Mobbin's motion recordings.

**From your catalogue:** `TD-08#1`, `#4`, `#5`, `#12`, `#14`, `#19`, `#22`, `#25` (web motion, Smart Animate easing, Rive, Anime.js, component libraries) · `TD-01#18`, `#19`, `#21` (perceived performance, optimistic UI, 100–300 ms) · `TD-02#11`, `#32`, `#42`, `#46` (cursor acknowledgement, page transitions, repetition, restraint) · `TD-10#40` (documented animated components) · `TD-15#36` (delight details).

**Practice:** `T8-design-18-motion-ui.md`: timing drills, curve reps, micro-interaction rebuilds, choreography builds, reduced-motion trials, a motion system for Meridian UI, and the Figma Motion belts they need.

## Suggested Learning Order

1. Parts 0–1 (why motion; principles) + slow-motion screen recordings · ~5 h
2. Part 2 (timing, easing, springs) with Figma Motion drills · ~8 h
3. Part 4 (micro-interactions) with rebuilds · ~6 h
4. Part 3 (choreography and transitions) · ~6 h
5. Part 5 (accessibility and performance) · ~4 h
6. Part 7 (implementation) in your Next.js stack · ~6 h
7. Part 8 (gestures) with the bottom-sheet build · ~6 h
8. Part 10 (Indian devices and scripts) · ~3 h
9. Part 6 (motion systems) for Meridian UI · ~4 h
10. Part 9 (data, text and AI motion), ideally after starting 22 · ~4 h
11. Part 11 (critique and QA), then applied to everything you build · ~3 h
12. Part 12, then ongoing

Total ≈ 55 hours of study, alongside Figma's Blue belt (34) and before 19's full pipeline.
