type CacheEntry = { data: unknown; timestamp: number };

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 15_000; // 15 seconds

export function getCache<T>(key: string, ttlMs = DEFAULT_TTL_MS): { data: T; ageMs: number } | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const ageMs = Date.now() - entry.timestamp;
  if (ageMs > ttlMs) {
    cache.delete(key);
    return null;
  }
  return { data: entry.data as T, ageMs };
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(key?: string): void {
  if (key) cache.delete(key);
  else cache.clear();
}


