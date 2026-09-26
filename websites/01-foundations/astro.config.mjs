import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import { rehypeShortCode } from '@learn/shared/lib/rehype-short-code.ts';
import { rehypeTableScroll } from '@learn/shared/lib/rehype-table-scroll.ts';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    processor: unified({ rehypePlugins: [rehypeShortCode, rehypeTableScroll] }),
    shikiConfig: {
      // the high-contrast variants keep every token at 4.5:1 or better (WCAG 1.4.3)
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
    },
  },
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  server: { port: 4321 },
});
