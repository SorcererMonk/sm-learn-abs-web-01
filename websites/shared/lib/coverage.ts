/**
 * Coverage: proves every topic of every source file maps to a page section with an
 * explanation and a demo or exercise. Pairs source bullets with lesson `## ` sections by
 * order, checks anchors/mastery checks counts, and maps training sections to the dojo.
 * Used by the CLI (tools/coverage.ts -> COVERAGE.md + README matrix) and by /coverage/ pages.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import GithubSlugger from 'github-slugger';
import { parse as parseYaml } from 'yaml';
import { parseCurriculum, topicLead, type Block, type Part } from './md-source.ts';
import { renderDojo } from './render-md.ts';
import { stripInline } from './inline-md.ts';
import type { SiteConfig } from './site.ts';

export type Status = 'Complete' | 'Partial' | 'Missing';

export interface TopicRow {
  topic: string;
  source: string;
  location: string;
  page: string;
  demo: string;
  status: Status;
}

export interface PartRow {
  part: string;
  title: string;
  source: string;
  page: string;
  topics: number;
  complete: number;
  demos: string;
  exercise: string;
  status: Status;
}

export interface Coverage {
  site: string;
  topics: TopicRow[];
  parts: PartRow[];
  problems: string[];
}

/** Section titles in learning files and the site page that materialises each. */
export const EXTRA_SECTION_ROUTES: Record<string, string> = {
  'How To Use This Document': '/start/',
  'Capstone Projects': '/capstones/',
  'Resource Library': '/resources/',
  'Suggested Learning Order': '/path/',
};

interface LessonFile {
  id: string;
  file: string;
  data: Record<string, unknown>;
  sections: { title: string; slug: string; body: string }[];
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

export function readLessons(lessonsDir: string): LessonFile[] {
  return walk(lessonsDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const raw = readFileSync(file, 'utf8');
      const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
      const data = (match ? parseYaml(match[1] ?? '') : {}) as Record<string, unknown>;
      const body = match?.[2] ?? raw;
      const slugger = new GithubSlugger();
      const sections: LessonFile['sections'] = [];
      let fenced = false;
      for (const line of body.split('\n')) {
        if (line.trim().startsWith('```')) fenced = !fenced;
        const heading = !fenced && /^##\s+(.+)$/.exec(line);
        if (heading) {
          const title = heading[1]?.trim() ?? '';
          sections.push({ title, slug: slugger.slug(stripInline(title)), body: '' });
        } else if (sections.length) {
          const last = sections.at(-1);
          if (last) last.body += `${line}\n`;
        }
      }
      const id = relative(lessonsDir, file)
        .replace(/\.mdx$/, '')
        .split('/')
        .map((segment) => new GithubSlugger().slug(segment))
        .join('/');
      return { id, file, data, sections };
    });
}

/** What a lesson section offers the learner beyond prose. */
export function sectionFeatures(body: string): { demos: string[]; snippet: boolean } {
  const demos = new Set<string>();
  for (const m of body.matchAll(/<([A-Z][A-Za-z0-9]+)[\s/>]/g)) {
    const name = m[1] ?? '';
    if (name !== 'Callout' && name !== 'Fragment')
      demos.add(name === 'Try' ? 'Exercise (Try)' : name);
  }
  return { demos: [...demos], snippet: /```/.test(body) };
}

/** Topics of a Part: its bullets, or for list-less Parts (taste pages) its bold-led paragraphs and labels. */
export function sourceTopics(part: Part): string[] {
  if (part.topics.length) return part.topics.map((t) => topicLead(t));
  const leads: string[] = [];
  const boldLead = (b: Block): void => {
    if (b.type === 'paragraph') {
      const m = /^\*\*([^*]+?):?\*\*/.exec(b.text);
      if (m) leads.push((m[1] ?? '').replace(/:$/, ''));
    }
  };
  part.extra.forEach(boldLead);
  for (const group of part.groups) {
    leads.push(group.label.replace(/:$/, ''));
    group.blocks.forEach(boldLead);
  }
  return leads;
}

const groupCount = (part: Part, pattern: RegExp): number => {
  const group = part.groups.find((g) => pattern.test(g.label));
  if (!group) return 0;
  return group.blocks.reduce(
    (n, b) => n + (b.type === 'list' ? b.items.length : b.type === 'paragraph' ? 1 : 0),
    0,
  );
};

export function computeCoverage(site: SiteConfig, siteDir: string, repoRoot: string): Coverage {
  const lessons = readLessons(join(siteDir, 'src/content/lessons'));
  const pagesDir = join(siteDir, 'src/pages');
  const pageExists = (route: string): boolean => {
    const clean = route.split('#')[0]?.replace(/^\/|\/$/g, '') ?? '';
    return [`${clean}.astro`, `${clean}/index.astro`, `${clean || 'index'}.astro`].some((p) =>
      existsSync(join(pagesDir, p)),
    );
  };
  const topics: TopicRow[] = [];
  const parts: PartRow[] = [];
  const problems: string[] = [];

  for (const source of site.sources) {
    const curriculum = parseCurriculum(
      readFileSync(join(repoRoot, source.file), 'utf8'),
      source.file,
    );

    if (curriculum.kind === 'training') {
      const route = source.route;
      const ok = pageExists(route);
      if (!ok) problems.push(`${source.file}: dojo page ${route} missing`);
      for (const section of renderDojo(curriculum.sections, source.file)) {
        const features = [
          /data-dojo-timer/.test(section.html) && 'drill timers',
          /data-dojo-belt/.test(section.html) && 'belt tracker',
          /data-dojo-probe/.test(section.html) && 'prediction log',
          /data-dojo-schedule/.test(section.html) && 'today highlight',
          section.hasLogbook && 'logbook',
          /data-progress-id/.test(section.html) && 'checklist',
        ].filter(Boolean) as string[];
        topics.push({
          topic: stripInline(section.title),
          source: source.file,
          location: `§ ${stripInline(section.title)}`,
          page: `${route}#${section.id}`,
          demo: features.length ? features.join(', ') : 'rendered reference',
          status: ok ? 'Complete' : 'Missing',
        });
      }
      parts.push({
        part: 'T',
        title: `Training programme (${curriculum.sections.length} sections)`,
        source: source.file,
        page: route,
        topics: curriculum.sections.length,
        complete: ok ? curriculum.sections.length : 0,
        demos: 'timers, belts, checklists, probes, logbook',
        exercise: 'every drill, exercise, build and trial is trackable',
        status: ok ? 'Complete' : 'Missing',
      });
      continue;
    }

    for (const part of curriculum.parts) {
      const lesson = lessons.find(
        (l) => l.data.source === source.file && Number(l.data.part) === part.number,
      );
      const expected = sourceTopics(part);
      const route = lesson ? `/learn/${lesson.id}/` : '';
      if (!lesson) {
        problems.push(`${source.file} PART ${part.number}: no lesson`);
        expected.forEach((topic, i) =>
          topics.push({
            topic,
            source: source.file,
            location: `PART ${part.number} · topic ${i + 1}`,
            page: '—',
            demo: '—',
            status: 'Missing',
          }),
        );
        parts.push({
          part: String(part.number),
          title: part.title,
          source: source.file,
          page: '—',
          topics: expected.length,
          complete: 0,
          demos: '—',
          exercise: '—',
          status: 'Missing',
        });
        continue;
      }
      if (lesson.sections.length !== expected.length) {
        problems.push(
          `${source.file} PART ${part.number}: ${expected.length} source topics but ${lesson.sections.length} lesson sections (${relative(siteDir, lesson.file)})`,
        );
      }
      const anchors = Array.isArray(lesson.data.anchors) ? lesson.data.anchors.length : 0;
      const checks = Array.isArray(lesson.data.checks) ? lesson.data.checks.length : 0;
      const expectAnchors = groupCount(part, /intuition/i);
      const expectChecks = groupCount(part, /mastery/i);
      if (expectAnchors && anchors < expectAnchors)
        problems.push(
          `${source.file} PART ${part.number}: ${anchors}/${expectAnchors} intuition anchors`,
        );
      if (expectChecks && checks < expectChecks)
        problems.push(
          `${source.file} PART ${part.number}: ${checks}/${expectChecks} mastery checks`,
        );

      let complete = 0;
      const allDemos = new Set<string>();
      expected.forEach((topic, i) => {
        const section = lesson.sections[i];
        const features = section ? sectionFeatures(section.body) : { demos: [], snippet: false };
        features.demos.forEach((d) => allDemos.add(d));
        const hasDemo = features.demos.length > 0;
        const status: Status = !section ? 'Missing' : hasDemo ? 'Complete' : 'Partial';
        if (status === 'Complete') complete += 1;
        if (status === 'Partial')
          problems.push(`${lesson.id} § "${section?.title}": explanation but no demo/exercise`);
        topics.push({
          topic:
            section && stripInline(section.title) !== topic
              ? `${topic} → ${stripInline(section.title)}`
              : topic,
          source: source.file,
          location: `PART ${part.number} · topic ${i + 1}`,
          page: section ? `${route}#${section.slug}` : route,
          demo:
            [...features.demos, features.snippet ? 'code snippet' : '']
              .filter(Boolean)
              .join(', ') || '—',
          status,
        });
      });
      parts.push({
        part: String(part.number),
        title: part.title,
        source: source.file,
        page: route,
        topics: expected.length,
        complete,
        demos: [...allDemos].join(', ') || '—',
        exercise: `${lesson.data.build ? 'Build/Analysis project' : '—'} · ${checks} mastery checks`,
        status:
          complete === expected.length && lesson.sections.length === expected.length
            ? 'Complete'
            : 'Partial',
      });
    }

    for (const section of curriculum.sections) {
      const route = EXTRA_SECTION_ROUTES[section.title];
      if (!route) {
        problems.push(`${source.file}: unmapped section "${section.title}"`);
        continue;
      }
      const ok = pageExists(route);
      topics.push({
        topic: section.title,
        source: source.file,
        location: `§ ${section.title}`,
        page: route,
        demo:
          section.title === 'How To Use This Document'
            ? 'orientation page'
            : 'rendered from source with progress checkboxes',
        status: ok ? 'Complete' : 'Missing',
      });
      if (!ok) problems.push(`${source.file}: page ${route} missing for "${section.title}"`);
    }
  }
  return { site: site.id, topics, parts, problems };
}

const cell = (text: string): string => text.replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function partsTable(coverage: Coverage, siteName: string): string {
  const head =
    '| Topic | Source MD | Website | Page/Component | Demo/Exercise | Status |\n|---|---|---|---|---|---|';
  const rows = coverage.parts.map(
    (p) =>
      `| ${cell(p.part === 'T' ? p.title : `PART ${p.part}: ${p.title} (${p.complete}/${p.topics} topics)`)} | \`${p.source}\` | ${siteName} | \`${p.page}\` | ${cell(`${p.demos}; ${p.exercise}`)} | ${p.status} |`,
  );
  return [head, ...rows].join('\n');
}

export function topicsTable(coverage: Coverage, siteName: string): string {
  const head =
    '| Topic | Source MD | Website | Page/Component | Demo/Exercise | Status |\n|---|---|---|---|---|---|';
  const rows = coverage.topics.map(
    (t) =>
      `| ${cell(t.topic)} | \`${t.source}\` (${cell(t.location)}) | ${siteName} | \`${cell(t.page)}\` | ${cell(t.demo)} | ${t.status} |`,
  );
  return [head, ...rows].join('\n');
}
