/**
 * The server half of passkeys (WebAuthn Level 3), for the ES256 algorithm, with `attestation:
 * 'none'` (we trust the authenticator's public key, not its make and model). Registration stores
 * the public key the browser hands over (AuthenticatorAttestationResponse.getPublicKey(), SPKI);
 * sign-in verifies:
 *   1. clientDataJSON: type, the challenge we issued, and the exact origin (phishing resistance);
 *   2. authenticatorData: the SHA-256 of our RP ID, and the user-present flag;
 *   3. the signature over authenticatorData ‖ SHA-256(clientDataJSON) with the stored key;
 *   4. the signature counter, which should never go backwards (cloned-authenticator signal).
 */
import { createHash, createPublicKey, verify } from 'node:crypto';

export interface AuthenticatorData {
  rpIdHash: Buffer;
  userPresent: boolean;
  userVerified: boolean;
  signCount: number;
}

export function parseAuthenticatorData(data: Buffer): AuthenticatorData {
  if (data.length < 37) throw new Error('authenticatorData is too short');
  const flags = data[32] ?? 0;
  return {
    rpIdHash: data.subarray(0, 32),
    userPresent: (flags & 0x01) !== 0,
    userVerified: (flags & 0x04) !== 0,
    signCount: data.readUInt32BE(33),
  };
}

export interface ClientData {
  type: string;
  challenge: string;
  origin: string;
}

export function checkClientData(
  clientDataJSON: Buffer,
  expected: { type: 'webauthn.create' | 'webauthn.get'; challenge: string; origin: string },
): ClientData {
  const data = JSON.parse(clientDataJSON.toString('utf8')) as ClientData;
  if (data.type !== expected.type) throw new Error(`Wrong ceremony type: ${data.type}`);
  if (data.challenge !== expected.challenge)
    throw new Error('Challenge mismatch (replayed or stale)');
  if (data.origin !== expected.origin)
    throw new Error(`Origin ${data.origin} is not ${expected.origin}`);
  return data;
}

export function checkAuthenticatorData(authData: Buffer, rpId: string): AuthenticatorData {
  const parsed = parseAuthenticatorData(authData);
  const expected = createHash('sha256').update(rpId).digest();
  if (!parsed.rpIdHash.equals(expected)) throw new Error('Credential is for a different RP ID');
  if (!parsed.userPresent) throw new Error('User presence flag not set');
  return parsed;
}

/** Verifies an assertion signature (ES256: ECDSA P-256 with SHA-256, DER-encoded). */
export function verifyAssertion(input: {
  publicKeySpki: Buffer;
  authenticatorData: Buffer;
  clientDataJSON: Buffer;
  signature: Buffer;
}): boolean {
  const key = createPublicKey({ key: input.publicKeySpki, format: 'der', type: 'spki' });
  const signed = Buffer.concat([
    input.authenticatorData,
    createHash('sha256').update(input.clientDataJSON).digest(),
  ]);
  return verify('sha256', signed, key, input.signature);
}

export const b64url = (value: string | undefined): Buffer => Buffer.from(value ?? '', 'base64url');
