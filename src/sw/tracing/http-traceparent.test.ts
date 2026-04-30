import type { HttpClient } from 'isomorphic-git'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { setActiveContext } from './active-context'
import { withTraceparent } from './http-traceparent'

const okResponse = {
  url: 'https://x/info/refs',
  method: 'GET',
  headers: {},
  body: [],
  statusCode: 200,
  statusMessage: 'OK',
}

describe('withTraceparent', () => {
  afterEach(() => {
    setActiveContext(undefined)
  })

  it('passes opts through unchanged when no context is set', async () => {
    const reqMock = vi.fn().mockResolvedValue(okResponse)
    const inner: HttpClient = { request: reqMock }
    const wrapped = withTraceparent(inner)
    await wrapped.request({
      url: 'https://x/info/refs',
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    const call = reqMock.mock.calls[0] ?? []
    expect(call[0]?.headers?.traceparent).toBeUndefined()
    expect(call[0]?.headers?.Accept).toBe('application/json')
  })

  it('injects traceparent when a context is active', async () => {
    setActiveContext({ traceId: 'e'.repeat(32), spanId: 'f'.repeat(16) })
    const reqMock = vi.fn().mockResolvedValue(okResponse)
    const inner: HttpClient = { request: reqMock }
    const wrapped = withTraceparent(inner)
    await wrapped.request({
      url: 'https://x/info/refs',
      method: 'GET',
      headers: {},
    })
    const call = reqMock.mock.calls[0] ?? []
    expect(call[0]?.headers?.traceparent).toBe(
      `00-${'e'.repeat(32)}-${'f'.repeat(16)}-01`
    )
  })
})
