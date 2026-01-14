type RateLimitState = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

const store = new Map<string, RateLimitState>();
let lastCleanup = 0;
const CLEANUP_INTERVAL_MS = 60000;

export function rateLimit(
  key: string,
  options: { windowMs: number; max: number },
): RateLimitResult {
  const now = Date.now();
  const windowMs = Math.max(1, options.windowMs);
  const max = Math.max(1, options.max);

  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    store.forEach((entry, entryKey) => {
      if (entry.resetAt <= now) {
        store.delete(entryKey);
      }
    });
    lastCleanup = now;
  }

  let entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }

  entry.count += 1;
  store.set(key, entry);

  const remaining = Math.max(0, max - entry.count);

  return {
    allowed: entry.count <= max,
    limit: max,
    remaining,
    resetAt: entry.resetAt,
  };
}
