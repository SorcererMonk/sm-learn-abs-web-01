import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { lessonSchema } from '@learn/shared/lib/lesson-schema.ts';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: lessonSchema,
});

export const collections = { lessons };
