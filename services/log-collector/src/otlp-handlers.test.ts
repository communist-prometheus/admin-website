import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import {
  type AuthBindings,
  type AuthVariables,
  authMiddleware,
} from './auth-middleware'
import { signJwt } from './jwt'
import { type OtlpBindings, registerOtlpRoutes } from './otlp-handlers'

const SECRET = 'test-secret-32-chars-long-or-better-1234'

const buildApp = (bindings: Partial<OtlpBindings> = {}) => {
  const app = new Hono<{
    Bindings: AuthBindings & OtlpBindings
    Variables: AuthVariables
  }>()
  app.use('*', authMiddleware())
  registerOtlpRoutes(app)
  return { app, env: { JWT_SECRET: SECRET, ...bindings } }
}

const span = {
  traceId: 't1',
  spanId: 's1',
  name: 'op',
  startedAt: 1000,
  finishedAt: 1050,
  status: 'ok',
  attributes: { key: 'value' },
}

describe('POST /v1/traces', () => {
  it('rejects without a token', async () => {
    const { app, env } = buildApp()
    const res = await app.fetch(
      new Request('http://localhost/v1/traces', {
        method: 'POST',
        body: JSON.stringify({ spans: [span] }),
      }),
      env
    )
    expect(res.status).toBe(401)
  })

  it('persists spans and returns the accepted count', async () => {
    const writeDataPoint = vi.fn()
    const run = vi.fn().mockResolvedValue({ success: true })
    const bind = vi.fn().mockReturnValue({ run })
    const prepare = vi.fn().mockReturnValue({ bind })
    const { app, env } = buildApp({
      ANALYTICS_DATASET: { writeDataPoint },
      D1: { prepare },
    })
    const token = await signJwt('alice', SECRET)
    const res = await app.fetch(
      new Request('http://localhost/v1/traces', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ spans: [span, span] }),
      }),
      env
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ accepted: 2 })
    expect(writeDataPoint).toHaveBeenCalledTimes(2)
    expect(prepare).toHaveBeenCalledTimes(2)
  })

  it('returns 422 when no valid spans in batch', async () => {
    const { app, env } = buildApp()
    const token = await signJwt('alice', SECRET)
    const res = await app.fetch(
      new Request('http://localhost/v1/traces', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ spans: [{ traceId: 'only' }] }),
      }),
      env
    )
    expect(res.status).toBe(422)
  })
})

describe('POST /v1/logs', () => {
  it('persists logs and returns the accepted count', async () => {
    const run = vi.fn().mockResolvedValue({ success: true })
    const bind = vi.fn().mockReturnValue({ run })
    const prepare = vi.fn().mockReturnValue({ bind })
    const { app, env } = buildApp({
      D1: { prepare },
    })
    const token = await signJwt('alice', SECRET)
    const res = await app.fetch(
      new Request('http://localhost/v1/logs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          logs: [
            {
              level: 'info',
              message: 'hello',
              at: 1000,
              attributes: {},
            },
          ],
        }),
      }),
      env
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ accepted: 1 })
    expect(prepare).toHaveBeenCalledTimes(1)
  })
})
