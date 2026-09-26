/**
 * A teaching-sized version of how browsers build the accessibility tree:
 * implicit ARIA roles from HTML semantics, and the accessible-name computation in its
 * precedence order: aria-labelledby → aria-label → native label (label, alt, legend,
 * figcaption, caption, <title>) → content (for roles that allow it) → title/placeholder.
 * Real engines handle many more cases; this covers what Part 7 teaches.
 */

const HEADING = /^h[1-6]$/;

function landmarkAncestor(el: Element): boolean {
  return Boolean(el.parentElement?.closest('article, aside, main, nav, section'));
}

export function implicitRole(el: Element): string {
  const explicit = el.getAttribute('role')?.trim().split(/\s+/)[0];
  if (explicit) return explicit;
  const tag = el.localName;
  if (HEADING.test(tag)) return 'heading';
  switch (tag) {
    case 'a':
    case 'area':
      return el.hasAttribute('href') ? 'link' : 'generic';
    case 'button':
      return 'button';
    case 'summary':
      return 'button';
    case 'nav':
      return 'navigation';
    case 'main':
      return 'main';
    case 'aside':
      return 'complementary';
    case 'header':
      return landmarkAncestor(el) ? 'generic' : 'banner';
    case 'footer':
      return landmarkAncestor(el) ? 'generic' : 'contentinfo';
    case 'section':
      return accessibleName(el) ? 'region' : 'generic';
    case 'form':
      return accessibleName(el) ? 'form' : 'generic';
    case 'search':
      return 'search';
    case 'article':
      return 'article';
    case 'ul':
    case 'ol':
    case 'menu':
      return 'list';
    case 'li':
      return 'listitem';
    case 'dialog':
      return 'dialog';
    case 'details':
    case 'fieldset':
      return 'group';
    case 'figure':
      return 'figure';
    case 'p':
      return 'paragraph';
    case 'table':
      return 'table';
    case 'tr':
      return 'row';
    case 'th':
      return el.getAttribute('scope') === 'row' ? 'rowheader' : 'columnheader';
    case 'td':
      return 'cell';
    case 'img':
      return el.getAttribute('alt') === '' ? 'presentation' : 'img';
    case 'select':
      return el.hasAttribute('multiple') ? 'listbox' : 'combobox';
    case 'textarea':
      return 'textbox';
    case 'progress':
      return 'progressbar';
    case 'meter':
      return 'meter';
    case 'hr':
      return 'separator';
    case 'input': {
      const type = (el.getAttribute('type') ?? 'text').toLowerCase();
      const map: Record<string, string> = {
        checkbox: 'checkbox',
        radio: 'radio',
        range: 'slider',
        number: 'spinbutton',
        search: 'searchbox',
        button: 'button',
        submit: 'button',
        reset: 'button',
        image: 'button',
        hidden: 'none',
      };
      return map[type] ?? 'textbox';
    }
    default:
      return 'generic';
  }
}

const NAME_FROM_CONTENT = new Set([
  'button',
  'link',
  'heading',
  'cell',
  'columnheader',
  'rowheader',
  'option',
  'tab',
  'menuitem',
  'checkbox',
  'radio',
  'switch',
  'tooltip',
  'treeitem',
]);

const clean = (text: string): string => text.replace(/\s+/g, ' ').trim();

export function isHidden(el: Element): boolean {
  if (el.closest('[hidden], [aria-hidden="true"]')) return true;
  const view = el.ownerDocument.defaultView;
  if (!view) return false;
  const style = view.getComputedStyle(el);
  return style.display === 'none' || style.visibility === 'hidden';
}

/**
 * The text a ::before/::after `content` value contributes to a name. Strings count, and the
 * alt-text syntax `content: "★" / "Rating"` contributes only its alternative ("Rating").
 */
export function contentValueText(value: string): string {
  const m = /^"((?:[^"\\]|\\.)*)"(?:\s*\/\s*"((?:[^"\\]|\\.)*)")?$/.exec(value.trim());
  return m ? (m[2] ?? m[1] ?? '') : '';
}

function pseudoText(el: Element, pseudo: '::before' | '::after'): string {
  const view = el.ownerDocument.defaultView;
  return view ? contentValueText(view.getComputedStyle(el, pseudo).content ?? '') : '';
}

/** Text from content: pseudo-element text, text nodes and the names of embedded content, skipping hidden subtrees. */
export function textFromContent(el: Element): string {
  const parts: string[] = [pseudoText(el, '::before')];
  el.childNodes.forEach((node) => {
    if (node.nodeType === 3) parts.push(node.textContent ?? '');
    else if (node.nodeType === 1) {
      const child = node as Element;
      if (isHidden(child)) return;
      if (child.localName === 'img') parts.push(child.getAttribute('alt') ?? '');
      else if (child.localName === 'svg')
        parts.push(child.querySelector('title')?.textContent ?? '');
      else parts.push(child.getAttribute('aria-label') ?? textFromContent(child));
    }
  });
  parts.push(pseudoText(el, '::after'));
  return clean(parts.join(' '));
}

export interface NameResult {
  name: string;
  /** which rule produced the name, for teaching */
  from: string;
}

export function computeName(el: Element): NameResult {
  // ids resolve within the element's own tree (a shadow root, when the specimen lives in one)
  const doc = el.getRootNode() as Document | ShadowRoot;
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const name = clean(
      labelledby
        .split(/\s+/)
        .map((id) => doc.getElementById(id))
        .map((ref) => (ref ? (ref.getAttribute('aria-label') ?? textFromContent(ref)) : ''))
        .join(' '),
    );
    if (name) return { name, from: 'aria-labelledby' };
  }
  const label = clean(el.getAttribute('aria-label') ?? '');
  if (label) return { name: label, from: 'aria-label' };

  const tag = el.localName;
  if (['input', 'select', 'textarea', 'meter', 'progress', 'output'].includes(tag)) {
    const labels = (el as HTMLInputElement).labels;
    const text = labels ? clean([...labels].map((l) => textFromContent(l)).join(' ')) : '';
    if (text) return { name: text, from: '<label>' };
    const type = el.getAttribute('type');
    if ((type === 'submit' || type === 'button' || type === 'reset') && el.getAttribute('value'))
      return { name: clean(el.getAttribute('value') ?? ''), from: 'value' };
  }
  if (tag === 'img' || tag === 'area') {
    const alt = el.getAttribute('alt');
    if (alt !== null) return { name: clean(alt), from: 'alt' };
  }
  if (tag === 'fieldset') {
    const legend = el.querySelector(':scope > legend');
    if (legend) return { name: textFromContent(legend), from: '<legend>' };
  }
  if (tag === 'figure') {
    const caption = el.querySelector(':scope > figcaption');
    if (caption) return { name: textFromContent(caption), from: '<figcaption>' };
  }
  if (tag === 'table') {
    const caption = el.querySelector(':scope > caption');
    if (caption) return { name: textFromContent(caption), from: '<caption>' };
  }
  if (tag === 'svg') {
    const title = el.querySelector(':scope > title');
    if (title) return { name: clean(title.textContent ?? ''), from: '<title>' };
  }
  // section/form roles depend on the name itself, and never take a name from content anyway
  const nameDependent = !el.hasAttribute('role') && (tag === 'section' || tag === 'form');
  if (!nameDependent && NAME_FROM_CONTENT.has(implicitRole(el))) {
    const text = textFromContent(el);
    if (text) return { name: text, from: 'content' };
  }
  const title = clean(el.getAttribute('title') ?? '');
  if (title) return { name: title, from: 'title (last resort)' };
  const placeholder = clean(el.getAttribute('placeholder') ?? '');
  if (placeholder) return { name: placeholder, from: 'placeholder (last resort, not a label)' };
  return { name: '', from: 'none' };
}

export const accessibleName = (el: Element): string => computeName(el).name;

export interface AxNode {
  role: string;
  name: string;
  from: string;
  depth: number;
}

/** A simplified accessibility tree: generic/presentational nodes are flattened away. */
export function accessibilityTree(root: Element, depth = 0, out: AxNode[] = []): AxNode[] {
  for (const el of root.children) {
    if (isHidden(el)) continue;
    const role = implicitRole(el);
    const meaningful = !['generic', 'none', 'presentation'].includes(role);
    if (meaningful) {
      const { name, from } = computeName(el);
      out.push({ role, name, from, depth });
    }
    accessibilityTree(el, meaningful ? depth + 1 : depth, out);
  }
  return out;
}
