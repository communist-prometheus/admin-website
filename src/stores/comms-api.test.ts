import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Subscriber } from '@/validation/schemas/subscriber'
import {
  apiAddSubscriber,
  apiListSubscribers,
  apiRemoveSubscriber,
  apiUpdateLangs,
} from './comms-api'

const okSubscriber: Subscriber = {
  id: 7,
  email: 'a@b.c',
  langs: ['ru', 'en'],
  status: 'active',
  createdAt: '2026-06-03T00:00:00.000Z',
  lastSentAt: undefined,
  unsubscribedAt: undefined,
}

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  mockFetch.mockReset()
})

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

describe('apiListSubscribers', () => {
  it('GETs /api/subscribers with credentials and returns parsed list', async () => {
    mockFetch.mockResolvedValue(ok({ subscribers: [okSubscriber] }))
    const res = await apiListSubscribers()
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/subscribers$/)
    expect(init.credentials).toBe('include')
    expect(res.subscribers).toHaveLength(1)
  })
})

describe('apiAddSubscriber', () => {
  it('POSTs the email + langs and returns the created subscriber', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(okSubscriber), { status: 201 })
    )
    const res = await apiAddSubscriber('a@b.c', ['ru'])
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/subscribers$/)
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ email: 'a@b.c', langs: ['ru'] }))
    expect(res.email).toBe('a@b.c')
  })

  it('throws a readable error on 422', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'email' }), { status: 422 })
    )
    await expect(apiAddSubscriber('bad', ['ru'])).rejects.toThrow('email')
  })
})

describe('apiUpdateLangs', () => {
  it('PATCHes the langs at /api/subscribers/:id', async () => {
    mockFetch.mockResolvedValue(ok(okSubscriber))
    await apiUpdateLangs(7, ['en'])
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/subscribers\/7$/)
    expect(init.method).toBe('PATCH')
    expect(init.body).toBe(JSON.stringify({ langs: ['en'] }))
  })
})

describe('apiRemoveSubscriber', () => {
  it('DELETEs the row by id', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204 }))
    await apiRemoveSubscriber(7)
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/subscribers\/7$/)
    expect(init.method).toBe('DELETE')
  })

  it('throws on non-2xx', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 404 }))
    await expect(apiRemoveSubscriber(7)).rejects.toThrow()
  })
})
