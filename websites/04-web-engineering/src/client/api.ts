/**
 * What every server-backed lab shares: one cached health check (so a static deployment shows a
 * clear notice instead of broken buttons) and a timed fetch that keeps the request ID.
 */
let health: Promise<boolean> | undefined;

export function serverAvailable(): Promise<boolean> {
  // Reading the body matters: an unread body keeps the request open in the browser.
  health ??= fetch('/api/health', { cache: 'no-store' })
    .then(async (res) => res.ok && ((await res.json()) as { status?: string }).status === 'ok')
    .catch(() => false);
  return health;
}

/** Resolves true when the server answers; otherwise reveals the lab's notice and disables it. */
export async function guard(root: HTMLElement): Promise<boolean> {
  const ok = await serverAvailable();
  if (!ok) {
    root.querySelector<HTMLElement>('[data-server-notice]')?.removeAttribute('hidden');
    root.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
      button.disabled = true;
    });
  }
  return ok;
}

export interface Sent {
  res: Response;
  ms: number;
  requestId: string | null;
}

export async function timedFetch(input: string, init?: RequestInit): Promise<Sent> {
  const started = performance.now();
  const res = await fetch(input, init);
  return {
    res,
    ms: Math.round(performance.now() - started),
    requestId: res.headers.get('x-request-id'),
  };
}

/** Appends a line to a lab log (newest first), trimming old lines. */
export function logLine(
  list: HTMLElement,
  text: string,
  tone?: 'good' | 'info' | 'warn' | 'bad',
  limit = 40,
): HTMLLIElement {
  const li = document.createElement('li');
  li.textContent = text;
  if (tone) li.dataset.tone = tone;
  list.prepend(li);
  while (list.children.length > limit) list.lastElementChild?.remove();
  return li;
}

export const pretty = (text: string): string => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};
