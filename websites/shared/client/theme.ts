/**
 * Theme toggle: Auto → Light → Dark. The initial theme is applied by a tiny blocking script
 * in <head> (see ThemeScript in BaseLayout) so there is no flash of the wrong theme.
 */
const ORDER = ['auto', 'light', 'dark'] as const;
type Theme = (typeof ORDER)[number];

const KEY = 'learn:theme';

function current(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'auto';
  } catch {
    return 'auto';
  }
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === 'auto') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    // not persisted
  }
}

export function initThemeToggle(button: HTMLButtonElement): void {
  const label = button.querySelector('[data-theme-label]');
  const render = (theme: Theme): void => {
    if (label) label.textContent = theme[0]?.toUpperCase() + theme.slice(1);
    button.setAttribute('aria-label', `Colour theme: ${theme}. Activate to change.`);
  };
  render(current());
  button.hidden = false;
  button.addEventListener('click', () => {
    const next = ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length] ?? 'auto';
    apply(next);
    render(next);
  });
}
