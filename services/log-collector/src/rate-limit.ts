import type { MiddlewareHandler } from 'hono'
import type { AuthVariables } from './auth-middleware'

/** Default per-user budget: 60 requests per 60-second window. */
export const RATE_LIMIT_PER_MINUTE = 60
const WINDOW_MS = 60_000

type Bucket = { readonly start: number; readonly count: number }

const buckets = new Map<string, Bucket>()

const update = (
  key: string,
  now: number,
  limit: number
): { readonly allowed: boolean; readonly retryMs: number } => {
  const bucket = buckets.get(key)
  const fresh = bucket === undefined || now - bucket.start > WINDOW_MS
  const next = fresh
    ? { start: now, count: 1 }
    : { start: bucket.start, count: bucket.count + 1 }
  buckets.set(key, next)
  return next.count <= limit
    ? { allowed: true, retryMs: 0 }
    : { allowed: false, retryMs: WINDOW_MS - (now - next.start) }
}

/** Reset every bucket. Used by tests. */
export const clearRateBuckets = (): void => {
  buckets.clear()
}

/**
 * Hono middleware enforcing a per-user request budget. Sliding
 * window keyed by the JWT subject claim. CF Rate Limiting will
 * superset this in production; the in-memory variant catches
 * loops in dev / tests and gives an obvious local signal.
 * @param limit Max requests per minute, defaults to 60.
 * @returns Hono middleware handler.
 */
export const rateLimit = (
  limit: number = RATE_LIMIT_PER_MINUTE
): MiddlewareHandler<{ Variables: AuthVariables }> => {
  return async (c, next) => {
    const user = c.get('user')?.sub ?? 'anon'
    const result = update(user, Date.now(), limit)
    return result.allowed
      ? await next()
      : c.json({ error: 'rate limited' }, 429, {
          'Retry-After': String(Math.ceil(result.retryMs / 1000)),
        })
  }
}
