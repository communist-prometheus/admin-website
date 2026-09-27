/**
 * Deciding whether a failed GitHub response is worth waiting out.
 *
 * The real-mode job re-seeds the sandbox on every run, so it leans on the E2E
 * account's hourly API budget. When that budget is gone GitHub answers 403 and
 * says when it returns; sleeping until then turns a red PR into a slow one.
 */

/** Longest sleep worth taking. Past this, failing loudly is the better signal. */
export const MAX_WAIT_MS = 20 * 60 * 1000

/** Slack past the stated reset, covering clock skew between us and GitHub. */
const SLACK_MS = 2_000

/** The subset of a Response this decision needs. */
export interface RateLimitedResponse {
  readonly status: number
  readonly headers: Headers
}

const seconds = (raw: string | null): number | undefined => {
  const n = Number(raw)
  return raw !== null && raw.trim() !== '' && Number.isFinite(n)
    ? n
    : undefined
}

const fromRetryAfter = (headers: Headers): number | undefined => {
  const after = seconds(headers.get('retry-after'))
  return after === undefined ? undefined : after * 1000
}

const fromResetHeader = (
  headers: Headers,
  now: number
): number | undefined => {
  if (headers.get('x-ratelimit-remaining') !== '0') return undefined
  const reset = seconds(headers.get('x-ratelimit-reset'))
  return reset === undefined
    ? undefined
    : Math.max(0, reset * 1000 - now) + SLACK_MS
}

/**
 * How long to wait before retrying, or undefined when retrying is pointless —
 * the failure is not about budget, or the budget returns too late to wait for.
 * @param res - The failed response (status + headers).
 * @param now - Current epoch milliseconds.
 * @returns Milliseconds to sleep, or undefined to give up.
 */
export const rateLimitWaitMs = (
  res: RateLimitedResponse,
  now: number
): number | undefined => {
  if (res.status !== 403 && res.status !== 429) return undefined
  const wait =
    fromRetryAfter(res.headers) ?? fromResetHeader(res.headers, now)
  return wait !== undefined && wait <= MAX_WAIT_MS ? wait : undefined
}
