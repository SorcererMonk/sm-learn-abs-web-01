import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  server: { port: 4321 },
});
