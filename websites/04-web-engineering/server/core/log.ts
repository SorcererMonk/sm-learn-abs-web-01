/**
 * Structured logging: every entry is one JSON object carrying the request ID, so a browser error
 * report, an access-log line and a slow-query warning can be joined on one key. Entries also go
 * to a ring buffer that the observability lab reads back through /api/logs.
 */
export type Level = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  time: string;
  level: Level;
  msg: string;
  requestId?: string;
  [field: string]: unknown;
}

export interface Logger {
  write(level: Level, msg: string, fields?: Record<string, unknown>): LogEntry;
  recent(filter?: { requestId?: string; limit?: number; level?: Level }): LogEntry[];
  /** A logger bound to one request, so handlers never forget the ID. */
  bound: (level: Level, msg: string, fields?: Record<string, unknown>) => void;
  forRequest(requestId: string): Logger['bound'];
}

const ORDER: Level[] = ['debug', 'info', 'warn', 'error'];

export function createLogger(
  options: { capacity?: number; sink?: (line: string) => void; now?: () => Date } = {},
): Logger {
  const { capacity = 1000, sink, now = () => new Date() } = options;
  const buffer: LogEntry[] = [];
  const write = (level: Level, msg: string, fields: Record<string, unknown> = {}): LogEntry => {
    const entry: LogEntry = { time: now().toISOString(), level, msg, ...fields };
    buffer.push(entry);
    if (buffer.length > capacity) buffer.shift();
    sink?.(JSON.stringify(entry));
    return entry;
  };
  const forRequest =
    (requestId: string): Logger['bound'] =>
    (level, msg, fields) => {
      write(level, msg, { requestId, ...fields });
    };
  return {
    write,
    forRequest,
    bound: (level, msg, fields) => {
      write(level, msg, fields);
    },
    recent({ requestId, limit = 50, level } = {}) {
      const min = level ? ORDER.indexOf(level) : 0;
      return buffer
        .filter((e) => (!requestId || e.requestId === requestId) && ORDER.indexOf(e.level) >= min)
        .slice(-limit);
    },
  };
}

const ID = /^[\w-]{8,64}$/;

/** Accepts a well-formed incoming X-Request-Id (from a proxy or the browser), else mints one. */
export function requestIdFrom(header: string | string[] | undefined, mint: () => string): string {
  const value = Array.isArray(header) ? header[0] : header;
  return value && ID.test(value) ? value : mint();
}
