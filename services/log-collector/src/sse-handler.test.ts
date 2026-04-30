import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import type { AuthVariables } from './auth-middleware'
import type { SpanRecord } from './otlp-types'
import { broadcast } from './sse-bus'
import { registerSseRoute } from './sse-handler'

const span = (id: string, traceId: string): SpanRecord => ({
  traceId,
  spanId: id,
  parentSpanId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  status: 'ok',
  attributes: {},
})

const buildApp = () => {
  const app = new Hono<{ Variables: AuthVariables }>()
  registerSseRoute(app)
  return app
}

const readFirstChunk = async (res: Response): Promise<string> => {
  const reader = res.body?.getReader()
  const result = await reader?.read()
  return new TextDecoder().decode(result?.value)
}

describe('GET /v1/subscribe', () => {
  it('returns text/event-stream', async () => {
    const app = buildApp()
    const res = await app.request('/v1/subscribe')
    expect(res.headers.get('content-type')).toMatch(/event-stream/)
  })

  it('streams a span event after broadcast', async () => {
    const app = buildApp()
    const res = await app.request('/v1/subscribe')
    const reading = readFirstChunk(res)
    await new Promise(r => setTimeout(r, 10))
    broadcast(span('s1', 't1'))
    const chunk = await reading
    expect(chunk).toContain('"kind":"span"')
    expect(chunk).toContain('"spanId":"s1"')
  })

  it('honours the traceId filter', async () => {
    const app = buildApp()
    const res = await app.request('/v1/subscribe?traceId=wanted')
    const reading = readFirstChunk(res)
    await new Promise(r => setTimeout(r, 10))
    broadcast(span('a', 'other'))
    broadcast(span('b', 'wanted'))
    const chunk = await reading
    expect(chunk).toContain('"spanId":"b"')
    expect(chunk).not.toContain('"spanId":"a"')
  })
})
