/**
 * Quiz markup as a pure string renderer (used by Astro and by the Node server).
 * Without JavaScript each question offers a native <details> answer; client/quiz.ts
 * upgrades it to instant feedback and a remembered score.
 */
import { escapeHtml } from './escape.ts';
import { renderInline } from './inline-md.ts';

export interface QuizQuestion {
  q: string;
  options: string[];
  /** index into options */
  answer: number;
  why: string;
}

export function renderQuiz(id: string, questions: QuizQuestion[], title = 'Check yourself'): string {
  const items = questions
    .map((question, qi) => {
      const name = `${id}-q${qi}`;
      const options = question.options
        .map(
          (option, oi) =>
            `<label class="quiz__option"><input type="radio" name="${escapeHtml(name)}" value="${oi}"><span>${renderInline(option)}</span></label>`,
        )
        .join('');
      const answer = question.options[question.answer] ?? '';
      return `<fieldset class="quiz__question" data-answer="${question.answer}">
<legend>${qi + 1}. ${renderInline(question.q)}</legend>
<div class="quiz__options">${options}</div>
<div class="quiz__footer"><button type="button" class="btn btn--small" data-check hidden>Check answer</button></div>
<p class="quiz__feedback" role="status" data-why="${escapeHtml(question.why)}"></p>
<details class="quiz__fallback"><summary>Show answer</summary><p><strong>${renderInline(answer)}</strong> — ${renderInline(question.why)}</p></details>
</fieldset>`;
    })
    .join('\n');
  return `<section class="quiz-wrap stack" aria-labelledby="${escapeHtml(id)}-title">
<h3 id="${escapeHtml(id)}-title" class="lesson-section-title">${escapeHtml(title)}</h3>
<form class="quiz" data-quiz="${escapeHtml(id)}" data-count="${questions.length}">${items}
<p class="quiz__score muted" aria-live="polite"></p></form></section>`;
}
