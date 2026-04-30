import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LogRecord } from './log-record'
import { sendLogs } from './send-logs'

const log = (msg: string): LogRecord => ({
  traceId: undefined,
  spanId: undefined,
  level: 'info',
  message: msg,
  at: 1,
  attributes: { cat: 'git' },
})

describe('sendLogs', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true on 2xx', async () => {
    expect(await sendLogs([log('hello')])).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('posts to /v1/logs with bearer auth', async () => {
    await sendLogs([log('a')])
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>
    const call = fetchMock.mock.calls[0] ?? []
    expect(String(call[0])).toContain('/v1/logs')
    expect(call[1].method).toBe('POST')
    expect(call[1].headers.Authorization).toMatch(/^Bearer /)
  })

  it('returns false on 5xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 500 }))
    )
    expect(await sendLogs([log('a')])).toBe(false)
  })

  it('returns false on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await sendLogs([log('a')])).toBe(false)
  })
})
