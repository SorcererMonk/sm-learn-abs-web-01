import { defineConfig, devices } from '@playwright/test';

const port = 4330;

export default defineConfig({
  testDir: 'test/e2e',
  fullyParallel: true,
  reporter: [['list']],
  timeout: 60_000,
  use: { baseURL: `http://localhost:${port}` },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 } },
    },
  ],
  webServer: {
    command: `npm run build && node ../shared/tools/serve.ts --site 01-foundations --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
