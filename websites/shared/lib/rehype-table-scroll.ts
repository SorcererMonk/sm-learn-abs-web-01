/**
 * Rehype plugin: wraps Markdown tables in a focusable, labelled scroll region
 * (`.table-scroll`), so wide tables scroll sideways on phones instead of widening the page,
 * and keyboard users can scroll them (WCAG 1.4.10 reflow, 2.1.1 keyboard).
 */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const textOf = (node: HastNode): string =>
  node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join('');

const find = (node: HastNode, tag: string): HastNode | undefined => {
  if (node.tagName === tag) return node;
  for (const child of node.children ?? []) {
    const hit = find(child, tag);
    if (hit) return hit;
  }
  return undefined;
};

/** "Table: Format, Use it for, Notes" from the first header row. */
export function tableLabel(table: HastNode): string {
  const row = find(table, 'tr');
  const headers = (row?.children ?? [])
    .filter((c) => c.tagName === 'th' || c.tagName === 'td')
    .map((c) => textOf(c).trim())
    .filter(Boolean);
  return headers.length ? `Table: ${headers.join(', ')}` : 'Table';
}

export function rehypeTableScroll() {
  return (tree: HastNode): void => {
    const walk = (node: HastNode): void => {
      const children = node.children ?? [];
      children.forEach((child, i) => {
        if (child.type === 'element' && child.tagName === 'table') {
          const already =
            node.type === 'element' &&
            Array.isArray(node.properties?.className) &&
            (node.properties.className as string[]).includes('table-scroll');
          if (!already)
            children[i] = {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['table-scroll'],
                role: 'region',
                tabIndex: 0,
                ariaLabel: tableLabel(child),
              },
              children: [child],
            };
          return;
        }
        walk(child);
      });
    };
    walk(tree);
  };
}
