/** Client for HttpInspector.astro: builds the request, sends it, renders the exchange. */
import { need } from '@learn/shared/client/controls.ts';
import { gradeHeaders } from '../lib/header-grade.ts';
import { parseServerTiming } from '../lib/server-timing.ts';
import { guard, logLine, pretty } from './api.ts';
import { parseHeaderLines, type Preset } from '../lib/inspector.ts';

interface Exchange {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
  ms: number;
  via: 'browser' | 'wire';
  note?: string;
}

async function viaBrowser(
  method: string,
  path: string,
  headers: Record<string, string>,
  body: string,
  preset?: Preset,
): Promise<Exchange> {
  const started = performance.now();
  try {
    const res = await fetch(path, {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' || !body ? undefined : body,
      credentials: preset?.credentials ?? 'same-origin',
      cache: preset?.cache ?? 'default',
    });
    const text = method === 'HEAD' ? '' : await res.text();
    const entry = performance.getEntriesByName(res.url).at(-1) as
      PerformanceResourceTiming | undefined;
    const fromCache = entry !== undefined && entry.transferSize === 0 && entry.decodedBodySize > 0;
    return {
      status: res.status,
      statusText: res.statusText,
      headers: [...res.headers.entries()],
      body: text,
      ms: Math.round(performance.now() - started),
      via: 'browser',
      note: [
        res.redirected ? `Followed a redirect to ${new URL(res.url).pathname}.` : '',
        fromCache ? 'Served from the browser cache: no bytes crossed the network.' : '',
        'Set-Cookie is never readable from scripts; switch to Raw wire to see it.',
      ]
        .filter(Boolean)
        .join(' '),
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network error',
      headers: [],
      body: String(error),
      ms: Math.round(performance.now() - started),
      via: 'browser',
      note: 'fetch() rejected: the browser blocked the request or the connection failed.',
    };
  }
}

async function viaWire(
  method: string,
  path: string,
  headers: Record<string, string>,
  body: string,
): Promise<Exchange> {
  const res = await fetch('/api/curl', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ method, path, headers, body: body || undefined }),
  });
  const data = (await res.json()) as {
    error?: string;
    response?: {
      status: number;
      statusText: string;
      headers: [string, string][];
      body: string;
      ms: number;
      httpVersion: string;
    };
  };
  if (!data.response)
    return {
      status: res.status,
      statusText: data.error ?? 'Error',
      headers: [],
      body: '',
      ms: 0,
      via: 'wire',
    };
  return {
    ...data.response,
    via: 'wire',
    note: `HTTP/${data.response.httpVersion}, exactly as sent.`,
  };
}

export function initHttpInspector(root: HTMLElement): void {
  const presets = JSON.parse(root.dataset.presets ?? '[]') as Preset[];
  const highlight = new Set((root.dataset.highlight ?? '').split(',').filter(Boolean));
  const form = need<HTMLFormElement>(root, '[data-hi-form]');
  const field = <T extends HTMLElement>(name: string): T => need<T>(form, `[name="${name}"]`);
  const status = need<HTMLElement>(root, '[data-hi-status]');
  const headersTable = need<HTMLTableElement>(root, '[data-hi-headers]');
  const timing = need<HTMLUListElement>(root, '[data-hi-timing]');
  const bodyPre = need<HTMLElement>(root, '[data-hi-body]');
  const repeatTable = need<HTMLTableElement>(root, '[data-hi-repeat]');
  let active: Preset | undefined = presets[0];

  const renderHeaders = (headers: [string, string][]): void => {
    headersTable.querySelectorAll('tr').forEach((tr) => tr.remove());
    for (const [name, value] of headers) {
      const tr = headersTable.insertRow();
      if (highlight.has(name.toLowerCase())) tr.dataset.highlight = '';
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = name;
      tr.append(th);
      tr.insertCell().textContent = value;
    }
    need<HTMLElement>(root, '[data-hi-headers-wrap]').hidden = headers.length === 0;
  };

  const renderTiming = (header: string | undefined): void => {
    const entries = parseServerTiming(header ?? null).filter((e) => e.dur > 0);
    const max = Math.max(1, ...entries.map((e) => e.dur));
    timing.replaceChildren(
      ...entries.map((e) => {
        const li = document.createElement('li');
        const name = document.createElement('span');
        name.textContent = e.desc ? `${e.name} (${e.desc})` : e.name;
        const bar = document.createElement('span');
        bar.className = 'lab-bar';
        const fill = document.createElement('span');
        fill.style.inlineSize = `${(e.dur / max) * 100}%`;
        bar.append(fill);
        const value = document.createElement('span');
        value.textContent = `${e.dur.toFixed(1)} ms`;
        li.append(name, bar, value);
        return li;
      }),
    );
    timing.hidden = entries.length === 0;
  };

  const header = (ex: Exchange, name: string): string | undefined =>
    ex.headers.find(([n]) => n.toLowerCase() === name)?.[1];

  const renderExchange = (ex: Exchange): void => {
    status.innerHTML = '';
    const chip = document.createElement('span');
    chip.className = 'lab-status';
    chip.dataset.status = String(ex.status);
    chip.textContent = `${ex.status} ${ex.statusText}`;
    const meta = document.createElement('span');
    meta.textContent = ` ${ex.ms} ms via ${ex.via === 'wire' ? 'raw wire' : 'browser fetch'}. ${ex.note ?? ''}`;
    status.append(chip, meta);
    renderHeaders(ex.headers);
    renderTiming(header(ex, 'server-timing'));
    bodyPre.textContent = ex.body ? pretty(ex.body).slice(0, 4000) : '(no body)';
  };

  const renderLogs = async (requestId: string | undefined): Promise<void> => {
    const wrap = root.querySelector<HTMLElement>('[data-hi-logs-wrap]');
    const list = root.querySelector<HTMLUListElement>('[data-hi-logs]');
    if (!wrap || !list || !requestId) return;
    const res = await fetch(`/api/logs?requestId=${encodeURIComponent(requestId)}`);
    const { entries } = (await res.json()) as { entries: Record<string, unknown>[] };
    list.replaceChildren();
    for (const entry of entries.reverse())
      logLine(list, JSON.stringify(entry), entry.level === 'error' ? 'bad' : undefined);
    wrap.hidden = false;
  };

  const renderGrade = (ex: Exchange): void => {
    const wrap = root.querySelector<HTMLElement>('[data-hi-grade-wrap]');
    const list = root.querySelector<HTMLUListElement>('[data-hi-grade]');
    if (!wrap || !list) return;
    list.replaceChildren();
    const get = (name: string): string | null => header(ex, name.toLowerCase()) ?? null;
    for (const g of gradeHeaders(get, location.protocol === 'https:').reverse())
      logLine(
        list,
        `${g.verdict.toUpperCase()} · ${g.header}${g.value ? `: ${g.value}` : ''} — ${g.why}`,
        g.verdict === 'good' ? 'good' : g.verdict === 'weak' ? 'warn' : 'bad',
      );
    wrap.hidden = false;
  };

  const send = async (): Promise<void> => {
    const method = field<HTMLSelectElement>('method').value;
    const path = field<HTMLInputElement>('path').value.trim() || '/';
    const via = field<HTMLSelectElement>('via').value as 'browser' | 'wire';
    const headers = parseHeaderLines(field<HTMLTextAreaElement>('headers').value);
    const body = field<HTMLTextAreaElement>('body').value;
    const times = Math.min(30, Math.max(1, Number(field<HTMLInputElement>('repeat').value) || 1));
    const preset = active?.path === path ? active : undefined;
    const results: Exchange[] = [];
    for (let i = 0; i < times; i += 1) {
      status.textContent = times > 1 ? `Sending ${i + 1} of ${times}…` : 'Sending…';
      results.push(
        via === 'wire'
          ? await viaWire(method, path, headers, body)
          : await viaBrowser(method, path, headers, body, preset),
      );
    }
    const last = results.at(-1);
    if (!last) return;
    renderExchange(last);
    const repeatWrap = need<HTMLElement>(root, '[data-hi-repeat-wrap]');
    repeatWrap.hidden = times === 1;
    if (times > 1) {
      const cols = ['#', 'status', 'ms', ...highlight];
      repeatTable.querySelectorAll('tr').forEach((tr) => tr.remove());
      const head = repeatTable.createTHead().insertRow();
      for (const col of cols) {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = col;
        head.append(th);
      }
      const tbody = repeatTable.tBodies[0] ?? repeatTable.createTBody();
      results.forEach((ex, i) => {
        const tr = tbody.insertRow();
        tr.insertCell().textContent = String(i + 1);
        const cell = tr.insertCell();
        cell.textContent = String(ex.status);
        cell.dataset.status = String(ex.status);
        tr.insertCell().textContent = String(ex.ms);
        for (const name of highlight) tr.insertCell().textContent = header(ex, name) ?? '—';
      });
    }
    if (root.hasAttribute('data-logs')) await renderLogs(header(last, 'x-request-id'));
    if (root.hasAttribute('data-grade')) renderGrade(last);
  };

  root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = presets[Number(button.dataset.preset)];
      if (!preset) return;
      active = preset;
      field<HTMLSelectElement>('method').value = preset.method ?? 'GET';
      field<HTMLInputElement>('path').value = preset.path;
      field<HTMLSelectElement>('via').value = preset.via ?? 'browser';
      field<HTMLTextAreaElement>('headers').value = Object.entries(preset.headers ?? {})
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      field<HTMLTextAreaElement>('body').value = preset.body ?? '';
      field<HTMLInputElement>('repeat').value = String(preset.repeat ?? 1);
      void send();
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void send();
  });
  void guard(root);
}
