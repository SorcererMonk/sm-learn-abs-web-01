/**
 * Rehype plugin: marks short inline `code` (outside <pre>) with class "nowrap", so tokens like
 * `--card-accent` never break at their hyphens, while long snippets can still wrap on phones.
 */
export const SHORT_CODE_LENGTH = 28;

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const textOf = (node: HastNode): string =>
  node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join('');

export function rehypeShortCode() {
  return (tree: HastNode): void => {
    const walk = (node: HastNode, parentTag?: string): void => {
      if (
        node.type === 'element' &&
        node.tagName === 'code' &&
        parentTag !== 'pre' &&
        textOf(node).length <= SHORT_CODE_LENGTH
      ) {
        const props = (node.properties ??= {});
        const existing = Array.isArray(props.className) ? (props.className as string[]) : [];
        props.className = [...existing, 'nowrap'];
      }
      for (const child of node.children ?? []) walk(child, node.tagName);
    };
    walk(tree);
  };
}
