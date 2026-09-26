/**
 * The header set every response carries. Routes may override single headers (the CSP lab sets
 * its own policy, the CORS lab its own CORP), but nothing ships without this baseline.
 *
 * Why this site's pages don't enforce `script-src`: its playgrounds run learners' code in
 * sandboxed srcdoc iframes, and a srcdoc document inherits its parent's CSP. A production code
 * playground runs that code on a separate origin instead; the CSP lab shows the strict policy.
 */
export interface HeaderOptions {
  /** True when the request arrived over HTTPS (directly or via a trusted proxy). */
  https: boolean;
}

export const BASELINE_CSP = [
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
].join('; ');

export function securityHeaders({ https }: HeaderOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Security-Policy': BASELINE_CSP,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Frame-Options': 'SAMEORIGIN',
  };
  // HSTS is only meaningful (and only honoured) over HTTPS; on http://localhost it is ignored.
  if (https) headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
  return headers;
}
