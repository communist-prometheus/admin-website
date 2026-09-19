import { describe, expect, it, vi } from 'vitest'
import { sendBatchWithRetry } from './batch-retry'
import type { SendInput } from './types'

/*
 * 2026-09-12: 100 of 116 recipients were written off with
 * "resend 409 (retry exhausted)" and re-sent a week later. A 409 on an
 * idempotent request does not mean the send failed — it means the
 * identical request is STILL BEING PROCESSED, and Resend will replay its
 * recorded response once it settles. The budget was four attempts with a
 * 2s/4s/8s backoff: fourteen seconds of waiting for a 100-email batch
 * that needed longer. Waiting is the whole point of that status, so a
 * conflict gets a budget of its own, and an exhausted one is reported as
 * unresolved rather than as a failure.
 */

const inputs: ReadonlyArray<SendInput> = [
  { to: 'a@b.c', from: 'f@b.c', subject: 's', html: '<p>h</p>' },
]

const conflict = (): Response => new Response('conflict', { status: 409 })
const accepted = (): Response =>
  new Response(JSON.stringify({ data: [{ id: 're_1' }] }), { status: 200 })

/** Collects the backoffs the retry loop asks for, without spending them. */
const recordingSleeper = (): {
  sleep: (ms: number) => Promise<void>
  waits: number[]
} => {
  const waits: number[] = []
  return {
    waits,
    sleep: async (ms: number) => {
      waits.push(ms)
    },
  }
}

describe('a batch still being processed', () => {
  it('keeps waiting well past the old fourteen-second budget', async () => {
    const fetchFn = vi.fn().mockResolvedValue(conflict())
    const { sleep, waits } = recordingSleeper()
    await sendBatchWithRetry(fetchFn, sleep, 'k', inputs, 'idem-1')
    const total = waits.reduce((a, b) => a + b, 0)
    expect(total).toBeGreaterThanOrEqual(60_000)
  })

  it('takes the replayed response as soon as the original settles', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(conflict())
      .mockResolvedValueOnce(conflict())
      .mockResolvedValueOnce(conflict())
      .mockResolvedValueOnce(conflict())
      .mockResolvedValueOnce(accepted())
    const { sleep } = recordingSleeper()
    const r = await sendBatchWithRetry(fetchFn, sleep, 'k', inputs, 'idem-1')
    expect(r).toEqual({ ok: true, ids: ['re_1'] })
  })

  it('reports an exhausted conflict as unresolved, not as a failure', async () => {
    const fetchFn = vi.fn().mockResolvedValue(conflict())
    const { sleep } = recordingSleeper()
    const r = await sendBatchWithRetry(fetchFn, sleep, 'k', inputs, 'idem-1')
    expect(r).toMatchObject({
      ok: false,
      definitive: false,
      unresolved: true,
    })
  })

  it('caps the wait so the budget is spent on attempts, not on one long sleep', async () => {
    const fetchFn = vi.fn().mockResolvedValue(conflict())
    const { sleep, waits } = recordingSleeper()
    await sendBatchWithRetry(fetchFn, sleep, 'k', inputs, 'idem-1')
    for (const w of waits) expect(w).toBeLessThanOrEqual(15_000)
  })
})

describe('a genuinely failing batch', () => {
  it('still gives up quickly on 5xx — waiting cannot fix a server error', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(new Response('boom', { status: 503 }))
    const { sleep, waits } = recordingSleeper()
    const r = await sendBatchWithRetry(fetchFn, sleep, 'k', inputs, 'idem-1')
    expect(fetchFn).toHaveBeenCalledTimes(4)
    expect(waits.reduce((a, b) => a + b, 0)).toBeLessThan(30_000)
    expect(r).toMatchObject({ ok: false, unresolved: false })
  })

  it('marks a 4xx rejection terminal so the chunk falls back to one-by-one', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(new Response('bad', { status: 422 }))
    const { sleep } = recordingSleeper()
    const r = await sendBatchWithRetry(fetchFn, sleep, 'k', inputs, 'idem-1')
    expect(r).toMatchObject({ ok: false, definitive: true })
  })
})
