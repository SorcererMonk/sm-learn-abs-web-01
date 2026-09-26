/**
 * Training-page ("dojo") behaviour for rendered T files: drill timers, belt gate records,
 * probe hit-rates, today's row in the spaced schedule, and a local logbook with Markdown export.
 */
import { read, write } from './store.ts';
import { initCheckboxes } from './progress.ts';

interface DrillLog {
  best?: number; // seconds
  runs: number;
  withinTarget: number;
}
interface BeltLog {
  passes: string[]; // ISO dates
  attempts: number;
}
interface ProbeLog {
  hits: number;
  misses: number;
}
interface LogEntry {
  date: string;
  shape: string;
  minutes: string;
  what: string;
  targetActual: string;
  mechanism: string;
  rule: string;
  prediction: string;
}

const fmt = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

const today = (): string => new Date().toISOString().slice(0, 10);

function timerDialog(): {
  open: (label: string, minutes: number, onDone: (seconds: number) => void) => void;
} {
  const dialog = document.createElement('dialog');
  dialog.className = 'timer-dialog stack';
  dialog.setAttribute('aria-labelledby', 'timer-title');
  dialog.innerHTML = `<h2 id="timer-title" class="lesson-section-title"></h2>
<p class="muted" data-target></p>
<p class="timer-dialog__clock" role="timer" aria-live="off">0:00</p>
<p class="visually-hidden" aria-live="polite" data-announce></p>
<div class="cluster"><button type="button" class="btn" data-stop>Finish drill</button><button type="button" class="btn btn--ghost" data-cancel>Cancel</button></div>`;
  document.body.append(dialog);
  const clock = dialog.querySelector<HTMLElement>('.timer-dialog__clock');
  const announce = dialog.querySelector<HTMLElement>('[data-announce]');
  let started = 0;
  let raf = 0;
  let callback: (seconds: number) => void = () => undefined;
  let target = 0;
  const tick = (): void => {
    const seconds = (performance.now() - started) / 1000;
    if (clock) {
      clock.textContent = fmt(seconds);
      clock.toggleAttribute('data-over', seconds > target * 60);
    }
    if (announce && Math.floor(seconds) === target * 60) announce.textContent = 'Target time reached.';
    raf = requestAnimationFrame(tick);
  };
  const close = (save: boolean): void => {
    cancelAnimationFrame(raf);
    if (save) callback((performance.now() - started) / 1000);
    dialog.close();
  };
  dialog.querySelector('[data-stop]')?.addEventListener('click', () => close(true));
  dialog.querySelector('[data-cancel]')?.addEventListener('click', () => close(false));
  dialog.addEventListener('cancel', () => cancelAnimationFrame(raf));
  return {
    open(label, minutes, onDone) {
      const title = dialog.querySelector('#timer-title');
      const targetEl = dialog.querySelector('[data-target]');
      if (title) title.textContent = label;
      if (targetEl) targetEl.textContent = `Target: ${minutes} min. From memory, platform only. Stop when done.`;
      target = minutes;
      callback = onDone;
      started = performance.now();
      if (announce) announce.textContent = '';
      dialog.showModal();
      tick();
    },
  };
}

function initTimers(root: ParentNode): void {
  const buttons = root.querySelectorAll<HTMLButtonElement>('[data-dojo-timer]');
  if (!buttons.length) return;
  const dialog = timerDialog();
  const render = (id: string): void => {
    const log = read<Record<string, DrillLog>>('drills', {})[id];
    const out = root.querySelector<HTMLElement>(`[data-dojo-best="${CSS.escape(id)}"]`);
    if (out && log?.best !== undefined)
      out.textContent = `Best ${fmt(log.best)} · ${log.withinTarget}/${log.runs} on target`;
  };
  buttons.forEach((button) => {
    const id = button.dataset.dojoTimer ?? '';
    const minutes = Number(button.dataset.minutes ?? '0');
    button.hidden = false;
    render(id);
    button.addEventListener('click', () =>
      dialog.open(button.dataset.label ?? 'Drill', minutes, (seconds) => {
        const all = read<Record<string, DrillLog>>('drills', {});
        const log = all[id] ?? { runs: 0, withinTarget: 0 };
        log.runs += 1;
        if (seconds <= minutes * 60) log.withinTarget += 1;
        log.best = log.best === undefined ? seconds : Math.min(log.best, seconds);
        all[id] = log;
        write('drills', all);
        render(id);
        button.focus();
      }),
    );
  });
}

function initBelts(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-dojo-belt]').forEach((cell) => {
    const id = cell.dataset.dojoBelt ?? '';
    const status = cell.querySelector<HTMLElement>('.belt__status');
    const actions = cell.querySelector<HTMLElement>('.belt__actions');
    const render = (): void => {
      const log = read<Record<string, BeltLog>>('belts', {})[id];
      const days = new Set(log?.passes ?? []).size;
      const earned = days >= 2;
      cell.toggleAttribute('data-earned', earned);
      if (status)
        status.textContent = !log
          ? 'Not attempted'
          : earned
            ? `Earned ✓ (${days} passing days)`
            : `${log.passes.length} pass(es) on ${days} day(s), ${log.attempts} attempt(s). Pass on 2 separate days.`;
    };
    if (actions) actions.hidden = false;
    cell.querySelectorAll<HTMLButtonElement>('[data-belt]').forEach((button) =>
      button.addEventListener('click', () => {
        const all = read<Record<string, BeltLog>>('belts', {});
        const log = all[id] ?? { passes: [], attempts: 0 };
        log.attempts += 1;
        if (button.dataset.belt === 'pass') log.passes.push(today());
        all[id] = log;
        write('belts', all);
        render();
      }),
    );
    render();
  });
}

function initProbes(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-dojo-probe]').forEach((item) => {
    const id = item.dataset.dojoProbe ?? '';
    const controls = item.querySelector<HTMLElement>('.probe__controls');
    const out = item.querySelector<HTMLOutputElement>('.probe__rate');
    const render = (): void => {
      const log = read<Record<string, ProbeLog>>('probes', {})[id];
      const total = (log?.hits ?? 0) + (log?.misses ?? 0);
      if (out)
        out.textContent = total
          ? `${log?.hits ?? 0}/${total} hits (${Math.round(((log?.hits ?? 0) / total) * 100)}%)`
          : 'No predictions logged yet';
    };
    if (controls) controls.hidden = false;
    item.querySelectorAll<HTMLButtonElement>('[data-probe]').forEach((button) =>
      button.addEventListener('click', () => {
        const all = read<Record<string, ProbeLog>>('probes', {});
        const log = all[id] ?? { hits: 0, misses: 0 };
        if (button.dataset.probe === 'hit') log.hits += 1;
        else log.misses += 1;
        all[id] = log;
        write('probes', all);
        render();
      }),
    );
    render();
  });
}

function initSchedule(root: ParentNode): void {
  const day = new Date().toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3);
  root.querySelectorAll<HTMLTableRowElement>('[data-dojo-schedule] tr[data-day]').forEach((row) => {
    row.toggleAttribute('data-today', (row.dataset.day ?? '').startsWith(day));
  });
}

function initLogbook(form: HTMLFormElement): void {
  const list = form.parentElement?.querySelector<HTMLElement>('.logbook-entries');
  const exportButton = form.parentElement?.querySelector<HTMLButtonElement>('[data-log-export]');
  form.hidden = false;
  const render = (): void => {
    const entries = read<LogEntry[]>('logbook', []);
    if (!list) return;
    list.replaceChildren(
      ...entries
        .slice()
        .reverse()
        .map((entry) => {
          const article = document.createElement('article');
          article.textContent = toMarkdown(entry);
          return article;
        }),
    );
    if (exportButton) exportButton.hidden = entries.length === 0;
  };
  const dateInput = form.elements.namedItem('date');
  if (dateInput instanceof HTMLInputElement) dateInput.value = today();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form)) as unknown as LogEntry;
    write('logbook', [...read<LogEntry[]>('logbook', []), data]);
    form.reset();
    if (dateInput instanceof HTMLInputElement) dateInput.value = today();
    render();
  });
  exportButton?.addEventListener('click', () => {
    const md = read<LogEntry[]>('logbook', []).map(toMarkdown).join('\n\n');
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LOG.md';
    link.click();
    URL.revokeObjectURL(url);
  });
  render();
}

const toMarkdown = (e: LogEntry): string =>
  [
    `## ${e.date} · ${e.shape} · ${e.minutes} min · ${e.what}`,
    e.targetActual && `Target vs actual: ${e.targetActual}`,
    e.mechanism && `Mechanism of any miss: ${e.mechanism}`,
    e.rule && `Rule → standards.md: ${e.rule}`,
    e.prediction && `Prediction: ${e.prediction}`,
  ]
    .filter(Boolean)
    .join('\n');

export function initDojo(root: ParentNode = document): void {
  initCheckboxes(root);
  initTimers(root);
  initBelts(root);
  initProbes(root);
  initSchedule(root);
  root.querySelectorAll<HTMLFormElement>('form[data-logbook]').forEach(initLogbook);
}
