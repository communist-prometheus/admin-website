import { Hono } from 'hono'
import { afterEach, describe, expect, it } from 'vitest'
import type { AuthVariables } from './auth-middleware'
import type { SpanRecord } from './otlp-types'
import { broadcast, resetSseBus } from './sse-bus'
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

const readChunks = async (res: Response, n: number): Promise<string> => {
  const reader = res.body?.getReader()
  const decoder = new TextDecoder()
  const chunks: string[] = []
  await Promise.all(
    Array.from({ length: n }).map(async () => {
      const result = await reader?.read()
      chunks.push(decoder.decode(result?.value))
    })
  )
  return chunks.join('')
}

const readFirstChunk = (res: Response): Promise<string> => readChunks(res, 1)

describe('GET /v1/subscribe', () => {
  afterEach(() => {
    resetSseBus()
  })

  it('returns text/event-stream', async () => {
    const app = buildApp()
    const res = await app.request('/v1/subscribe')
    expect(res.headers.get('content-type')).toMatch(/event-stream/)
  })

  it('streams a span event with id after broadcast', async () => {
    const app = buildApp()
    const res = await app.request('/v1/subscribe')
    const reading = readFirstChunk(res)
    await new Promise(r => setTimeout(r, 10))
    broadcast(span('s1', 't1'))
    const chunk = await reading
    expect(chunk).toContain('"kind":"span"')
    expect(chunk).toContain('id: 1')
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

  it('replays buffered events when Last-Event-ID is set', async () => {
    broadcast(span('a', 't1'))
    broadcast(span('b', 't1'))
    broadcast(span('c', 't1'))
    const app = buildApp()
    const res = await app.request('/v1/subscribe', {
      headers: { 'Last-Event-ID': '1' },
    })
    const chunk = await readChunks(res, 2)
    expect(chunk).toContain('"spanId":"b"')
    expect(chunk).toContain('"spanId":"c"')
    expect(chunk).not.toContain('"spanId":"a"')
  })
})
