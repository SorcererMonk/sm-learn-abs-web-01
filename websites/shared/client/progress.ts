/**
 * Lesson completion: "Mark part as done" buttons, done markers in the topic index,
 * the header progress pill, and generic persisted checkboxes ([data-progress-id]).
 */
import { flagSet } from './store.ts';

const lessons = flagSet('lessons');
const checks = flagSet('checks');

export function initLessonDone(button: HTMLButtonElement): void {
  const id = button.dataset.lessonId ?? '';
  const render = (): void => {
    const done = lessons.has(id);
    button.setAttribute('aria-pressed', String(done));
    button.textContent = done ? 'Completed ✓ (undo)' : 'Mark this part as complete';
  };
  render();
  button.hidden = false;
  button.addEventListener('click', () => {
    lessons.set(id, !lessons.has(id));
    render();
  });
}

export function markIndexRows(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-lesson-row]').forEach((row) => {
    row.toggleAttribute('data-done', lessons.has(row.dataset.lessonRow ?? ''));
  });
}

export function initProgressPill(pill: HTMLElement): void {
  const total = Number(pill.dataset.total ?? '0');
  const render = (): void => {
    const done = lessons.size();
    pill.textContent = `${done}/${total} parts`;
    pill.title = `${done} of ${total} parts marked complete on this device`;
  };
  render();
  pill.hidden = false;
  document.addEventListener('learn:store', render);
}

export function initCheckboxes(root: ParentNode = document): void {
  root.querySelectorAll<HTMLInputElement>('input[data-progress-id]').forEach((box) => {
    const id = box.dataset.progressId ?? '';
    box.checked = checks.has(id);
    box.addEventListener('change', () => checks.set(id, box.checked));
  });
}
