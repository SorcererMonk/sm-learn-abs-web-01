/**
 * Three ways to push updates, sharing one message log with sequence numbers:
 * - WebSocket /ws/chat: two-way chat with presence; a client resumes with `lastSeq` and the server
 *   replays what it missed, so reconnection never loses or duplicates messages;
 * - Server-Sent Events /api/sse/ticks: one-way, auto-reconnecting, resumed with Last-Event-ID;
 * - polling /api/realtime/messages?since=: the honest fallback.
 * POST /api/realtime/drop kills every socket without a close frame, to rehearse reconnection.
 */
import type { ServerResponse } from 'node:http';
import type { Deps } from '../app.ts';
import { HttpError, json, readJson } from '../core/http.ts';
import type { Router } from '../core/router.ts';
import { acceptWebSocket, type Connection } from '../core/websocket.ts';

export interface ChatMessage {
  seq: number;
  name: string;
  text: string;
  clientId: string;
  at: string;
}

/** Same host (any port on localhost/127.0.0.1 counts as this lab's own pages) or no Origin. */
export function sameOrigin(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function registerRealtime(router: Router, deps: Deps): void {
  const log: ChatMessage[] = [];
  let seq = 0;
  let nextConnection = 1;
  const sockets = new Map<Connection, { name: string }>();
  const streams = new Set<ServerResponse>();

  const broadcast = (payload: unknown): void => {
    const text = JSON.stringify(payload);
    for (const socket of sockets.keys()) socket.send(text);
  };
  const presence = (): void => {
    broadcast({ type: 'presence', online: [...sockets.values()].map((s) => s.name) });
  };
  const append = (name: string, text: string, clientId: string): ChatMessage => {
    const message = { seq: ++seq, name, text, clientId, at: new Date(deps.now()).toISOString() };
    log.push(message);
    if (log.length > 200) log.shift();
    return message;
  };

  deps.upgrades.set('/ws/chat', (req, socket) => {
    const conn = acceptWebSocket(req, socket, {
      allowedOrigins: sameOrigin,
      heartbeatMs: 10_000,
      id: String(nextConnection++),
    });
    if (!conn) return;
    sockets.set(conn, { name: `guest-${conn.id}` });
    deps.logger.write('info', 'websocket connected', { connection: conn.id });
    conn.on('message', (raw) => {
      let msg: { type?: string; name?: string; text?: string; clientId?: string; lastSeq?: number };
      try {
        msg = JSON.parse(raw) as typeof msg;
      } catch {
        conn.send(JSON.stringify({ type: 'error', error: 'Send JSON' }));
        return;
      }
      if (msg.type === 'ping') {
        // Application-level heartbeat: browsers can't send WebSocket ping frames from JavaScript.
        conn.send(JSON.stringify({ type: 'pong' }));
      } else if (msg.type === 'hello') {
        const name =
          String(msg.name ?? '')
            .replace(/[^\w -]/g, '')
            .slice(0, 24) || `guest-${conn.id}`;
        sockets.set(conn, { name });
        // Resume: everything after the client's last seen sequence number, in order.
        const missed = log.filter((m) => m.seq > Number(msg.lastSeq ?? 0));
        conn.send(JSON.stringify({ type: 'welcome', seq, missed }));
        presence();
      } else if (msg.type === 'msg' && msg.text) {
        const message = append(
          sockets.get(conn)?.name ?? 'guest',
          String(msg.text).slice(0, 500),
          String(msg.clientId ?? ''),
        );
        broadcast({ type: 'msg', message });
      }
    });
    conn.on('close', (code) => {
      sockets.delete(conn);
      deps.logger.write('info', 'websocket closed', { connection: conn.id, code });
      presence();
    });
  });

  router.post('/api/realtime/drop', ({ res }) => {
    const count = sockets.size;
    for (const conn of [...sockets.keys()]) conn.terminate();
    for (const stream of streams) stream.destroy();
    json(res, 200, { dropped: count + streams.size });
  });

  router.post('/api/realtime/send', async ({ req, res }) => {
    const { name = 'poller', text = '' } = await readJson<{ name?: string; text?: string }>(
      req,
      2_000,
    );
    if (!text.trim()) throw new HttpError(422, 'Empty message');
    const message = append(name.slice(0, 24), text.slice(0, 500), '');
    broadcast({ type: 'msg', message });
    json(res, 201, message);
  });

  router.get('/api/realtime/messages', ({ res, url }) => {
    const since = Number(url.searchParams.get('since') ?? 0);
    json(res, 200, { seq, messages: log.filter((m) => m.seq > since) });
  });

  // SSE: text/event-stream, one event per tick, resumable from Last-Event-ID.
  router.get('/api/sse/ticks', ({ req, res }) => {
    const lastId = Number(req.headers['last-event-id'] ?? 0);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(`retry: 2000\n`);
    res.write(`: resuming after event ${lastId}\n\n`);
    let id = lastId;
    streams.add(res);
    const timer = setInterval(() => {
      id += 1;
      res.write(
        `id: ${id}\nevent: tick\ndata: ${JSON.stringify({ id, at: new Date(deps.now()).toISOString(), online: sockets.size })}\n\n`,
      );
    }, 1000);
    const stop = (): void => {
      clearInterval(timer);
      streams.delete(res);
    };
    req.on('close', stop);
  });

  // Graceful shutdown: tell sockets why (1001 Going Away) and end open event streams.
  deps.onClose(() => {
    for (const conn of sockets.keys()) conn.close(1001, 'Server shutting down');
    for (const stream of streams) stream.end();
  });
}
