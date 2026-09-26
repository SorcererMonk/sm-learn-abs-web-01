/**
 * Server-side (build-time) renderers from parsed curriculum blocks to HTML strings.
 * Used by Astro pages via set:html and by the Node server in 04-web-engineering.
 * Interactive behaviour is attached later by client/dojo.ts through data-attributes,
 * so every page works (read-only) without JavaScript.
 */
import { escapeHtml } from './escape.ts';
import { renderInline, stripInline } from './inline-md.ts';
import { hashId, type Block, type ListItem, type Section } from './md-source.ts';
import { slugify } from './slug.ts';

export interface RenderOptions {
  /** Added to heading depth (a source h3 rendered under a page h2 needs +0; under h1 -1 etc.). */
  headingBase?: number;
  /** depth of the heading these blocks sit under; labels become the next level down */
  sectionDepth?: number;
  /** Prefix for progress ids; when set, list items and ladder rows become trackable. */
  progressKey?: string;
  /** Section-specific enhancements (see renderDojoSection). */
  mode?: 'plain' | 'checklist' | 'probes' | 'rules';
}

const checkbox = (id: string, labelHtml: string): string =>
  `<label class="check"><input type="checkbox" data-progress-id="${escapeHtml(id)}"><span>${labelHtml}</span></label>`;

function renderItems(items: ListItem[], opts: RenderOptions, depth = 0): string {
  return items
    .map((item) => {
      const body = renderInline(item.text);
      const children = item.children.length
        ? `<ul>${renderItems(item.children, { ...opts, mode: 'plain' }, depth + 1)}</ul>`
        : '';
      const id = `${opts.progressKey ?? ''}:${hashId(item.text)}`;
      if (depth === 0 && opts.progressKey && opts.mode === 'checklist') {
        return `<li class="is-trackable">${checkbox(id, body)}${children}</li>`;
      }
      if (depth === 0 && opts.progressKey && opts.mode === 'probes') {
        return `<li class="probe" data-dojo-probe="${escapeHtml(id)}"><p>${body}</p><div class="probe__controls" hidden><button type="button" class="btn btn--small" data-probe="hit">Hit</button><button type="button" class="btn btn--small btn--ghost" data-probe="miss">Miss</button><output class="probe__rate" aria-live="polite"></output></div>${children}</li>`;
      }
      return `<li>${body}${children}</li>`;
    })
    .join('');
}

const minutesFrom = (target: string): number | undefined => {
  const match = /(\d+)\s*min/.exec(target);
  return match ? Number(match[1]) : undefined;
};

function renderTable(
  block: Extract<Block, { type: 'table' }>,
  caption: string,
  opts: RenderOptions,
): string {
  const first = (block.header[0] ?? '').toLowerCase();
  const targetCol = block.header.findIndex((h) => /^target$/i.test(h));
  const isLadder = first === 'belt' || first === 'rung';
  const isChecklist = ['#', 'week', 'days'].includes(first);
  const isSchedule = first === 'day';
  const track = Boolean(opts.progressKey);

  const extraHead =
    track && isLadder
      ? '<th scope="col">Your record</th>'
      : track && targetCol >= 0
        ? '<th scope="col">Practice</th>'
        : '';
  const head = block.header.map((h) => `<th scope="col">${renderInline(h)}</th>`).join('');

  const rows = block.rows
    .map((row) => {
      const id = `${opts.progressKey ?? ''}:${hashId(row.join('|'))}`;
      const cells = row
        .map((cell, index) => {
          const html = renderInline(cell);
          if (index === 0) {
            const inner = track && isChecklist ? checkbox(id, html) : html;
            return `<th scope="row">${inner}</th>`;
          }
          return `<td>${html}</td>`;
        })
        .join('');
      let extra = '';
      if (track && isLadder) {
        extra = `<td data-dojo-belt="${escapeHtml(id)}"><span class="belt__status" aria-live="polite">Not attempted</span><span class="belt__actions" hidden><button type="button" class="btn btn--small" data-belt="pass">Log a pass</button><button type="button" class="btn btn--small btn--ghost" data-belt="fail">Log an attempt</button></span></td>`;
      } else if (track && targetCol >= 0) {
        const minutes = minutesFrom(row[targetCol] ?? '');
        const label = stripInline(row[0] ?? 'Drill');
        extra =
          minutes === undefined
            ? '<td></td>'
            : `<td><button type="button" class="btn btn--small" data-dojo-timer="${escapeHtml(id)}" data-minutes="${minutes}" data-label="${escapeHtml(label)}" hidden>Start ${minutes}-min drill</button><output class="timer__best" data-dojo-best="${escapeHtml(id)}"></output></td>`;
      }
      return `<tr${isSchedule ? ` data-day="${escapeHtml(stripInline(row[0] ?? ''))}"` : ''}>${cells}${extra}</tr>`;
    })
    .join('');

  return `<div class="table-scroll" role="region" tabindex="0" aria-label="${escapeHtml(caption)}"><table${isSchedule ? ' data-dojo-schedule' : ''}><caption class="visually-hidden">${escapeHtml(caption)}</caption><thead><tr>${head}${extraHead}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

/** Paragraphs that are really "a · b · c" lists (reflex drills, spaced-repetition facts). */
function dotList(text: string): string[] | undefined {
  const parts = text.split(/\s+·\s+/);
  return parts.length >= 4 ? parts : undefined;
}

export function renderBlocks(blocks: Block[], caption: string, opts: RenderOptions = {}): string {
  const base = opts.headingBase ?? 0;
  let current = opts.sectionDepth ?? 2;
  const out: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const depth = Math.min(6, Math.max(2, block.depth + base));
        current = depth;
        out.push(`<h${depth} id="${slugify(block.text)}">${renderInline(block.text)}</h${depth}>`);
        break;
      }
      case 'label':
        {
          // one level below the heading in force, so the outline never skips a level
          const level = Math.min(6, current + 1);
          out.push(`<h${level} class="label-heading">${renderInline(block.text)}</h${level}>`);
        }
        break;
      case 'paragraph': {
        const items = opts.progressKey && opts.mode !== 'rules' ? dotList(block.text) : undefined;
        if (items) {
          // "**Label** (note) first item · second item · …" -> heading + checklist
          const first = items[0] ?? '';
          const lead = /^(\*\*[^*]+\*\*(?:\s*\([^)]*\))?:?)\s*(.*)$/.exec(first);
          const list = [lead ? (lead[2] ?? '') : first, ...items.slice(1)].filter(Boolean);
          if (lead) out.push(`<p class="label-heading">${renderInline(lead[1] ?? '')}</p>`);
          out.push(
            `<ul class="checklist">${renderItems(
              list.map((text) => ({ text, children: [] })),
              { ...opts, mode: 'checklist' },
            )}</ul>`,
          );
        } else {
          out.push(`<p>${renderInline(block.text)}</p>`);
        }
        break;
      }
      case 'list': {
        const tag = block.ordered ? 'ol' : 'ul';
        const mode = opts.mode ?? 'plain';
        const cls =
          mode === 'checklist' ? ' class="checklist"' : mode === 'probes' ? ' class="probes"' : '';
        out.push(`<${tag}${cls}>${renderItems(block.items, opts)}</${tag}>`);
        break;
      }
      case 'table':
        out.push(renderTable(block, caption, opts));
        break;
      case 'code':
        out.push(`<pre class="md-code" tabindex="0"><code>${escapeHtml(block.text)}</code></pre>`);
        break;
      case 'quote':
        out.push(
          `<blockquote>${block.text
            .split('\n')
            .filter(Boolean)
            .map((l) => `<p>${renderInline(l)}</p>`)
            .join('')}</blockquote>`,
        );
        break;
    }
  }
  return out.join('\n');
}

/** How each training-file section is enhanced, decided by its title. */
export function dojoMode(title: string): NonNullable<RenderOptions['mode']> {
  if (/how to train/i.test(title)) return 'rules';
  if (/probe|prediction/i.test(title)) return 'probes';
  return 'checklist';
}

export interface DojoSection {
  id: string;
  title: string;
  html: string;
  hasLogbook: boolean;
}

/** Renders every section of a training (T) file into trackable HTML. */
export function renderDojo(sections: Section[], key: string): DojoSection[] {
  return sections.map((section) => {
    const id = slugify(section.title);
    const hasLogbook = /logbook/i.test(section.title);
    const html = renderBlocks(section.blocks, stripInline(section.title), {
      headingBase: 0,
      progressKey: `${key}:${id}`,
      mode: dojoMode(section.title),
    });
    return { id, title: section.title, html, hasLogbook };
  });
}
