/** Worker for the worker lab: heavy work off the main thread, and transfer versus clone. */
import { countPrimes } from '../lib/primes.ts';

type Message = { kind: 'primes'; limit: number } | { kind: 'buffer'; buffer: ArrayBuffer };

self.addEventListener('message', (event: MessageEvent<Message>) => {
  const data = event.data;
  if (data.kind === 'primes') {
    const t0 = performance.now();
    const count = countPrimes(data.limit);
    self.postMessage({ kind: 'primes', count, ms: performance.now() - t0 });
  } else {
    self.postMessage({ kind: 'buffer', bytes: data.buffer.byteLength });
  }
});
