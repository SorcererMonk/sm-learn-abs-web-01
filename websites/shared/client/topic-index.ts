/**
 * Filterable topic index (Shopify-Editions style): free-text search plus toggle chips for
 * tier and source. Without JavaScript the full list is simply shown.
 */
import { markIndexRows } from './progress.ts';

export function initTopicIndex(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('input[type="search"]');
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const rows = [...root.querySelectorAll<HTMLElement>('[data-lesson-row]')];
  const status = root.querySelector<HTMLElement>('[data-index-status]');
  const controls = root.querySelector<HTMLElement>('.index-controls');
  if (controls) controls.hidden = false;
  markIndexRows(root);

  const apply = (): void => {
    const query = (input?.value ?? '').trim().toLowerCase();
    const active = chips.filter((c) => c.getAttribute('aria-pressed') === 'true');
    const byGroup = new Map<string, string[]>();
    active.forEach((chip) => {
      const [group = '', value = ''] = (chip.dataset.filter ?? '').split(':');
      byGroup.set(group, [...(byGroup.get(group) ?? []), value]);
    });
    let shown = 0;
    rows.forEach((row) => {
      const text = row.dataset.search ?? row.textContent?.toLowerCase() ?? '';
      const matchesText = !query || text.includes(query);
      const matchesChips = [...byGroup].every(([group, values]) =>
        values.some((value) => (row.dataset[group] ?? '').split(' ').includes(value)),
      );
      const visible = matchesText && matchesChips;
      row.hidden = !visible;
      if (visible) shown += 1;
    });
    if (status) status.textContent = `${shown} of ${rows.length} shown`;
  };

  input?.addEventListener('input', apply);
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
      apply();
    }),
  );
  apply();
}
