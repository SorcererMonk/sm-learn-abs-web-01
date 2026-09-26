/**
 * Frontmatter contract for every lesson (one MDX file per PART of an L file).
 * Body rule: one `## ` section per source bullet, in source order, so coverage can pair them.
 */
import { z } from 'astro/zod';

export const quizQuestionSchema = z.object({
  q: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  why: z.string(),
});

export const lessonSchema = z.object({
  title: z.string(),
  source: z.string(),
  part: z.number().int().min(0),
  tier: z.string(),
  summary: z.string(),
  /** Optional grouping for sites that combine several source files. */
  track: z.string().optional(),
  anchors: z.array(z.string()).min(1),
  checks: z.array(z.object({ q: z.string(), a: z.string() })),
  /** The Part's Build (L1/L18) or Analysis (L8) project. */
  build: z.string(),
  /** Break the Build into concrete steps with acceptance checks. */
  steps: z.array(z.string()).default([]),
  taste: z.string(),
  quiz: z.array(quizQuestionSchema).default([]),
});

export type LessonData = z.infer<typeof lessonSchema>;
