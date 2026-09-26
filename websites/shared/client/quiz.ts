/** Upgrades rendered quizzes (lib/render-quiz.ts) with instant feedback and a saved score. */
import { read, write } from './store.ts';

type Scores = Record<string, Record<number, boolean>>;

export function initQuiz(form: HTMLFormElement): void {
  const id = form.dataset.quiz ?? 'quiz';
  const total = Number(form.dataset.count ?? '0');
  const score = form.querySelector<HTMLElement>('.quiz__score');

  const renderScore = (): void => {
    const results = read<Scores>('quiz', {})[id] ?? {};
    const correct = Object.values(results).filter(Boolean).length;
    const answered = Object.keys(results).length;
    if (score)
      score.textContent = answered
        ? `Score: ${correct} of ${total} correct (${answered} answered).`
        : '';
  };

  form.querySelectorAll<HTMLFieldSetElement>('.quiz__question').forEach((set, index) => {
    const button = set.querySelector<HTMLButtonElement>('[data-check]');
    const feedback = set.querySelector<HTMLElement>('.quiz__feedback');
    set.querySelector('.quiz__fallback')?.setAttribute('hidden', '');
    if (!button || !feedback) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      const picked = set.querySelector<HTMLInputElement>('input:checked');
      if (!picked) {
        feedback.dataset.state = 'wrong';
        feedback.textContent = 'Pick an option first.';
        return;
      }
      const answer = Number(set.dataset.answer);
      const ok = Number(picked.value) === answer;
      set.querySelectorAll<HTMLLabelElement>('.quiz__option').forEach((label, oi) => {
        if (oi === answer) label.dataset.state = 'correct';
        else if (label.contains(picked)) label.dataset.state = 'wrong';
        else delete label.dataset.state;
      });
      feedback.dataset.state = ok ? 'correct' : 'wrong';
      feedback.textContent = `${ok ? 'Correct.' : 'Not quite.'} ${feedback.dataset.why ?? ''}`;
      const all = read<Scores>('quiz', {});
      all[id] = { ...all[id], [index]: ok };
      write('quiz', all);
      renderScore();
    });
  });
  renderScore();
}
