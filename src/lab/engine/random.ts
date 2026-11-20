/** Small deterministic RNG (mulberry32) so every build looks identical. */
export interface Rng {
  next(): number
  range(a: number, b: number): number
  pick<T>(arr: readonly T[]): T
}

export function createRng(seed: number): Rng {
  let s = seed | 0
  const next = (): number => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    range: (a, b) => a + (b - a) * next(),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
  }
}
