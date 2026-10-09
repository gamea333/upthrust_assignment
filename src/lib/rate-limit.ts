// Basic per-IP rate limit for the signup endpoint: 5 requests per minute.
// In memory, so it's per serverless instance and resets on cold starts. Enough
// to stop casual abuse of a newsletter form; a shared store (e.g. Upstash Redis)
// would be the next step for real traffic.

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // keep the map from growing forever on a long-lived instance
  if (hits.size > 5_000) {
    for (const [k, times] of hits) if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }

  return recent.length > MAX_REQUESTS;
}
