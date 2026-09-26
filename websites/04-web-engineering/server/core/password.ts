/**
 * Password storage: a slow, salted, memory-hard hash (scrypt) and a constant-time comparison.
 * Stored as `scrypt$N$r$p$salt$hash` so parameters can be raised later without breaking old hashes.
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const N = 16384;
const R = 8;
const P = 1;

export function hashPassword(password: string, salt = randomBytes(16)): string {
  const hash = scryptSync(password.normalize('NFKC'), salt, 32, { N, r: R, p: P });
  return ['scrypt', N, R, P, salt.toString('base64url'), hash.toString('base64url')].join('$');
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, n, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = scryptSync(
    password.normalize('NFKC'),
    Buffer.from(salt, 'base64url'),
    expected.length,
    {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    },
  );
  return timingSafeEqual(actual, expected);
}
