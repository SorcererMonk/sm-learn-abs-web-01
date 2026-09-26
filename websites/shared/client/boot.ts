/**
 * The one script every page loads. It wires the small always-on behaviours and lazily
 * imports heavier modules only when their markup is present (per-page code splitting).
 */
import { initThemeToggle } from './theme.ts';
import { initCheckboxes, initLessonDone, initProgressPill, markIndexRows } from './progress.ts';

const $ = <T extends Element>(selector: string): T | null => document.querySelector<T>(selector);
const $$ = <T extends Element>(selector: string): T[] => [
  ...document.querySelectorAll<T>(selector),
];

const theme = $<HTMLButtonElement>('[data-theme-toggle]');
if (theme) initThemeToggle(theme);

const pill = $<HTMLElement>('[data-progress-pill]');
if (pill) initProgressPill(pill);

const done = $<HTMLButtonElement>('[data-lesson-done]');
if (done) initLessonDone(done);

markIndexRows();

if (!$('[data-dojo]')) initCheckboxes();

const lazy: [string, () => Promise<void>][] = [
  [
    'form[data-quiz]',
    async () => {
      const { initQuiz } = await import('./quiz.ts');
      $$<HTMLFormElement>('form[data-quiz]').forEach(initQuiz);
    },
  ],
  [
    '[data-playground]',
    async () => {
      const { initPlayground } = await import('./playground.ts');
      $$<HTMLElement>('[data-playground]').forEach(initPlayground);
    },
  ],
  [
    '[data-topic-index]',
    async () => {
      const { initTopicIndex } = await import('./topic-index.ts');
      $$<HTMLElement>('[data-topic-index]').forEach(initTopicIndex);
    },
  ],
  [
    '[data-dojo]',
    async () => {
      const { initDojo } = await import('./dojo.ts');
      initDojo();
    },
  ],
  [
    '[data-toc]',
    async () => {
      const { initToc } = await import('./toc.ts');
      $$<HTMLElement>('[data-toc]').forEach(initToc);
    },
  ],
];

for (const [selector, load] of lazy) {
  if ($(selector))
    load().catch((error: unknown) => console.error(`Failed to load ${selector}`, error));
}
