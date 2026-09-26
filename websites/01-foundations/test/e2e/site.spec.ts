import { fileURLToPath } from 'node:url';
import { defineSiteSmokeTests, siteRoutes } from '@learn/shared/e2e/site-smoke.ts';

defineSiteSmokeTests(siteRoutes(fileURLToPath(new URL('../..', import.meta.url))));
