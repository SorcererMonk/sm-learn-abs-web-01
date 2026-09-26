/**
 * Playground behaviour: APG-conformant tabs (arrow keys, roving tabindex), debounced live
 * preview, reset / show-solution, and a console panel fed by postMessage from the sandbox.
 * Messages are accepted only from this playground's own iframe (event.source check),
 * because a sandboxed frame has an opaque "null" origin that can't be checked by string.
 */
import { composeDocument, type PlaygroundFiles } from '../lib/render-playground.ts';

function initTabs(root: HTMLElement): void {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement, focus = true): void => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = root.querySelector<HTMLElement>(`#${t.getAttribute('aria-controls')}`);
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      const next =
        event.key === 'ArrowRight'
          ? tabs[(i + 1) % tabs.length]
          : event.key === 'ArrowLeft'
            ? tabs[(i - 1 + tabs.length) % tabs.length]
            : event.key === 'Home'
              ? tabs[0]
              : event.key === 'End'
                ? tabs.at(-1)
                : undefined;
      if (next) {
        event.preventDefault();
        select(next);
      }
    });
  });
  const first = tabs[0];
  if (first) select(first, false);
}

export function initPlayground(root: HTMLElement): void {
  const id = root.dataset.playground ?? 'pg';
  const iframe = root.querySelector('iframe');
  const consoleEl = root.querySelector<HTMLElement>('.playground__console');
  const areas = [...root.querySelectorAll<HTMLTextAreaElement>('textarea[data-lang]')];
  if (!iframe) return;
  initTabs(root);

  const files = (): PlaygroundFiles =>
    Object.fromEntries(areas.map((a) => [a.dataset.lang ?? 'html', a.value])) as PlaygroundFiles;

  let timer: number | undefined;
  const run = (): void => {
    if (consoleEl) consoleEl.textContent = '';
    iframe.srcdoc = composeDocument(id, files());
  };
  areas.forEach((area) =>
    area.addEventListener('input', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 350);
    }),
  );

  window.addEventListener(
    'message',
    (event: MessageEvent<{ pg?: string; level?: string; text?: string }>) => {
      if (event.source !== iframe.contentWindow || event.data?.pg !== id || !consoleEl) return;
      const line = document.createElement('div');
      line.textContent = `${event.data.level === 'log' ? '›' : `[${event.data.level}]`} ${event.data.text ?? ''}`;
      if (event.data.level === 'error') line.style.color = 'var(--color-danger)';
      consoleEl.append(line);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    },
  );

  const load = (source: PlaygroundFiles): void => {
    areas.forEach((area) => {
      const lang = (area.dataset.lang ?? 'html') as keyof PlaygroundFiles;
      area.value = source[lang] ?? area.dataset.initial ?? '';
    });
    run();
  };

  const reset = root.querySelector<HTMLButtonElement>('[data-pg-reset]');
  if (reset) {
    reset.hidden = false;
    reset.addEventListener('click', () =>
      load(
        Object.fromEntries(
          areas.map((a) => [a.dataset.lang, a.dataset.initial ?? '']),
        ) as PlaygroundFiles,
      ),
    );
  }
  const solutionButton = root.querySelector<HTMLButtonElement>('[data-pg-solution]');
  if (solutionButton && root.dataset.solution) {
    solutionButton.hidden = false;
    solutionButton.addEventListener('click', () =>
      load(JSON.parse(root.dataset.solution ?? '{}') as PlaygroundFiles),
    );
  }
}
