import type { SiteConfig } from '@learn/shared/lib/site.ts';

export const site: SiteConfig = {
  id: '04-web-engineering',
  name: 'Web Engineering',
  tagline: 'The browser, the network, the server and the practice of shipping',
  description:
    'A hands-on course through every part of the web-engineering curriculum, with a real Node backend behind the labs: the browser as a runtime, platform APIs, architecture, the data layer, performance, accessibility, security, discoverability, the server, builds, testing, delivery, PWAs and taste.',
  brandHue: 200,
  nav: [
    { href: '/start/', label: 'Start here' },
    { href: '/learn/', label: 'All parts' },
    { href: '/dojo/', label: 'Dojo' },
    { href: '/capstones/', label: 'Capstones' },
    { href: '/path/', label: 'Path' },
    { href: '/resources/', label: 'Resources' },
  ],
  sources: [
    { file: 'L18-cs-web-engineering.md', label: 'L18 Web engineering', route: '/learn/' },
    { file: 'T18-cs-web-engineering.md', label: 'T18 Training', route: '/dojo/' },
  ],
  rum: '/api/rum',
};

/** Chapters follow the source's Suggested Learning Order. */
export const chapters = [
  {
    title: 'The platform',
    parts: [0, 2],
    blurb: 'Constraints, semantic HTML, the DOM and the core APIs.',
  },
  {
    title: 'Browser internals',
    parts: [1],
    blurb: 'Processes, the event loop and the rendering pipeline.',
  },
  {
    title: 'Accessibility',
    parts: [6],
    blurb: 'Early and permanently: the accessibility tree you ship.',
  },
  {
    title: 'Architecture & data',
    parts: [3, 4],
    blurb: 'Rendering strategies, state, caches and auth.',
  },
  {
    title: 'Performance',
    parts: [5],
    blurb: 'Core Web Vitals, field data and every loading lever.',
  },
  {
    title: 'Security',
    parts: [7],
    blurb: 'Origins, CORS, cookies, XSS, CSRF and the supply chain.',
  },
  {
    title: 'Build & test',
    parts: [10, 11],
    blurb: 'Bundlers, modules, the test pyramid and CI budgets.',
  },
  {
    title: 'Server & operations',
    parts: [9, 12],
    blurb: 'Caching layers, BFFs, jobs, releases and observability.',
  },
  {
    title: 'Reach',
    parts: [8, 13],
    blurb: 'Discoverability, metadata and the web as an app platform.',
  },
  {
    title: 'For life',
    parts: [14, 15],
    blurb: 'Taste and professional growth, one spec section a week.',
  },
];
