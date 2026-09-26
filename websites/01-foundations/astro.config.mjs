import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { rehypeShortCode } from '@learn/shared/lib/rehype-short-code.ts';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
    rehypePlugins: [rehypeShortCode],
  },
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  server: { port: 4321 },
});
