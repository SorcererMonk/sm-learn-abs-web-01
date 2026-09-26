/**
 * Grades a response's security headers the way a scanner (securityheaders.com, Mozilla
 * Observatory) would. Pure: runs in the browser for the header audit lab and in unit tests.
 */
export interface HeaderGrade {
  header: string;
  present: boolean;
  value?: string;
  verdict: 'good' | 'weak' | 'missing';
  why: string;
}

/** Grades a response's headers the way a security-headers scanner would (used by the audit lab). */
export function gradeHeaders(get: (name: string) => string | null, https: boolean): HeaderGrade[] {
  const grade = (
    header: string,
    check: (value: string) => [HeaderGrade['verdict'], string],
    missingWhy: string,
  ): HeaderGrade => {
    const value = get(header);
    if (value === null) return { header, present: false, verdict: 'missing', why: missingWhy };
    const [verdict, why] = check(value);
    return { header, present: true, value, verdict, why };
  };
  const rows = [
    grade(
      'Content-Security-Policy',
      (v) => {
        if (/script-src[^;]*'unsafe-inline'/.test(v) && !/'nonce-|'sha(256|384|512)-/.test(v))
          return [
            'weak',
            "'unsafe-inline' scripts without nonces or hashes defeat the XSS defence",
          ];
        if (!/script-src|default-src/.test(v))
          return [
            'weak',
            'No script-src: limits plugins, <base> and framing but not injected scripts',
          ];
        return ['good', 'Restricts where scripts may come from'];
      },
      'No policy: any injected script runs',
    ),
    grade(
      'X-Content-Type-Options',
      (v) =>
        v.toLowerCase() === 'nosniff'
          ? ['good', 'Browsers trust Content-Type instead of sniffing']
          : ['weak', 'Only "nosniff" is meaningful'],
      'Browsers may sniff an upload into executable HTML or script',
    ),
    grade(
      'Referrer-Policy',
      (v) =>
        /unsafe-url|no-referrer-when-downgrade/.test(v)
          ? ['weak', 'Leaks full URLs (with query strings) to other sites']
          : ['good', 'Other sites see at most the origin'],
      'Browser default applies (strict-origin-when-cross-origin in modern browsers)',
    ),
    grade(
      'Permissions-Policy',
      () => ['good', 'Powerful features are disabled unless this origin needs them'],
      'Any embedded frame may ask for camera, microphone, geolocation…',
    ),
    grade(
      'Cross-Origin-Opener-Policy',
      (v) =>
        v.startsWith('same-origin')
          ? ['good', 'Popups from other origins cannot keep a handle on this window']
          : ['weak', 'Cross-origin windows can hold a reference to this one'],
      'Cross-origin popups can navigate or probe this window (XS-Leaks)',
    ),
    grade(
      'X-Frame-Options',
      (v) =>
        /deny|sameorigin/i.test(v)
          ? ['good', 'Legacy framing protection (CSP frame-ancestors is the modern one)']
          : ['weak', 'ALLOW-FROM is not supported anywhere'],
      'Other sites may frame this page (clickjacking) unless CSP frame-ancestors says otherwise',
    ),
  ];
  if (https)
    rows.push(
      grade(
        'Strict-Transport-Security',
        (v) =>
          Number(/max-age=(\d+)/.exec(v)?.[1] ?? 0) >= 31536000
            ? ['good', 'Browsers refuse plain HTTP for this host for a year or more']
            : ['weak', 'max-age under a year'],
        'The first request can be downgraded to HTTP (SSL stripping)',
      ),
    );
  return rows;
}
