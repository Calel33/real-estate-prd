// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter.
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup — remove entries that haven't been accessed in 5 minutes.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function periodicCleanup(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/**
 * Sliding-window rate limit check.
 *
 * @param key      Identifier (e.g. IP address).
 * @param maxReqs  Maximum allowed requests in the time window.
 * @param windowMs Time window in milliseconds.
 * @returns Whether the request is allowed, plus remaining quota and ms until reset.
 */
export function checkRateLimit(
  key: string,
  maxReqs: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  periodicCleanup(now);

  const entry = store.get(key) ?? { timestamps: [] };

  // Prune timestamps outside the current window.
  const cutoff = now - windowMs;
  const valid = entry.timestamps.filter((t) => t >= cutoff);

  if (valid.length >= maxReqs) {
    const oldestInWindow = valid[0];
    const resetMs = windowMs - (now - oldestInWindow);
    store.set(key, { timestamps: valid });
    return { allowed: false, remaining: 0, resetMs };
  }

  valid.push(now);
  store.set(key, { timestamps: valid });

  return {
    allowed: true,
    remaining: maxReqs - valid.length,
    resetMs: 0,
  };
}

/** Extract a client identifier from the request (IP or "unknown"). */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
