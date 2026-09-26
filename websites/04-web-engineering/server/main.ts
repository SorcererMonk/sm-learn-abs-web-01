/**
 * Entry point: serves dist/ and the API on one port, and shuts down gracefully.
 *
 *   node server/main.ts [--port 4400] [--log]
 *
 * On SIGINT/SIGTERM it stops accepting connections, closes idle keep-alive sockets, ends open
 * streams (SSE, WebSocket), and force-closes whatever is left after a grace period.
 */
import { createServer, type Server } from 'node:http';
import { resolve } from 'node:path';
import { createApp } from './app.ts';

export interface Started {
  server: Server;
  url: string;
  close: () => Promise<void>;
}

export async function start(
  options: { port?: number; root?: string; log?: boolean; secret?: string } = {},
): Promise<Started> {
  const root = options.root ?? resolve(import.meta.dirname, '..', 'dist');
  const app = createApp({
    root,
    release: process.env.RELEASE ?? 'local',
    secret: options.secret ?? process.env.SESSION_SECRET,
    logSink: options.log ? (line) => process.stdout.write(`${line}\n`) : undefined,
  });
  const server = createServer((req, res) => {
    void app.handle(req, res);
  });
  // Timeouts at the HTTP layer: slowloris protection and a ceiling on any single request.
  server.headersTimeout = 10_000;
  server.requestTimeout = 60_000;
  server.keepAliveTimeout = 5_000;
  server.on('upgrade', app.upgrade);
  await new Promise<void>((done) => server.listen(options.port ?? 4400, done));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : options.port;
  return {
    server,
    url: `http://localhost:${port}`,
    close: () =>
      new Promise<void>((done) => {
        app.close();
        server.close(() => done());
        server.closeIdleConnections();
        setTimeout(() => server.closeAllConnections(), 5_000).unref();
      }),
  };
}

if (import.meta.filename === process.argv[1]) {
  const args = process.argv.slice(2);
  const port = Number(args.includes('--port') ? args[args.indexOf('--port') + 1] : 4400);
  const started = await start({ port, log: args.includes('--log') });
  console.info(`Web engineering site and API on ${started.url}`);
  const stop = (signal: string): void => {
    console.info(`${signal}: draining connections…`);
    void started.close().then(() => process.exit(0));
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
