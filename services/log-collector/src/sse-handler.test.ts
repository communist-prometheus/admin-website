import { Hono } from 'hono'
import { afterEach, describe, expect, it } from 'vitest'
import type { AuthVariables } from './auth-middleware'
import type { SpanRecord } from './otlp-types'
import type { RbacBindings } from './rbac-policy'
import { broadcast, resetSseBus } from './sse-bus'
import { registerSseRoute, type SseBindings } from './sse-handler'

const span = (
  id: string,
  traceId: string,
  org: string | undefined = undefined
): SpanRecord => ({
  traceId,
  spanId: id,
  parentSpanId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  status: 'ok',
  attributes: org === undefined ? {} : { org },
})

const buildApp = (env: RbacBindings, sub: string) => {
  const app = new Hono<{
    Bindings: SseBindings
    Variables: AuthVariables
  }>()
  app.use('*', async (c, next) => {
    c.set('user', { sub, exp: 0, iat: 0, aud: 'a' })
    await next()
  })
  registerSseRoute(app)
  return { app, env }
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

const adminEnv: RbacBindings = { RBAC_ADMINS: 'alice' }

describe('GET /v1/subscribe', () => {
  afterEach(() => {
    resetSseBus()
  })

  it('returns text/event-stream', async () => {
    const { app, env } = buildApp(adminEnv, 'alice')
    const res = await app.request('/v1/subscribe', {}, env)
    expect(res.headers.get('content-type')).toMatch(/event-stream/)
  })

  it('streams a span event with id after broadcast (admin sees all)', async () => {
    const { app, env } = buildApp(adminEnv, 'alice')
    const res = await app.request('/v1/subscribe', {}, env)
    const reading = readFirstChunk(res)
    await new Promise(r => setTimeout(r, 10))
    broadcast(span('s1', 't1'))
    const chunk = await reading
    expect(chunk).toContain('"kind":"span"')
    expect(chunk).toContain('id: 1')
  })

  it('honours the traceId filter', async () => {
    const { app, env } = buildApp(adminEnv, 'alice')
    const res = await app.request('/v1/subscribe?traceId=wanted', {}, env)
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
    const { app, env } = buildApp(adminEnv, 'alice')
    const res = await app.request(
      '/v1/subscribe',
      { headers: { 'Last-Event-ID': '1' } },
      env
    )
    const chunk = await readChunks(res, 2)
    expect(chunk).toContain('"spanId":"b"')
    expect(chunk).toContain('"spanId":"c"')
    expect(chunk).not.toContain('"spanId":"a"')
  })

  it('hides spans from foreign orgs from non-admin subscribers', async () => {
    const { app, env } = buildApp({ RBAC_ADMINS: '' }, 'bob')
    const res = await app.request('/v1/subscribe', {}, env)
    const reading = readFirstChunk(res)
    await new Promise(r => setTimeout(r, 10))
    broadcast(span('hers', 't1', 'alice'))
    broadcast(span('his', 't2', 'bob'))
    const chunk = await reading
    expect(chunk).toContain('"spanId":"his"')
    expect(chunk).not.toContain('"spanId":"hers"')
  })
})
