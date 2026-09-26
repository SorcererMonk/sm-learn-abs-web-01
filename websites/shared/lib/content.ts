/** Build-time helpers shared by the Astro sites' pages. */
import { resolve } from 'node:path';
import type { LessonLink, SiteConfig } from './site.ts';

interface Sortable {
  id: string;
  data: { source: string; part: number; title: string };
}

/** Absolute path of a curriculum file in the repository root (sites build from websites/<site>). */
export const repoPath = (file: string): string => resolve(process.cwd(), '../..', file);

export const withBase = (path: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

export const lessonHref = (id: string): string => withBase(`/learn/${id}/`);

/** Lessons in curriculum order: source files in site order, then PART number. */
export function sortLessons<T extends Sortable>(site: SiteConfig, entries: T[]): T[] {
  const order = site.sources.map((s) => s.file);
  return [...entries].sort(
    (a, b) =>
      order.indexOf(a.data.source) - order.indexOf(b.data.source) || a.data.part - b.data.part,
  );
}

export const toLink = (entry: Sortable | undefined): LessonLink | undefined =>
  entry && { href: lessonHref(entry.id), title: entry.data.title, part: entry.data.part };

export const sourceLabel = (site: SiteConfig, file: string): string =>
  site.sources.find((s) => s.file === file)?.label ?? file;
