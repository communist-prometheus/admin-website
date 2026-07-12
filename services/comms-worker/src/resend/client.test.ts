import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createResendClient, RESEND_API_URL } from './client'

const okPayload = {
  from: 'a@b.c',
  to: 'd@e.f',
  subject: 'hi',
  html: '<p>hi</p>',
  text: 'hi',
}

let sleep: ReturnType<typeof vi.fn>
let fetchFn: ReturnType<typeof vi.fn>

beforeEach(() => {
  sleep = vi.fn().mockResolvedValue(undefined)
  fetchFn = vi.fn<typeof fetch>()
})

const build = () =>
  createResendClient({
    apiKey: 'rk_live_xxx',
    fetch: fetchFn as typeof fetch,
    sleep,
  })

describe('createResendClient.send — request shape', () => {
  it('POSTs the Resend API URL with Bearer auth + JSON body', async () => {
    fetchFn.mockResolvedValue(
      new Response(JSON.stringify({ id: 're_1' }), { status: 200 })
    )
    const r = await build().send(okPayload)
    expect(r).toEqual({ ok: true, id: 're_1' })
    expect(fetchFn).toHaveBeenCalledOnce()
    const [url, init] = fetchFn.mock.calls[0] ?? []
    expect(url).toBe(RESEND_API_URL)
    expect(init.method).toBe('POST')
    const headers = new Headers(init.headers)
    expect(headers.get('Authorization')).toBe('Bearer rk_live_xxx')
    expect(headers.get('Content-Type')).toBe('application/json')
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    expect(body.from).toBe('a@b.c')
    expect(body.to).toEqual(['d@e.f'])
  })

  it('forwards extra MIME headers + Idempotency-Key', async () => {
    fetchFn.mockResolvedValue(
      new Response(JSON.stringify({ id: 're_2' }), { status: 200 })
    )
    await build().send({
      ...okPayload,
      headers: { 'List-Unsubscribe': '<https://x/u>' },
      idempotencyKey: '42:2026-06-06T09:00:00Z',
    })
    const init = fetchFn.mock.calls[0]?.[1]
    const headers = new Headers(init?.headers)
    expect(headers.get('Idempotency-Key')).toBe('42:2026-06-06T09:00:00Z')
    const body = JSON.parse(init?.body as string) as Record<string, unknown>
    const messageHeaders = body.headers as Record<string, string>
    expect(messageHeaders['List-Unsubscribe']).toBe('<https://x/u>')
  })
})

describe('createResendClient.send — failure modes', () => {
  it('returns an error on 4xx (no retry)', async () => {
    fetchFn.mockResolvedValue(
      new Response(JSON.stringify({ message: 'bad to' }), { status: 422 })
    )
    const r = await build().send(okPayload)
    expect(r.ok).toBe(false)
    expect(fetchFn).toHaveBeenCalledOnce()
    expect(sleep).not.toHaveBeenCalled()
  })

  it('retries once on 429 then returns error', async () => {
    fetchFn
      .mockResolvedValueOnce(new Response('', { status: 429 }))
      .mockResolvedValueOnce(new Response('', { status: 429 }))
    const r = await build().send(okPayload)
    expect(r.ok).toBe(false)
    expect(fetchFn).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledOnce()
  })

  it('retries once on 5xx then succeeds when the retry returns 2xx', async () => {
    fetchFn
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 're_3' }), { status: 200 })
      )
    const r = await build().send(okPayload)
    expect(r).toEqual({ ok: true, id: 're_3' })
    expect(fetchFn).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledOnce()
  })

  it('honours Retry-After (seconds) on the first 429', async () => {
    fetchFn
      .mockResolvedValueOnce(
        new Response('', {
          status: 429,
          headers: { 'Retry-After': '3' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 're_4' }), { status: 200 })
      )
    await build().send(okPayload)
    expect(sleep).toHaveBeenCalledWith(3000)
  })

  it('returns error when the network rejects on both attempts', async () => {
    fetchFn
      .mockRejectedValueOnce(new Error('econn'))
      .mockRejectedValueOnce(new Error('econn'))
    const r = await build().send(okPayload)
    expect(r.ok).toBe(false)
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})

describe('createResendClient.sendBatch', () => {
  const inputs = [okPayload, { ...okPayload, to: 'x@y.z' }]

  it('POSTs the batch URL once and returns ids in input order', async () => {
    fetchFn.mockResolvedValue(
      new Response(
        JSON.stringify({ data: [{ id: 're_a' }, { id: 're_b' }] }),
        {
          status: 200,
        }
      )
    )
    const r = await build().sendBatch(inputs, 'idem-1')
    expect(r).toEqual({ ok: true, ids: ['re_a', 're_b'] })
    expect(fetchFn).toHaveBeenCalledOnce()
    const [url, init] = fetchFn.mock.calls[0] ?? []
    expect(url).toBe('https://api.resend.com/emails/batch')
    const body = JSON.parse(init.body as string) as ReadonlyArray<unknown>
    expect(body).toHaveLength(2)
    expect(new Headers(init.headers).get('Idempotency-Key')).toBe('idem-1')
  })

  it('does nothing and returns empty ids for an empty batch', async () => {
    const r = await build().sendBatch([])
    expect(r).toEqual({ ok: true, ids: [] })
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('fails terminally without retry on a 422', async () => {
    fetchFn.mockResolvedValue(new Response('bad', { status: 422 }))
    const r = await build().sendBatch(inputs)
    /*
     * `definitive` marks a rejection Resend actually made — nothing was
     * sent — so the caller may safely retry the chunk one email at a
     * time and pin the failure on the address that caused it.
     */
    expect(r).toEqual({ ok: false, error: 'resend 422', definitive: true })
    expect(fetchFn).toHaveBeenCalledOnce()
  })

  /*
   * A 100-email batch takes Resend longer than the backoff, so the retry
   * used to re-send the same idempotency key while the original was
   * still in flight; Resend answered 409, it was classified terminal,
   * and the 2026-07-11 dispatch dropped 100 of 123 recipients. 409 is
   * transient: back off and let the original settle, and Resend replays
   * its recorded response.
   */
  it('retries the 409 idempotency conflict instead of writing the batch off', async () => {
    fetchFn
      .mockResolvedValueOnce(new Response('conflict', { status: 409 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: [{ id: 're_1' }, { id: 're_2' }] }),
          {
            status: 200,
          }
        )
      )
    const r = await build().sendBatch(inputs)
    expect(r).toEqual({ ok: true, ids: ['re_1', 're_2'] })
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('retries once on 429 then succeeds', async () => {
    fetchFn
      .mockResolvedValueOnce(
        new Response('rate', { status: 429, headers: { 'Retry-After': '2' } })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: [{ id: 're_1' }, { id: 're_2' }] }),
          {
            status: 200,
          }
        )
      )
    const r = await build().sendBatch(inputs)
    expect(r).toEqual({ ok: true, ids: ['re_1', 're_2'] })
    expect(sleep).toHaveBeenCalledWith(2000)
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('keeps the real status when a retryable failure is exhausted', async () => {
    fetchFn.mockResolvedValue(new Response('boom', { status: 503 }))
    const r = await build().sendBatch(inputs)
    /*
     * Not `definitive`: the batch may or may not have landed, so the
     * caller must NOT re-send it — the next tick replays it instead
     * (the cutoff does not advance on a failed tick).
     */
    expect(r).toEqual({
      ok: false,
      error: 'resend 503 (retry exhausted)',
      definitive: false,
    })
  })

  it('backs off exponentially so a slow batch can settle', async () => {
    fetchFn.mockResolvedValue(new Response('boom', { status: 503 }))
    await build().sendBatch(inputs)
    expect(sleep.mock.calls.map(c => c[0])).toEqual([2000, 4000, 8000])
  })

  it('reports a network error once the attempts are exhausted', async () => {
    fetchFn.mockRejectedValue(new Error('econn'))
    const r = await build().sendBatch(inputs)
    expect(r).toEqual({
      ok: false,
      error: 'resend network (retry exhausted)',
      definitive: false,
    })
    expect(fetchFn).toHaveBeenCalledTimes(4)
  })
})
