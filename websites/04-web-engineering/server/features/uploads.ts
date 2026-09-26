/**
 * Resumable, chunked uploads (the shape of tus and of S3 multipart uploads):
 * 1. POST /api/uploads {name, size, type} creates an upload and returns a *signed* upload URL,
 *    valid for 15 minutes; object storage would accept it without your session.
 * 2. PUT <upload URL> with Content-Range sends each chunk in order; a wrong offset is a 409.
 * 3. HEAD <upload URL> answers Upload-Offset, so an interrupted client resumes where it stopped.
 * 4. On the last chunk the server sniffs the real type from the bytes (never the extension or the
 *    declared type), hashes the file and accepts or rejects it.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Deps } from '../app.ts';
import { HttpError, json, readBody, readJson, send } from '../core/http.ts';
import type { Ctx, Router } from '../core/router.ts';

const MAX_SIZE = 5 * 1024 * 1024;
const CHUNK = 256 * 1024;
const ALLOWED = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
]);

/** Identifies a file by its first bytes ("magic numbers"). */
export function sniff(bytes: Buffer): string {
  const starts = (...sig: number[]): boolean => sig.every((b, i) => bytes[i] === b);
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (starts(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (starts(0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (starts(0x52, 0x49, 0x46, 0x46) && bytes.subarray(8, 12).toString('latin1') === 'WEBP')
    return 'image/webp';
  if (starts(0x25, 0x50, 0x44, 0x46, 0x2d)) return 'application/pdf';
  if (starts(0x4d, 0x5a)) return 'application/x-msdownload';
  const head = bytes.subarray(0, 512).toString('utf8').trimStart().toLowerCase();
  if (
    head.startsWith('<!doctype html') ||
    head.startsWith('<html') ||
    head.startsWith('<svg') ||
    head.includes('<script')
  )
    return 'text/html';
  const sample = bytes.subarray(0, 1024);
  return sample.every((b) => b === 9 || b === 10 || b === 13 || (b >= 32 && b !== 127))
    ? 'text/plain'
    : 'application/octet-stream';
}

interface Upload {
  id: string;
  name: string;
  size: number;
  declared: string;
  chunks: Buffer[];
  received: number;
  result?: { sha256: string; detected: string; accepted: boolean; reason: string };
}

export function registerUploads(router: Router, deps: Deps): void {
  const uploads = new Map<string, Upload>();
  const signature = (id: string, expires: number): string =>
    createHmac('sha256', deps.secret).update(`${id}:${expires}`).digest('base64url');

  const authorised = (ctx: Ctx): Upload => {
    const upload = uploads.get(ctx.params.id ?? '');
    if (!upload) throw new HttpError(404, 'No such upload');
    const expires = Number(ctx.url.searchParams.get('expires'));
    const sig = Buffer.from(ctx.url.searchParams.get('sig') ?? '');
    const expected = Buffer.from(signature(upload.id, expires));
    if (sig.length !== expected.length || !timingSafeEqual(sig, expected))
      throw new HttpError(403, 'Invalid upload signature');
    if (deps.now() > expires) throw new HttpError(403, 'This upload URL has expired');
    return upload;
  };

  router.post('/api/uploads', async (ctx) => {
    const {
      name = 'file',
      size = 0,
      type = '',
    } = await readJson<{ name?: string; size?: number; type?: string }>(ctx.req, 2_000);
    if (!Number.isInteger(size) || size <= 0)
      throw new HttpError(422, 'Declare the file size in bytes');
    if (size > MAX_SIZE)
      throw new HttpError(413, `Files are limited to ${MAX_SIZE / 1024 / 1024} MB`);
    const upload: Upload = {
      id: randomBytes(9).toString('base64url'),
      name: String(name)
        .replace(/[^\w.-]/g, '_')
        .slice(0, 80),
      size,
      declared: String(type).slice(0, 80),
      chunks: [],
      received: 0,
    };
    uploads.set(upload.id, upload);
    const expires = deps.now() + 15 * 60 * 1000;
    json(ctx.res, 201, {
      id: upload.id,
      chunkSize: CHUNK,
      uploadUrl: `/api/uploads/${upload.id}?expires=${expires}&sig=${signature(upload.id, expires)}`,
    });
  });

  router.on('HEAD', '/api/uploads/:id', (ctx) => {
    const upload = authorised(ctx);
    send(ctx.res, 200, '', {
      'Upload-Offset': String(upload.received),
      'Upload-Length': String(upload.size),
      'Cache-Control': 'no-store',
    });
  });

  router.put('/api/uploads/:id', async (ctx) => {
    const upload = authorised(ctx);
    const range = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(String(ctx.req.headers['content-range'] ?? ''));
    if (!range) throw new HttpError(400, 'Send Content-Range: bytes start-end/total');
    const start = Number(range[1]);
    const end = Number(range[2]);
    if (Number(range[3]) !== upload.size)
      throw new HttpError(422, 'Total size does not match the declared size');
    if (start !== upload.received)
      throw new HttpError(409, `Expected offset ${upload.received}`, {
        'Upload-Offset': String(upload.received),
      });
    const body = await readBody(ctx.req, CHUNK);
    if (body.length !== end - start + 1)
      throw new HttpError(400, 'Chunk length does not match Content-Range');
    upload.chunks.push(body);
    upload.received += body.length;
    if (upload.received < upload.size) {
      json(
        ctx.res,
        200,
        { received: upload.received, size: upload.size },
        { 'Upload-Offset': String(upload.received) },
      );
      return;
    }
    const file = Buffer.concat(upload.chunks);
    upload.chunks = [];
    const detected = sniff(file);
    const accepted = ALLOWED.has(detected);
    upload.result = {
      sha256: createHash('sha256').update(file).digest('hex'),
      detected,
      accepted,
      reason: accepted
        ? detected === upload.declared
          ? 'Content matches the declared type.'
          : `Accepted as ${detected} (declared ${upload.declared || 'nothing'}: the bytes win).`
        : `Rejected: the bytes are ${detected}, whatever the name says.`,
    };
    ctx.log(accepted ? 'info' : 'warn', 'upload complete', { id: upload.id, detected, accepted });
    json(ctx.res, accepted ? 201 : 415, { received: upload.received, ...upload.result });
  });
}
