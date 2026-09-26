/**
 * Shared wiring for demo controls: keeps each range's <output> in sync (value + data-unit)
 * and calls render() whenever any input, select or textarea inside the root changes.
 */
export function bindControls(root: HTMLElement, render: () => void): void {
  const sync = (input: HTMLInputElement): void => {
    const output = input.closest('.control')?.querySelector('output');
    if (output && input.type === 'range')
      output.textContent = `${input.value}${input.dataset.unit ?? ''}`;
  };
  root.addEventListener('input', (event) => {
    if (event.target instanceof HTMLInputElement) sync(event.target);
    render();
  });
  root.addEventListener('change', render);
  root.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach(sync);
  render();
}

/** Typed lookup that throws a clear error when a demo's markup and script drift apart. */
export function need<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Demo markup is missing ${selector}`);
  return el;
}

export const num = (root: ParentNode, selector: string): number =>
  Number(need<HTMLInputElement | HTMLSelectElement>(root, selector).value);
