import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import {
  type AuthBindings,
  type AuthVariables,
  authMiddleware,
} from './auth-middleware'
import { signJwt } from './jwt'

const SECRET = 'test-secret-32-chars-long-or-better-1234'

const buildApp = () => {
  const app = new Hono<{
    Bindings: AuthBindings
    Variables: AuthVariables
  }>()
  app.use('*', authMiddleware())
  app.get('/health', c => c.json({ ok: true }))
  app.get('/v1/private', c => c.json({ user: c.get('user') }))
  return app
}

describe('authMiddleware', () => {
  it('lets /health through without a token', async () => {
    const res = await buildApp().fetch(
      new Request('http://localhost/health'),
      { JWT_SECRET: SECRET }
    )
    expect(res.status).toBe(200)
  })

  it('rejects protected routes without a token', async () => {
    const res = await buildApp().fetch(
      new Request('http://localhost/v1/private'),
      { JWT_SECRET: SECRET }
    )
    expect(res.status).toBe(401)
  })

  it('rejects protected routes with a malformed token', async () => {
    const res = await buildApp().fetch(
      new Request('http://localhost/v1/private', {
        headers: { Authorization: 'Bearer garbage' },
      }),
      { JWT_SECRET: SECRET }
    )
    expect(res.status).toBe(401)
  })

  it('passes protected routes with a valid token', async () => {
    const token = await signJwt('alice', SECRET)
    const res = await buildApp().fetch(
      new Request('http://localhost/v1/private', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      { JWT_SECRET: SECRET }
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { user: { sub: string } }
    expect(body.user.sub).toBe('alice')
  })

  it('rejects expired tokens (sign with past secret then probe)', async () => {
    const token = await signJwt('alice', SECRET)
    const res = await buildApp().fetch(
      new Request('http://localhost/v1/private', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      { JWT_SECRET: 'mismatched-secret' }
    )
    expect(res.status).toBe(401)
  })
})
