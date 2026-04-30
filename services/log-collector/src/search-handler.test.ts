import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import type { AuthVariables } from './auth-middleware'
import { registerSearchRoute, type SearchBindings } from './search-handler'

const buildApp = (rows: ReadonlyArray<Record<string, unknown>>) => {
  const all = vi.fn().mockResolvedValue({ results: rows, success: true })
  const stmt = { bind: vi.fn(), all, run: vi.fn() }
  stmt.bind.mockReturnValue(stmt)
  const prepare = vi.fn().mockReturnValue(stmt)
  const env: SearchBindings = {
    ANALYTICS_DATASET: undefined,
    D1: { prepare },
  }
  const app = new Hono<{
    Bindings: SearchBindings
    Variables: AuthVariables
  }>()
  registerSearchRoute(app)
  return { app, env }
}

const fakeRow = {
  trace_id: 'abc',
  root_span_id: 'r',
  root_name: 'git.push',
  root_status: 'ok',
  started_at: 100,
  span_count: 3,
  duration_ms: 50,
}

describe('GET /v1/traces', () => {
  it('returns shaped JSON with traces + nextCursor', async () => {
    const { app, env } = buildApp([fakeRow])
    const res = await app.request('/v1/traces?limit=1', {}, env)
    expect(res.status).toBe(200)
    const body: unknown = await res.json()
    expect(body).toEqual({
      traces: [
        {
          traceId: 'abc',
          rootSpanId: 'r',
          rootName: 'git.push',
          status: 'ok',
          startedAt: 100,
          spanCount: 3,
          durationMs: 50,
        },
      ],
      nextCursor: 100,
    })
  })

  it('returns an empty list when D1 finds no matches', async () => {
    const { app, env } = buildApp([])
    const res = await app.request('/v1/traces?org=other', {}, env)
    const body: { traces: unknown[]; nextCursor: unknown } = await res.json()
    expect(body.traces).toEqual([])
    expect(body.nextCursor).toBeUndefined()
  })
})
