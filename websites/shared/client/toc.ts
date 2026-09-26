/** Highlights the table-of-contents entry for the section currently in view. */
export function initToc(toc: HTMLElement): void {
  const links = new Map<string, HTMLAnchorElement>();
  toc
    .querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    .forEach((a) => links.set(a.hash.slice(1), a));
  const targets = [...links.keys()]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  if (!targets.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      links.forEach((a, id) => a.setAttribute('aria-current', String(id === visible.target.id)));
    },
    { rootMargin: '-20% 0px -65% 0px' },
  );
  targets.forEach((t) => observer.observe(t));
}
