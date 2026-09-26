/**
 * A framework-free "server" small enough to run in the browser, for teaching what the backend
 * of markup does: route requests, render auto-escaped HTML, parse urlencoded forms, validate
 * on the server, protect with a CSRF token, and answer a successful POST with 303 See Other
 * (Post/Redirect/Get). The same shapes as a Node handler, minus the socket.
 */
import { html, raw, render, type SafeHtml } from './html-template.ts';

export interface Req {
  method: 'GET' | 'POST';
  path: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface Res {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

export interface ServerOptions {
  /** false = answer a successful POST with 200 directly (no PRG), to show the refresh problem */
  prg?: boolean;
  csrfToken?: string;
}

export interface Message {
  name: string;
  email: string;
  message: string;
}

const STATUS: Record<number, string> = {
  200: 'OK',
  303: 'See Other',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  422: 'Unprocessable Content',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/** application/x-www-form-urlencoded → plain object (last value wins). */
export function parseForm(body = ''): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(body));
}

export type Errors = Partial<Record<keyof Message, string>>;

export function validate(input: Partial<Message>): Errors {
  const errors: Errors = {};
  if (!input.name?.trim()) errors.name = 'Enter your name';
  if (!input.email?.trim()) errors.email = 'Enter your email address';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    errors.email = 'Enter an email address like name@example.com';
  if ((input.message?.trim().length ?? 0) < 10)
    errors.message = 'Write a message of at least 10 characters';
  return errors;
}

const labels: Record<keyof Message, string> = {
  name: 'Your name',
  email: 'Email address',
  message: 'Message',
};

function layout(title: string, content: SafeHtml): SafeHtml {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
      </head>
      <body>
        <main>${content}</main>
      </body>
    </html>`;
}

function field(name: keyof Message, value: string, error?: string): SafeHtml {
  const id = `f-${name}`;
  const describedBy = error ? ` aria-describedby="${id}-error" aria-invalid="true"` : '';
  const input =
    name === 'message'
      ? html`<textarea id="${id}" name="${name}" ${raw(describedBy)}>${value}</textarea>`
      : html`<input
          id="${id}"
          name="${name}"
          type="${name === 'email' ? 'email' : 'text'}"
          value="${value}"
          ${raw(describedBy)}
        />`;
  return html`<div class="field">
    <label for="${id}">${labels[name]}</label>
    ${error ? html`<p class="error" id="${id}-error">${error}</p>` : ''} ${input}
  </div>`;
}

export function contactPage(values: Partial<Message>, errors: Errors, token: string): string {
  const keys = Object.keys(errors) as (keyof Message)[];
  const summary = keys.length
    ? html`<div class="error-summary" role="alert" tabindex="-1">
        <h2>There is a problem</h2>
        <ul>
          ${keys.map((k) => html`<li><a href="#f-${k}">${errors[k]}</a></li>`)}
        </ul>
      </div>`
    : '';
  return render(
    layout(
      keys.length ? 'Error: Contact us' : 'Contact us',
      html`<h1>Contact us</h1>
        ${summary}
        <form method="post" action="/contact" novalidate>
          <input type="hidden" name="csrf" value="${token}" />
          ${field('name', values.name ?? '', errors.name)}
          ${field('email', values.email ?? '', errors.email)}
          ${field('message', values.message ?? '', errors.message)}
          <button>Send message</button>
        </form>`,
    ),
  );
}

export function createServer(options: ServerOptions = {}) {
  const { prg = true, csrfToken = 'k3v9-demo-token' } = options;
  const messages: Message[] = [];

  const respond = (status: number, body: string, headers: Record<string, string> = {}): Res => ({
    status,
    statusText: STATUS[status] ?? '',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      'Content-Length': String(new TextEncoder().encode(body).length),
      ...headers,
    },
    body,
  });

  const notFound = (): Res =>
    respond(
      404,
      render(
        layout(
          'Page not found',
          html`<h1>Page not found</h1>
            <p><a href="/contact">Go to the contact form</a></p>`,
        ),
      ),
    );

  function handle(req: Req): Res {
    const path = req.path.split('?')[0];
    if (path === '/contact') {
      if (req.method === 'GET') return respond(200, contactPage({}, {}, csrfToken));
      const form = parseForm(req.body);
      if (form.csrf !== csrfToken)
        return respond(
          403,
          render(
            layout(
              'Forbidden',
              html`<h1>Forbidden</h1>
                <p>
                  The form expired or was submitted from another site. Reload the page and try
                  again.
                </p>`,
            ),
          ),
        );
      const values: Message = {
        name: form.name ?? '',
        email: form.email ?? '',
        message: form.message ?? '',
      };
      const errors = validate(values);
      if (Object.keys(errors).length) return respond(422, contactPage(values, errors, csrfToken));
      messages.push(values);
      if (!prg)
        return respond(
          200,
          render(
            layout(
              'Thanks',
              html`<h1>Thanks, ${values.name}</h1>
                <p>Messages received so far: ${messages.length}</p>`,
            ),
          ),
        );
      return respond(303, '', { Location: '/contact/thanks' });
    }
    if (path === '/contact/thanks' && req.method === 'GET') {
      const last = messages.at(-1);
      return respond(
        200,
        render(
          layout(
            'Message sent',
            html`<h1>Thanks${last ? html`, ${last.name}` : ''}</h1>
              <p>Messages received so far: ${messages.length}</p>
              <p><a href="/contact">Send another</a></p>`,
          ),
        ),
      );
    }
    return notFound();
  }

  return { handle, messages };
}

/** The raw HTTP/1.1 text of a request or response, for showing on the wire. */
export function formatRequest(req: Req): string {
  const headers = {
    Host: 'shop.example',
    ...(req.method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    ...req.headers,
  };
  return [
    `${req.method} ${req.path} HTTP/1.1`,
    ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`),
    '',
    req.body ?? '',
  ].join('\n');
}

export function formatResponse(res: Res, bodyPreview = 240): string {
  const body = res.body.length > bodyPreview ? `${res.body.slice(0, bodyPreview)}…` : res.body;
  return [
    `HTTP/1.1 ${res.status} ${res.statusText}`,
    ...Object.entries(res.headers).map(([k, v]) => `${k}: ${v}`),
    '',
    body,
  ].join('\n');
}
