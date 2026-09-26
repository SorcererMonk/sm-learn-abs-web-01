/*
 * The PWA lab's page script: registers the worker, shows the update prompt, renders notes, and
 * keeps an IndexedDB outbox of notes written while the server is unreachable, replaying them
 * (idempotently, by note ID) when it comes back.
 */
const $ = (selector) => document.querySelector(selector);
const log = (text) => {
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleTimeString()} ${text}`;
  $('#log').prepend(li);
  if (parent !== window) parent.postMessage({ type: 'lab:pwa', text }, location.origin);
};

const db = () =>
  new Promise((resolve, reject) => {
    const open = indexedDB.open('pwa-outbox', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('outbox', { keyPath: 'id' });
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
const tx = async (mode, fn) => {
  const database = await db();
  return new Promise((resolve, reject) => {
    const t = database.transaction('outbox', mode);
    const result = fn(t.objectStore('outbox'));
    t.oncomplete = () => resolve(result.result);
    t.onerror = () => reject(t.error);
  });
};
const outbox = () => tx('readonly', (store) => store.getAll());

async function render() {
  let notes = [];
  try {
    const res = await fetch('/lab/pwa/api/notes');
    notes = (await res.json()).notes ?? [];
  } catch {
    log('Could not load notes: offline and nothing cached.');
  }
  const pending = await outbox();
  const list = $('#notes');
  list.replaceChildren();
  for (const note of [...pending.map((n) => ({ ...n, pending: true })), ...notes]) {
    const li = document.createElement('li');
    li.textContent = note.text + (note.pending ? ' (waiting in the outbox)' : '');
    list.append(li);
  }
  $('#outbox').textContent = pending.length
    ? `${pending.length} note(s) waiting to sync`
    : 'Outbox empty';
}

async function flush() {
  const pending = await outbox();
  for (const note of pending) {
    try {
      const res = await fetch('/lab/pwa/api/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(note),
      });
      if (!res.ok) throw new Error(String(res.status));
      await tx('readwrite', (store) => store.delete(note.id));
      log(`Synced "${note.text}" from the outbox`);
    } catch {
      return;
    }
  }
  if (pending.length) await render();
}

$('#add').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = $('#text');
  const note = { id: crypto.randomUUID(), text: input.value.trim(), at: Date.now() };
  if (!note.text) return;
  input.value = '';
  try {
    const res = await fetch('/lab/pwa/api/notes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error(String(res.status));
    log(`Saved "${note.text}" on the server`);
  } catch {
    await tx('readwrite', (store) => store.put(note));
    log(`Server unreachable: "${note.text}" queued in the IndexedDB outbox`);
  }
  await render();
});

addEventListener('online', () => void flush());
setInterval(() => void flush(), 5000);
addEventListener('message', (event) => {
  if (event.origin !== location.origin) return;
  if (event.data === 'lab:flush') void flush();
});

if ('serviceWorker' in navigator) {
  const showUpdate = (worker) => {
    $('#update').hidden = false;
    $('#reload').onclick = () => worker.postMessage('SKIP_WAITING');
    log('A new version is installed and waiting. Press "Reload to update".');
  };
  navigator.serviceWorker.addEventListener('message', (event) => {
    const m = event.data;
    if (m.type === 'fetch') log(`${m.path} → ${m.strategy}: ${m.source}`);
    if (m.type === 'installed') log(`Service worker ${m.version} installed (shell precached)`);
    if (m.type === 'activated')
      log(
        `Service worker ${m.version} activated${m.removed.length ? `, deleted ${m.removed.join(', ')}` : ''}`,
      );
  });
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('/lab/pwa/sw.js', { scope: '/lab/pwa/' }).then((reg) => {
    $('#sw').textContent = navigator.serviceWorker.controller
      ? 'Controlled by a service worker'
      : 'First visit: installing the service worker';
    if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker);
      });
    });
    $('#check').onclick = () => {
      log('Checking the server for a new sw.js…');
      reg.update().catch(() => log('Update check failed: server unreachable'));
    };
  });
} else {
  $('#sw').textContent = 'Service workers are not supported here';
}

void render().then(flush);
