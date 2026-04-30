import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import type { AuthVariables } from './auth-middleware'
import { type DetailBindings, registerDetailRoute } from './detail-handler'

const spanRow = (org: string | undefined) => ({
  trace_id: 't1',
  span_id: 's1',
  parent_span_id: null,
  name: 'op',
  started_at: 100,
  finished_at: 200,
  status: 'ok',
  attrs: org === undefined ? '{}' : JSON.stringify({ org }),
})

const logRow = () => ({
  trace_id: 't1',
  span_id: 's1',
  level: 'info',
  message: 'hi',
  at: 150,
  attrs: '{}',
})

const buildApp = (
  spanRows: ReadonlyArray<unknown>,
  logRows: ReadonlyArray<unknown>,
  admins?: string
) => {
  const prepare = vi.fn().mockImplementation((sql: string) => {
    const isSpans = sql.includes('FROM spans')
    const all = vi.fn().mockResolvedValue({
      results: isSpans ? spanRows : logRows,
      success: true,
    })
    const stmt = { bind: vi.fn(), all, run: vi.fn() }
    stmt.bind.mockReturnValue(stmt)
    return stmt
  })
  const env: DetailBindings = {
    ANALYTICS_DATASET: undefined,
    D1: { prepare },
    RBAC_ADMINS: admins,
  }
  const app = new Hono<{
    Bindings: DetailBindings
    Variables: AuthVariables
  }>()
  app.use('*', async (c, next) => {
    c.set('user', { sub: 'alice', exp: 0, iat: 0, aud: 'a' })
    await next()
  })
  registerDetailRoute(app)
  return { app, env }
}

describe('GET /v1/traces/:traceId', () => {
  it('returns the full span tree + logs for an authorised trace', async () => {
    const { app, env } = buildApp([spanRow('alice')], [logRow()], 'admin1')
    const res = await app.request('/v1/traces/t1', {}, env)
    expect(res.status).toBe(200)
    const body: unknown = await res.json()
    expect(body).toMatchObject({
      traceId: 't1',
      spans: [{ traceId: 't1', spanId: 's1', name: 'op' }],
      logs: [{ traceId: 't1', spanId: 's1', message: 'hi' }],
    })
  })

  it('returns 404 when no spans match the trace id', async () => {
    const { app, env } = buildApp([], [], 'alice')
    const res = await app.request('/v1/traces/nope', {}, env)
    expect(res.status).toBe(404)
  })

  it('returns 403 when the user is not in any of the trace orgs', async () => {
    const { app, env } = buildApp([spanRow('other-org')], [], '')
    const res = await app.request('/v1/traces/t1', {}, env)
    expect(res.status).toBe(403)
  })

  it('lets admins through even when org metadata excludes them', async () => {
    const { app, env } = buildApp([spanRow('other-org')], [], 'alice')
    const res = await app.request('/v1/traces/t1', {}, env)
    expect(res.status).toBe(200)
  })
})
