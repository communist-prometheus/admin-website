import { describe, expect, it } from 'vitest'
import { MAX_WAIT_MS, rateLimitWaitMs } from './sandbox-rate-limit'

/**
 * The real-mode job re-seeds the sandbox from fixtures on every run, and every
 * one of those calls spends the E2E account's hourly API budget. Twice in ten
 * minutes the very first call came back `403 API rate limit exceeded`, and the
 * job died before a single test ran — a red PR that had nothing to do with the
 * code under review.
 *
 * GitHub says in the response when the budget returns. Waiting that out beats
 * failing, as long as the wait is bounded: a reset 50 minutes away is worth
 * reporting, not sleeping through.
 */
const NOW = Date.UTC(2026, 8, 27, 1, 12, 30)

const res = (
  status: number,
  headers: Record<string, string>
): { status: number; headers: Headers } => ({
  status,
  headers: new Headers(headers),
})

const resetAt = (secondsFromNow: number): string =>
  String(Math.floor(NOW / 1000) + secondsFromNow)

describe('waiting out an exhausted GitHub budget', () => {
  it('waits until the reset the response names', () => {
    const wait = rateLimitWaitMs(
      res(403, {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': resetAt(120),
      }),
      NOW
    )
    // A couple of seconds of slack past the reset, so the clock skew is covered.
    expect(wait).toBeGreaterThanOrEqual(120_000)
    expect(wait).toBeLessThanOrEqual(125_000)
  })

  it('honours a Retry-After when GitHub sends one', () => {
    expect(rateLimitWaitMs(res(429, { 'retry-after': '30' }), NOW)).toBe(
      30_000
    )
  })

  it('refuses to sleep through a reset that is too far off', () => {
    const far = resetAt(Math.floor(MAX_WAIT_MS / 1000) + 600)
    expect(
      rateLimitWaitMs(
        res(403, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': far }),
        NOW
      )
    ).toBeUndefined()
  })

  it('does not wait on a 403 that is about permissions, not budget', () => {
    expect(
      rateLimitWaitMs(res(403, { 'x-ratelimit-remaining': '4999' }), NOW)
    ).toBeUndefined()
  })

  it('does not wait on an ordinary failure', () => {
    expect(rateLimitWaitMs(res(404, {}), NOW)).toBeUndefined()
    expect(rateLimitWaitMs(res(500, {}), NOW)).toBeUndefined()
  })

  it('does not wait on success', () => {
    expect(
      rateLimitWaitMs(res(200, { 'x-ratelimit-remaining': '0' }), NOW)
    ).toBeUndefined()
  })

  it('treats a reset already in the past as ready now', () => {
    const wait = rateLimitWaitMs(
      res(403, {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': resetAt(-10),
      }),
      NOW
    )
    expect(wait).toBeGreaterThanOrEqual(0)
    expect(wait).toBeLessThanOrEqual(5_000)
  })
})
