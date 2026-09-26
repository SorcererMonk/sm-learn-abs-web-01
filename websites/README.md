# Learning websites

Five learning websites generated from the curriculum files in the repository root (`L*.md` learning paths and `T*.md` training programmes). Every topic of every file is traceable to a page section, a demo or exercise, and an explanation, through a generated coverage matrix per site.

| Site | Folder | Source files | Status |
| --- | --- | --- | --- |
| **Foundations**: HTML & CSS, from the parser to taste | [`01-foundations`](./01-foundations) | `L1-coding-html-css.md`, `T1-coding-html-css.md` | Complete: 329/329 topics |
| Motion & data | `02-motion-and-data` | `L8-design-18-motion-ui.md`, `L8-design-19-motion-full-pipeline.md`, `L8-design-22-data-visualisation.md`, `T8-design-18-motion-ui.md`, `T8-design-19-motion-full-pipeline.md`, `T8-design-22-data-visualisation.md` | Planned |
| Language: TypeScript & JavaScript | `03-language` | `L1-coding-typescript-javascript.md`, `T1-coding-typescript-javascript.md` | Planned |
| Web engineering (with a Node backend) | `04-web-engineering` | `L18-cs-web-engineering.md`, `T18-cs-web-engineering.md` | Planned |
| Design mind | `05-design-mind` | `L8-design-04-typography.md`, `L8-design-05-composition-layout.md`, `L8-design-06-neuroscience-psychology.md`, `L8-design-07-semiotics-visual-language.md`, `L8-design-33-adjacent-fields-taste.md`, `T8-design-01-mindset-philosophy.md`, `T8-design-33-adjacent-fields-taste.md` | Planned |

## Run a site

```bash
cd websites
npm install            # once
npm run start:01       # Foundations on http://localhost:4321
```

Each site folder has its own README with what's inside, its stack, quality gates and coverage matrix.

## Workspace layout

```text
websites/
├── shared/                 @learn/shared: used by every site
│   ├── tokens/tokens.json  design tokens (DTCG) → styles/tokens.css via `npm run tokens`
│   ├── styles/             cascade layers: reset, tokens, base, layout, components, motion, print
│   ├── components/         layouts, lesson/dojo/coverage pages, Demo, Playground, Try, Quiz, shared demos
│   ├── client/             small TypeScript modules, lazily loaded per page by client/boot.ts
│   ├── lib/                pure logic: Markdown parsing, coverage, colour, fluid type, motion, tokens
│   ├── tools/              CLIs: coverage, token build, JS budget, static server, Lighthouse
│   ├── e2e/                the end-to-end smoke suite every site runs
│   └── test/               unit tests for the shared logic
└── 01-foundations/         a site (Astro 7 + MDX)
```

## Shared standards

- **Performance**: static HTML first; client JS lazily imported per feature; budget of 150 KB gzipped JS per page checked by `shared/tools/budget.ts`; Lighthouse mobile ≥ 90 on every page (`shared/tools/lighthouse.ts`).
- **Accessibility**: WCAG 2.2 AA; axe runs on every page in the e2e suite; semantic landmarks and heading order, visible focus, keyboard-operable demos, reduced motion, forced colours, 360 px reflow.
- **Motion**: duration tokens 150/250/400 ms with standard, out, in and spring easings; transform and opacity only; nothing moves under `prefers-reduced-motion`.
- **Code quality**: TypeScript strict, ESLint, Prettier, no unused dependencies; `npm run lint`, `npm run format:check`, `npm test` from this folder.
