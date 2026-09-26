/**
 * `npm run dev`: the Node backend on :4400 plus Astro's dev server on :4321, which proxies
 * /api, /lab and /ws to the backend (astro.config.mjs). Stopping one stops both.
 */
import { spawn } from 'node:child_process';

const backend = spawn(
  process.execPath,
  ['--no-warnings=ExperimentalWarning', '--watch', 'server/main.ts', '--port', '4400'],
  { stdio: 'inherit' },
);
const astro = spawn('npx', ['astro', 'dev'], { stdio: 'inherit', shell: true });
const stop = (): void => {
  backend.kill();
  astro.kill();
};
backend.on('exit', stop);
astro.on('exit', stop);
process.on('SIGINT', stop);
