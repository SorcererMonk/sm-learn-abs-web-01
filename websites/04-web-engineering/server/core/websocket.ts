/**
 * A WebSocket server (RFC 6455) written from scratch, to see what libraries hide:
 * the HTTP Upgrade handshake, frame parsing with client masking, fragmentation, ping/pong
 * heartbeats, the close handshake, a message-size limit and an Origin check (browsers send cookies
 * with WebSocket handshakes, so a cross-site page could otherwise open an authenticated socket).
 */
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

export const OP = {
  continuation: 0x0,
  text: 0x1,
  binary: 0x2,
  close: 0x8,
  ping: 0x9,
  pong: 0xa,
} as const;

/** Sec-WebSocket-Accept: proves the server understood this specific handshake. */
export const acceptKey = (key: string): string =>
  createHash('sha1')
    .update(key + GUID)
    .digest('base64');

/** Encodes one unmasked frame (servers never mask). */
export function encodeFrame(opcode: number, payload: Buffer = Buffer.alloc(0), fin = true): Buffer {
  const length = payload.length;
  const header =
    length < 126 ? Buffer.alloc(2) : length < 65536 ? Buffer.alloc(4) : Buffer.alloc(10);
  header[0] = (fin ? 0x80 : 0) | opcode;
  if (length < 126) header[1] = length;
  else if (length < 65536) {
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }
  return Buffer.concat([header, payload]);
}

export interface Frame {
  fin: boolean;
  opcode: number;
  payload: Buffer;
}

/** Incremental parser: TCP delivers bytes, not frames, so partial frames wait for more data. */
export class FrameParser {
  private buffer = Buffer.alloc(0);
  private readonly maxPayload: number;

  constructor(maxPayload = 64 * 1024) {
    this.maxPayload = maxPayload;
  }

  push(chunk: Buffer): Frame[] {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    const frames: Frame[] = [];
    for (;;) {
      if (this.buffer.length < 2) break;
      const b0 = this.buffer[0] ?? 0;
      const b1 = this.buffer[1] ?? 0;
      const masked = (b1 & 0x80) !== 0;
      let length = b1 & 0x7f;
      let offset = 2;
      if (length === 126) {
        if (this.buffer.length < 4) break;
        length = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) break;
        const big = this.buffer.readBigUInt64BE(2);
        if (big > BigInt(this.maxPayload)) throw new RangeError('Frame too large');
        length = Number(big);
        offset = 10;
      }
      if (!masked) throw new Error('Client frames must be masked (RFC 6455 §5.1)');
      if (length > this.maxPayload) throw new RangeError('Frame too large');
      if (this.buffer.length < offset + 4 + length) break;
      const mask = this.buffer.subarray(offset, offset + 4);
      const payload = Buffer.from(this.buffer.subarray(offset + 4, offset + 4 + length));
      for (let i = 0; i < payload.length; i += 1)
        payload[i] = (payload[i] ?? 0) ^ (mask[i % 4] ?? 0);
      frames.push({ fin: (b0 & 0x80) !== 0, opcode: b0 & 0x0f, payload });
      this.buffer = this.buffer.subarray(offset + 4 + length);
    }
    return frames;
  }
}

export interface Connection extends EventEmitter {
  readonly id: string;
  send(text: string): void;
  close(code?: number, reason?: string): void;
  /** Drops the TCP connection without a close frame (what a crash or network loss looks like). */
  terminate(): void;
  on(event: 'message', listener: (text: string) => void): this;
  on(event: 'close', listener: (code: number) => void): this;
}

export interface AcceptOptions {
  /** Origins allowed to open a socket (compare exactly). */
  allowedOrigins: (origin: string | undefined, host: string | undefined) => boolean;
  heartbeatMs?: number;
  maxPayload?: number;
  id: string;
}

/** Completes the handshake and returns a connection, or rejects the upgrade with an HTTP status. */
export function acceptWebSocket(
  req: IncomingMessage,
  socket: Duplex,
  options: AcceptOptions,
): Connection | undefined {
  const reject = (status: number, text: string): undefined => {
    socket.end(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
    return undefined;
  };
  const key = req.headers['sec-websocket-key'];
  if (req.headers.upgrade?.toLowerCase() !== 'websocket' || typeof key !== 'string')
    return reject(400, 'Bad Request');
  if (req.headers['sec-websocket-version'] !== '13') return reject(426, 'Upgrade Required');
  if (!options.allowedOrigins(req.headers.origin, req.headers.host))
    return reject(403, 'Forbidden');

  socket.write(
    [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey(key)}`,
      '',
      '',
    ].join('\r\n'),
  );

  const emitter = new EventEmitter() as Connection;
  const parser = new FrameParser(options.maxPayload);
  let fragments: Buffer[] = [];
  let closed = false;
  let alive = true;

  const finish = (code: number): void => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    emitter.emit('close', code);
  };
  const write = (frame: Buffer): void => {
    if (!closed && socket.writable) socket.write(frame);
  };

  Object.assign(emitter, {
    id: options.id,
    send: (text: string) => write(encodeFrame(OP.text, Buffer.from(text))),
    close: (code = 1000, reason = '') => {
      const payload = Buffer.alloc(2 + Buffer.byteLength(reason));
      payload.writeUInt16BE(code, 0);
      payload.write(reason, 2);
      write(encodeFrame(OP.close, payload));
      socket.end();
      finish(code);
    },
    terminate: () => {
      socket.destroy();
      finish(1006);
    },
  });

  // Heartbeat: ping regularly; a peer that never pongs is gone (NAT timeouts, sleeping laptops).
  const heartbeat = setInterval(() => {
    if (!alive) {
      emitter.terminate();
      return;
    }
    alive = false;
    write(encodeFrame(OP.ping));
  }, options.heartbeatMs ?? 15_000);
  heartbeat.unref();

  socket.on('data', (chunk: Buffer) => {
    let frames: Frame[];
    try {
      frames = parser.push(chunk);
    } catch {
      emitter.close(1009, 'Protocol error or message too big');
      return;
    }
    for (const frame of frames) {
      if (frame.opcode === OP.ping) write(encodeFrame(OP.pong, frame.payload));
      else if (frame.opcode === OP.pong) alive = true;
      else if (frame.opcode === OP.close) {
        const code = frame.payload.length >= 2 ? frame.payload.readUInt16BE(0) : 1005;
        write(encodeFrame(OP.close, frame.payload.subarray(0, 2)));
        socket.end();
        finish(code);
      } else if (frame.opcode === OP.text || frame.opcode === OP.continuation) {
        fragments.push(frame.payload);
        if (frame.fin) {
          const text = Buffer.concat(fragments).toString('utf8');
          fragments = [];
          emitter.emit('message', text);
        }
      } else if (frame.opcode === OP.binary) {
        emitter.close(1003, 'Binary messages are not supported');
      }
    }
  });
  socket.on('close', () => finish(1006));
  socket.on('error', () => finish(1006));
  return emitter;
}
