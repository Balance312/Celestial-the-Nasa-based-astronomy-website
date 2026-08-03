/**
 * Request Manager — deduplication + stale-while-revalidate for NASA API calls.
 *
 * Problems solved:
 * - Multiple components calling the same endpoint fire duplicate network requests.
 *   `dedupe()` ensures only one in-flight request per key; others share the same Promise.
 * - Data can become stale between navigations.
 *   `staleWhileRevalidate()` returns cached data immediately and refreshes in the background.
 */

// ── In-flight request deduplication ──

const inflight = new Map();

/**
 * Deduplicate concurrent fetch calls with the same key.
 * If a request with `key` is already in-flight, returns the same Promise.
 * Otherwise, calls `fetchFn`, stores the Promise, and cleans up on settle.
 *
 * @template T
 * @param {string} key - Unique identifier for this request (e.g. "apod:2026-01-15")
 * @param {() => Promise<T>} fetchFn - The actual fetch function
 * @returns {Promise<T>}
 */
export function dedupe(key, fetchFn) {
  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const promise = fetchFn()
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

// ── Stale-while-revalidate cache ──

const memoryCache = new Map();

/**
 * Return cached data immediately if fresh; if stale, serve stale + refresh in background.
 * Falls back to fetchFn on cache miss.
 *
 * @template T
 * @param {string} key - Cache key
 * @param {() => Promise<T>} fetchFn - The actual fetch function
 * @param {number} maxAgeMs - Max age before data is considered stale
 * @param {object} [opts]
 * @param {AbortSignal} [opts.signal] - AbortSignal to cancel the fetch
 * @returns {Promise<T>}
 */
export function staleWhileRevalidate(key, fetchFn, maxAgeMs) {
  const cached = memoryCache.get(key);

  if (cached && Date.now() - cached.timestamp < maxAgeMs) {
    return Promise.resolve(cached.data);
  }

  if (cached) {
    // Stale — return stale data but kick off a background refresh
    dedupe(key, async () => {
      try {
        const data = await fetchFn();
        memoryCache.set(key, { data, timestamp: Date.now() });
      } catch {
        // Background refresh failed — keep stale data, don't crash
      }
    }).catch(() => {}); // swallow — background refresh

    return Promise.resolve(cached.data);
  }

  // Cache miss — fetch and store
  return dedupe(key, async () => {
    const data = await fetchFn();
    memoryCache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}

/**
 * Write data directly into the memory cache (useful for pre-populating from localStorage).
 */
export function warmCache(key, data) {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 * @param {string} prefix
 */
export function invalidateCache(prefix) {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Get cache stats for debugging.
 */
export function cacheStats() {
  return {
    memoryEntries: memoryCache.size,
    inflightRequests: inflight.size,
    keys: [...memoryCache.keys()],
  };
}
