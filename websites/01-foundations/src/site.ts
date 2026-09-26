import type { SiteConfig } from '@learn/shared/lib/site.ts';

export const site: SiteConfig = {
  id: '01-foundations',
  name: 'Foundations',
  tagline: 'HTML & CSS, from the parser to taste',
  description:
    'A hands-on course through every part of the HTML & CSS curriculum: the parser, semantics, forms, the cascade, layout algorithms, typography, colour, motion, architecture, performance, the server, other targets, resilience, security and taste.',
  brandHue: 35,
  nav: [
    { href: '/start/', label: 'Start here' },
    { href: '/learn/', label: 'All parts' },
    { href: '/dojo/', label: 'Dojo' },
    { href: '/capstones/', label: 'Capstones' },
    { href: '/path/', label: 'Path' },
    { href: '/resources/', label: 'Resources' },
  ],
  sources: [
    { file: 'L1-coding-html-css.md', label: 'L1 HTML & CSS', route: '/learn/' },
    { file: 'T1-coding-html-css.md', label: 'T1 Training', route: '/dojo/' },
  ],
};

/** Chapters follow the source's Suggested Learning Order. */
export const chapters = [
  { title: 'The document', parts: [0, 1, 2], blurb: 'Parsing, semantics and HTML that works unstyled.' },
  { title: 'Cascade & formatting model', parts: [8, 9, 10], blurb: 'Which rule wins, and which algorithm is in charge.' },
  { title: 'Layout', parts: [11, 12, 13], blurb: 'Flexbox, grid and intrinsic, fluid, container-aware design.' },
  { title: 'Native platform', parts: [3, 4, 5, 6, 7], blurb: 'Forms, media, SVG, metadata and the accessibility tree.' },
  { title: 'Beautiful', parts: [14, 15, 18], blurb: 'Typography, colour and the design fundamentals.' },
  { title: 'Motion', parts: [16, 17], blurb: 'Micro-interactions, scroll timelines and view transitions.' },
  { title: 'Systems', parts: [19, 20], blurb: 'Tokens, architecture, design systems, web components.' },
  { title: 'Ship it', parts: [21, 22], blurb: 'Rendering performance and server-rendered HTML.' },
  { title: 'Everywhere, safely', parts: [23, 24, 25], blurb: 'Email, print, resilience, i18n and security.' },
  { title: 'For life', parts: [26, 27], blurb: 'Taste development and professional growth.' },
];
