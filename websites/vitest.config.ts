import { defineConfig } from 'vitest/config';

// One test run covers the shared package and every site's unit tests.
export default defineConfig({
  test: {
    include: ['shared/test/**/*.test.ts', '*/test/unit/**/*.test.ts'],
    environment: 'node',
  },
});
