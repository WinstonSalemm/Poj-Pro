// src/lib/react.ts

/**
 * Returns a safe, stable React key from a list of candidates.
 * Filters out undefined, null, and stringified "NaN" values.
 * Falls back to a random string if nothing usable is provided.
 */
export function getSafeKey(...candidates: Array<string | number | undefined | null>) {
  for (const c of candidates) {
    if (c === 0 || c) {
      const s = String(c);
      if (s !== 'NaN' && s !== 'undefined' && s !== 'null') return s;
    }
  }
  // Fallback — stable enough for non-reordered lists; random if crypto unavailable
  try {
    const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
    if (typeof g.crypto?.randomUUID === 'function') {
      return g.crypto.randomUUID();
    }
  } catch {}
  return Math.random().toString(36).slice(2);
}
