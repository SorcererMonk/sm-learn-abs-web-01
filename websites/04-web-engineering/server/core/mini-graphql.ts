/**
 * A GraphQL-shaped query language in ~100 lines, to see what GraphQL is mechanically: the client
 * sends a selection set, the server resolves exactly those fields (no over-fetching), one round
 * trip. Supports nested selections and literal arguments, e.g.
 *
 *   { post(id: 1) { title author { name } comments { body } } }
 *
 * Not supported (on purpose): variables, fragments, aliases, directives, mutations.
 */
export interface Selection {
  name: string;
  args: Record<string, string | number | boolean>;
  children: Selection[];
}

export type Resolver = (args: Selection['args'], parent: unknown) => unknown;
export type Schema = Record<string, Record<string, Resolver>>;

const TOKEN = /\s*([{}():,]|[A-Za-z_][\w]*|-?\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*")/y;

export function tokenize(source: string): string[] {
  const tokens: string[] = [];
  TOKEN.lastIndex = 0;
  let index = 0;
  while (index < source.length) {
    if (/^\s*$/.test(source.slice(index))) break;
    TOKEN.lastIndex = index;
    const match = TOKEN.exec(source);
    if (!match?.[1]) throw new SyntaxError(`Unexpected character at ${index}: "${source[index]}"`);
    tokens.push(match[1]);
    index = TOKEN.lastIndex;
  }
  return tokens;
}

export function parse(source: string): Selection[] {
  const tokens = tokenize(source);
  let i = 0;
  const peek = (): string | undefined => tokens[i];
  const take = (expected?: string): string => {
    const token = tokens[i++];
    if (token === undefined) throw new SyntaxError('Unexpected end of query');
    if (expected && token !== expected)
      throw new SyntaxError(`Expected "${expected}", got "${token}"`);
    return token;
  };
  const value = (): string | number | boolean => {
    const token = take();
    if (token.startsWith('"')) return JSON.parse(token) as string;
    if (token === 'true' || token === 'false') return token === 'true';
    if (/^-?\d/.test(token)) return Number(token);
    throw new SyntaxError(`Expected a literal, got "${token}"`);
  };
  const selectionSet = (depth: number): Selection[] => {
    if (depth > 6) throw new SyntaxError('Query is nested too deeply');
    take('{');
    const out: Selection[] = [];
    while (peek() !== '}') {
      const name = take();
      if (!/^[A-Za-z_]\w*$/.test(name))
        throw new SyntaxError(`Expected a field name, got "${name}"`);
      const args: Selection['args'] = {};
      if (peek() === '(') {
        take('(');
        while (peek() !== ')') {
          const key = take();
          take(':');
          args[key] = value();
          if (peek() === ',') take(',');
        }
        take(')');
      }
      const children = peek() === '{' ? selectionSet(depth + 1) : [];
      out.push({ name, args, children });
      if (peek() === ',') take(',');
    }
    take('}');
    return out;
  };
  const result = selectionSet(0);
  if (i !== tokens.length) throw new SyntaxError(`Unexpected "${tokens[i]}" after the query`);
  return result;
}

/**
 * Resolves a selection against a schema: `schema.Query.post(args)` for root fields, then for
 * nested fields either `schema[TypeName][field](args, parent)` or the parent's own property.
 * Types are named by a `__typename` property on resolved objects.
 */
export function execute(
  selections: Selection[],
  schema: Schema,
  counters: { resolverCalls: number } = { resolverCalls: 0 },
): Record<string, unknown> {
  const resolveField = (selection: Selection, parent: unknown, typeName: string): unknown => {
    const resolver = schema[typeName]?.[selection.name];
    counters.resolverCalls += 1;
    const raw = resolver
      ? resolver(selection.args, parent)
      : (parent as Record<string, unknown> | undefined)?.[selection.name];
    return shape(raw, selection.children);
  };
  const shape = (raw: unknown, children: Selection[]): unknown => {
    if (!children.length || raw === null || raw === undefined) return raw ?? null;
    if (Array.isArray(raw)) return raw.map((item) => shape(item, children));
    const typeName = String((raw as { __typename?: string }).__typename ?? '');
    const out: Record<string, unknown> = {};
    for (const child of children) out[child.name] = resolveField(child, raw, typeName);
    return out;
  };
  const data: Record<string, unknown> = {};
  for (const selection of selections)
    data[selection.name] = resolveField(selection, undefined, 'Query');
  return data;
}
