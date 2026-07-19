import { describe, expect, it, vi } from 'vitest'
import { sendBatchWithRetry } from './batch-retry'
import { quotaKindFromName, readQuotaKind } from './quota'
import type { SendInput } from './types'

const INPUT: SendInput = {
  from: 'a@b.c',
  to: 'x@y.z',
  subject: 's',
  html: '<p>h</p>',
  text: 't',
}

const jsonResponse = (name: string, status = 429): Response =>
  new Response(JSON.stringify({ name, message: 'm' }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/** A `fetch` stub that always answers with the given Resend error. */
const fetchReturning = (name: string) =>
  vi.fn<typeof fetch>(async () => jsonResponse(name))

/** A backoff sleeper that resolves at once, tracking its call count. */
const sleepSpy = () =>
  vi.fn<(ms: number) => Promise<void>>(async () => undefined)

describe('quotaKindFromName', () => {
  it('maps the Resend quota error names', () => {
    expect(quotaKindFromName('daily_quota_exceeded')).toBe('daily')
    expect(quotaKindFromName('monthly_quota_exceeded')).toBe('monthly')
  })

  it('is undefined for a per-second rate limit and for junk', () => {
    expect(quotaKindFromName('rate_limit_exceeded')).toBeUndefined()
    expect(quotaKindFromName('validation_error')).toBeUndefined()
    expect(quotaKindFromName(undefined)).toBeUndefined()
    expect(quotaKindFromName(42)).toBeUndefined()
  })
})

describe('readQuotaKind', () => {
  it('reads the quota without consuming the response body', async () => {
    const res = jsonResponse('daily_quota_exceeded')
    expect(await readQuotaKind(res)).toBe('daily')
    // Body still readable by the caller — clone() protected the stream.
    expect(await res.json()).toMatchObject({ name: 'daily_quota_exceeded' })
  })
})

describe('sendBatchWithRetry — quota', () => {
  it('short-circuits a daily quota: no retries, no backoff, quota surfaced', async () => {
    const doFetch = fetchReturning('daily_quota_exceeded')
    const doSleep = sleepSpy()
    const res = await sendBatchWithRetry(doFetch, doSleep, 'rk', [INPUT])
    expect(res).toEqual({
      ok: false,
      error: 'resend daily_quota_exceeded',
      definitive: false,
      quota: 'daily',
    })
    expect(doFetch).toHaveBeenCalledTimes(1)
    expect(doSleep).not.toHaveBeenCalled()
  })

  it('surfaces a monthly quota the same way', async () => {
    const res = await sendBatchWithRetry(
      fetchReturning('monthly_quota_exceeded'),
      sleepSpy(),
      'rk',
      [INPUT]
    )
    expect(res).toMatchObject({
      ok: false,
      quota: 'monthly',
      definitive: false,
    })
  })

  it('still retries a per-second rate limit and never sets quota', async () => {
    const doFetch = fetchReturning('rate_limit_exceeded')
    const doSleep = sleepSpy()
    const res = await sendBatchWithRetry(doFetch, doSleep, 'rk', [INPUT])
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.quota).toBeUndefined()
    // MAX_ATTEMPTS is 4 → four sends, three backoffs.
    expect(doFetch).toHaveBeenCalledTimes(4)
    expect(doSleep).toHaveBeenCalledTimes(3)
  })
})
