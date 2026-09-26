/** A deliberately CPU-heavy, allocation-free task (sieve-less trial division) for thread demos. */
export function countPrimes(limit: number): number {
  let count = 0;
  for (let n = 2; n < limit; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) count += 1;
  }
  return count;
}
