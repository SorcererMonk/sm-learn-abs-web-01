/**
 * A small, line-based Markdown block parser tuned to the curriculum files in the repo root,
 * plus helpers that turn an L (learning) or T (training) file into a structured outline.
 * Used at build time by the sites and by the coverage checker.
 */

export interface ListItem {
  text: string;
  children: ListItem[];
}

export type Block =
  | { type: 'heading'; depth: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'label'; text: string }
  | { type: 'list'; ordered: boolean; items: ListItem[] }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'code'; lang: string; text: string }
  | { type: 'quote'; text: string };

const LIST_ITEM = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
const splitRow = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim());

export function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    if (trimmed === '' || /^-{3,}$/.test(trimmed)) {
      i += 1;
      continue;
    }

    const fence = /^```(\w*)/.exec(trimmed);
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? '').trim().startsWith('```')) {
        body.push(lines[i] ?? '');
        i += 1;
      }
      i += 1;
      blocks.push({ type: 'code', lang: fence[1] ?? '', text: body.join('\n') });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading && !line.startsWith(' ')) {
      blocks.push({ type: 'heading', depth: heading[1]?.length ?? 1, text: heading[2] ?? '' });
      i += 1;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const body: string[] = [];
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('>')) {
        body.push((lines[i] ?? '').trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push({ type: 'quote', text: body.join('\n') });
      continue;
    }

    if (trimmed.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) {
        rows.push(splitRow(lines[i] ?? ''));
        i += 1;
      }
      const [header = [], separator, ...body] = rows;
      const hasSeparator = separator?.every((cell) => /^:?-{2,}:?$/.test(cell)) ?? false;
      blocks.push({ type: 'table', header, rows: hasSeparator ? body : rows.slice(1) });
      continue;
    }

    const first = LIST_ITEM.exec(line);
    if (first) {
      const ordered = /\d/.test(first[2] ?? '');
      const root: ListItem = { text: '', children: [] };
      const stack: { indent: number; item: ListItem }[] = [{ indent: -1, item: root }];
      let last: ListItem | undefined;
      while (i < lines.length) {
        const current = lines[i] ?? '';
        const match = LIST_ITEM.exec(current);
        if (match) {
          const indent = match[1]?.length ?? 0;
          while ((stack.at(-1)?.indent ?? -1) >= indent) stack.pop();
          const item: ListItem = { text: match[3] ?? '', children: [] };
          stack.at(-1)?.item.children.push(item);
          stack.push({ indent, item });
          last = item;
          i += 1;
        } else if (current.trim() !== '' && /^\s{2,}\S/.test(current) && last) {
          last.text += ` ${current.trim()}`; // continuation line
          i += 1;
        } else break;
      }
      blocks.push({ type: 'list', ordered, items: root.children });
      continue;
    }

    const body: string[] = [];
    while (i < lines.length) {
      const current = lines[i] ?? '';
      const t = current.trim();
      if (
        t === '' ||
        t.startsWith('|') ||
        t.startsWith('>') ||
        t.startsWith('```') ||
        (/^#{1,6}\s/.test(t) && !current.startsWith(' ')) ||
        (LIST_ITEM.test(current) && body.length > 0)
      )
        break;
      body.push(t);
      i += 1;
    }
    const text = body.join(' ');
    const label = /^\*\*([^*]+)\*\*:?$/.exec(text);
    blocks.push(label ? { type: 'label', text: label[1] ?? text } : { type: 'paragraph', text });
  }
  return blocks;
}

export interface Section {
  title: string;
  blocks: Block[];
}

/** Splits blocks into sections at headings of the given depth; content before the first is dropped. */
export function sectionsAt(blocks: Block[], depth: number): Section[] {
  const sections: Section[] = [];
  for (const block of blocks) {
    if (block.type === 'heading' && block.depth === depth) {
      sections.push({ title: block.text, blocks: [] });
    } else if (block.type === 'heading' && block.depth < depth) {
      continue;
    } else {
      sections.at(-1)?.blocks.push(block);
    }
  }
  return sections;
}

export interface LabelGroup {
  label: string;
  blocks: Block[];
}

export interface Part {
  /** "0", "1" … for PARTs; the section title slug for others */
  id: string;
  number: number;
  title: string;
  tier: string;
  /** Top-level bullets before the first bold label: the Part's topics. */
  topics: ListItem[];
  /** Everything else in the body before the first label (tables, paragraphs). */
  extra: Block[];
  /** Intuition anchors, Mastery checks, Build/Analysis, Taste, … */
  groups: LabelGroup[];
}

export interface Curriculum {
  title: string;
  subtitle: string;
  intro: string;
  kind: 'learning' | 'training';
  parts: Part[];
  /** Non-PART sections for L files (How To Use, Capstones, Resources, Suggested Learning Order),
   *  and every numbered section for T files. */
  sections: Section[];
}

const PART_HEADING = /^PART\s+(\d+)\s+[—-]\s+(.*?)(?:\s+\[([^\]]+)\])?$/;

export function splitLabels(blocks: Block[]): { before: Block[]; groups: LabelGroup[] } {
  const before: Block[] = [];
  const groups: LabelGroup[] = [];
  for (const block of blocks) {
    if (block.type === 'label') groups.push({ label: block.text, blocks: [] });
    else if (groups.length > 0) groups.at(-1)?.blocks.push(block);
    else before.push(block);
  }
  return { before, groups };
}

export function parseCurriculum(source: string, fileName: string): Curriculum {
  const blocks = parseBlocks(source);
  const title = blocks.find((b) => b.type === 'heading' && b.depth === 1);
  const subtitle = blocks.find((b) => b.type === 'heading' && b.depth === 2);
  const intro = blocks.find((b) => b.type === 'quote');
  const kind = /(^|\/)T\d/.test(fileName) ? 'training' : 'learning';
  const sections = sectionsAt(blocks, 2).filter((s) => s !== undefined && s.title !== subtitle?.text);

  const parts: Part[] = [];
  const others: Section[] = [];
  for (const section of sections) {
    const match = PART_HEADING.exec(section.title);
    if (!match) {
      others.push(section);
      continue;
    }
    const { before, groups } = splitLabels(section.blocks);
    const topics = before.flatMap((b) => (b.type === 'list' ? b.items : []));
    parts.push({
      id: match[1] ?? '',
      number: Number(match[1]),
      title: match[2] ?? '',
      tier: match[3] ?? '',
      topics,
      extra: before.filter((b) => b.type !== 'list'),
      groups,
    });
  }

  return {
    title: title && 'text' in title ? title.text : fileName,
    subtitle: subtitle && 'text' in subtitle ? subtitle.text : '',
    intro: intro && 'text' in intro ? intro.text : '',
    kind,
    parts,
    sections: others,
  };
}

/** The bold lead-in of a bullet ("**The cascade, in order**: …" -> "The cascade, in order"),
 *  or its first words when there is none. Used to list sub-topics in coverage reports. */
export function topicLead(item: ListItem, maxWords = 9): string {
  const raw = item.text.trim();
  const bold = /^\*\*(.+?)\*\*/.exec(raw);
  const colon = raw.indexOf(':');
  const text = bold ? (bold[1] ?? '') : colon > 0 && colon <= 70 ? raw.slice(0, colon) : raw;
  const clean = text.replace(/[`*]/g, '').replace(/\s+/g, ' ').trim().replace(/[:.]$/, '');
  const words = clean.split(' ');
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}…` : clean;
}

/** FNV-1a 32-bit: stable, short ids for list items and table rows (progress keys). */
export function hashId(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}
