/** Per-site configuration, defined in each site's src/site.ts. */
export interface NavLink {
  href: string;
  label: string;
}

export interface SourceFile {
  /** File name in the repository root, e.g. "L1-coding-html-css.md". */
  file: string;
  /** Short label used in chips and tables, e.g. "L1 HTML & CSS". */
  label: string;
  /** Lesson route prefix for learning files, e.g. "/learn/". Training files map to a dojo route. */
  route: string;
}

export interface SiteConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  brandHue: number;
  nav: NavLink[];
  sources: SourceFile[];
}

export interface LessonLink {
  href: string;
  title: string;
  part: number;
}
