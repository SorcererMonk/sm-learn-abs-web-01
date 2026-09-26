/** Heading ids exactly as Astro generates them (github-slugger), so anchors in
 *  coverage reports and rendered pages always agree. */
import { slug } from 'github-slugger';

export const slugify = (text: string): string => slug(text.replace(/[`*]/g, ''));
