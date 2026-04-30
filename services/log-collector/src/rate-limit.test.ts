import { Hono } from 'hono'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type AuthVariables, authMiddleware } from './auth-middleware'
import { signJwt } from './jwt'
import { clearRateBuckets, rateLimit } from './rate-limit'

const SECRET = 'test-secret-32-chars-long-or-better-1234'

const buildApp = (limit: number) => {
  const app = new Hono<{
    Bindings: { JWT_SECRET: string }
    Variables: AuthVariables
  }>()
  app.use('*', authMiddleware())
  app.use('/v1/*', rateLimit(limit))
  app.post('/v1/x', c => c.json({ ok: true }))
  return app
}

const fire = async (
  app: ReturnType<typeof buildApp>,
  token: string
): Promise<Response> =>
  app.fetch(
    new Request('http://localhost/v1/x', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
    { JWT_SECRET: SECRET }
  )

describe('rateLimit', () => {
  beforeEach(clearRateBuckets)
  afterEach(clearRateBuckets)

  it('allows up to the configured limit per user', async () => {
    const app = buildApp(3)
    const token = await signJwt('alice', SECRET)
    expect((await fire(app, token)).status).toBe(200)
    expect((await fire(app, token)).status).toBe(200)
    expect((await fire(app, token)).status).toBe(200)
  })

  it('returns 429 with Retry-After once the limit is hit', async () => {
    const app = buildApp(2)
    const token = await signJwt('alice', SECRET)
    await fire(app, token)
    await fire(app, token)
    const res = await fire(app, token)
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toMatch(/^\d+$/)
  })

  it('isolates buckets per user', async () => {
    const app = buildApp(1)
    const alice = await signJwt('alice', SECRET)
    const bob = await signJwt('bob', SECRET)
    expect((await fire(app, alice)).status).toBe(200)
    expect((await fire(app, alice)).status).toBe(429)
    expect((await fire(app, bob)).status).toBe(200)
  })
})
