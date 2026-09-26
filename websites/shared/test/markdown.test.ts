import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { escapeHtml, safeUrl } from '../lib/escape.ts';
import { renderInline, stripInline } from '../lib/inline-md.ts';
import { hashId, parseBlocks, parseCurriculum, topicLead } from '../lib/md-source.ts';
import { renderBlocks, renderDojo } from '../lib/render-md.ts';
import { renderQuiz } from '../lib/render-quiz.ts';
import { composeDocument, renderPlayground } from '../lib/render-playground.ts';

const root = new URL('../../../', import.meta.url);
const read = (file: string): string => readFileSync(new URL(file, root), 'utf8');

describe('escaping', () => {
  it('escapes all five HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  });
  it('neutralises javascript: and data: URLs', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('#');
    expect(safeUrl(' data:text/html,x')).toBe('#');
    expect(safeUrl('https://example.com')).toBe('https://example.com');
    expect(safeUrl('/learn/')).toBe('/learn/');
  });
});

describe('inline markdown', () => {
  it('renders code, bold and italic, and escapes everything else', () => {
    expect(renderInline('**Bold** and *em* with `<div>`')).toBe(
      '<strong>Bold</strong> and <em>em</em> with <code>&lt;div&gt;</code>',
    );
  });
  it('never renders raw HTML from source text', () => {
    expect(renderInline('<img src=x onerror=alert(1)>')).not.toContain('<img');
  });
  it('does not treat asterisks inside code as emphasis', () => {
    expect(renderInline('`a * b * c`')).toBe('<code>a * b * c</code>');
  });
  it('makes safe links only', () => {
    expect(renderInline('[x](javascript:alert(1))')).toContain('href="#"');
    expect(stripInline('**a** `b` [c](d)')).toBe('a b c');
  });
});

describe('block parser', () => {
  it('parses tables, nested lists, labels and fenced code (headings inside fences stay code)', () => {
    const blocks = parseBlocks('**Label**\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n- one\n  - nested\n- two\n\n```\n## not a heading\n```');
    expect(blocks.map((b) => b.type)).toEqual(['label', 'table', 'list', 'code']);
    const list = blocks[2];
    expect(list?.type === 'list' && list.items[0]?.children[0]?.text).toBe('nested');
  });
  it('produces stable short ids', () => {
    expect(hashId('abc')).toBe(hashId('abc'));
    expect(hashId('abc')).not.toBe(hashId('abd'));
  });
});

describe('curriculum outlines from the real source files', () => {
  it('finds all 28 PARTs of the HTML & CSS file with their tiers and groups', () => {
    const c = parseCurriculum(read('L1-coding-html-css.md'), 'L1-coding-html-css.md');
    expect(c.kind).toBe('learning');
    expect(c.parts).toHaveLength(28);
    expect(c.parts[8]?.title).toMatch(/Cascade/);
    expect(c.parts[8]?.groups.map((g) => g.label)).toEqual(['Intuition anchors', 'Mastery checks', 'Build', 'Taste']);
    expect(topicLead(c.parts[8]!.topics[1]!)).toBe('The cascade, in order');
  });
  it('finds the 15 sections of the HTML & CSS training file', () => {
    const c = parseCurriculum(read('T1-coding-html-css.md'), 'T1-coding-html-css.md');
    expect(c.kind).toBe('training');
    expect(c.sections).toHaveLength(15);
  });
});

describe('dojo rendering', () => {
  const c = parseCurriculum(read('T1-coding-html-css.md'), 'T1-coding-html-css.md');
  const sections = renderDojo(c.sections, 't1');
  const html = (title: RegExp): string => sections.find((s) => title.test(s.title))?.html ?? '';
  it('adds timers to drill tables', () => {
    expect(html(/Drill Bank/)).toContain('data-dojo-timer');
    expect(html(/Drill Bank/)).toContain('data-minutes="10"');
  });
  it('adds belt trackers to the belt ladder', () => {
    expect(html(/Belt Ladder/).match(/data-dojo-belt/g)?.length).toBeGreaterThanOrEqual(7);
  });
  it('turns prediction sets into probe logs and marks the logbook', () => {
    expect(html(/Prediction Sets/)).toContain('data-dojo-probe');
    expect(sections.find((s) => /Logbook/.test(s.title))?.hasLogbook).toBe(true);
  });
  it('keeps "How to Train" rules as plain lists', () => {
    expect(html(/How to Train/)).not.toContain('data-progress-id');
  });
  it('renders the 30-day plan and build ladder as trackable rows', () => {
    expect(html(/Thirty Days/)).toContain('data-progress-id');
    expect(html(/Build Ladder/)).toContain('data-progress-id');
  });
  it('escapes source text in rendered blocks', () => {
    expect(renderBlocks(parseBlocks('<script>alert(1)</script>'), 'x')).not.toContain('<script>');
  });
});

describe('quiz and playground renderers', () => {
  it('renders a quiz with a no-JS answer fallback', () => {
    const out = renderQuiz('q', [{ q: 'Pick', options: ['a', 'b'], answer: 1, why: 'because' }]);
    expect(out).toContain('data-answer="1"');
    expect(out).toContain('<details class="quiz__fallback">');
  });
  it('sandboxes the playground preview without allow-same-origin', () => {
    const out = renderPlayground({ id: 'p', title: 'T', html: '<p>hi</p>' });
    expect(out).toContain('sandbox="allow-scripts"');
    expect(out).not.toContain('allow-same-origin');
    expect(composeDocument('p', { html: '<p>hi</p>', css: 'p{}' })).toContain('<p>hi</p>');
  });
});
