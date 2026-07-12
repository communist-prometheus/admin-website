import { describe, expect, it } from 'vitest'
import { isRetryableStatus } from './response'

describe('isRetryableStatus', () => {
  it('retries rate limits and server errors', () => {
    expect(isRetryableStatus(429)).toBe(true)
    expect(isRetryableStatus(500)).toBe(true)
    expect(isRetryableStatus(503)).toBe(true)
  })

  /*
   * The 2026-07-11 dispatch lost 100 of 123 recipients to this. A
   * 100-email batch takes Resend longer than the retry backoff, so when
   * the first POST timed out the retry re-sent the SAME idempotency key
   * while the original was still in flight — Resend answered 409, which
   * was classified terminal, and the whole chunk was written off as
   * failed with no mail sent. 409 is transient: the key is unique per
   * (tick, chunk), so it can only ever mean "the identical request is
   * still being processed".
   */
  it('retries the idempotency conflict that killed the 11 July send', () => {
    expect(isRetryableStatus(409)).toBe(true)
  })

  it('does not retry genuine client errors', () => {
    expect(isRetryableStatus(400)).toBe(false)
    expect(isRetryableStatus(401)).toBe(false)
    expect(isRetryableStatus(403)).toBe(false)
    expect(isRetryableStatus(422)).toBe(false)
  })
})
