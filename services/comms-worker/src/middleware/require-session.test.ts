import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { SESSION_COOKIE } from '../auth/session-cookie'
import { ROLE_OWNER, type SessionClaims } from '../auth/session-types'
import {
  type RequireSessionEnv,
  type RequireSessionVariables,
  requireSession,
} from './require-session'

const ENV: RequireSessionEnv = {
  JWT_SECRET: 'unused-in-tests',
}

const buildApp = (
  verifier: (t: string) => Promise<SessionClaims | undefined>
) => {
  const app = new Hono<{
    Bindings: RequireSessionEnv
    Variables: RequireSessionVariables
  }>()
  app.use('/api/*', requireSession({ verifier }))
  app.get('/api/ping', c =>
    c.json({ ok: true, login: c.get('session').login })
  )
  return app
}

const validClaims: SessionClaims = {
  sub: 'undeadliner',
  login: 'undeadliner',
  roles: [ROLE_OWNER],
  iat: 1_780_000_000,
  exp: 1_780_086_400,
  aud: 'comprom-sso',
  iss: 'auth.comprom.org',
}

const req = (cookieHeader?: string): Request => {
  const headers = new Headers()
  if (cookieHeader !== undefined) headers.set('cookie', cookieHeader)
  return new Request('http://localhost/api/ping', { headers })
}

describe('requireSession middleware', () => {
  it('returns 401 when the cookie header is missing', async () => {
    const app = buildApp(async () => validClaims)
    const res = await app.fetch(req(), ENV)
    expect(res.status).toBe(401)
  })

  it('returns 401 when no comprom_session cookie is present', async () => {
    const app = buildApp(async () => validClaims)
    const res = await app.fetch(req('other=cookie'), ENV)
    expect(res.status).toBe(401)
  })

  it('returns 401 when the verifier rejects the token', async () => {
    const app = buildApp(async () => undefined)
    const res = await app.fetch(req(`${SESSION_COOKIE}=BAD`), ENV)
    expect(res.status).toBe(401)
  })

  it('returns 403 when the verified claims lack the owner role', async () => {
    const app = buildApp(async () => ({
      ...validClaims,
      roles: ['editor'],
    }))
    const res = await app.fetch(req(`${SESSION_COOKIE}=OK`), ENV)
    expect(res.status).toBe(403)
  })

  it('allows the request when owner is present and exposes claims on c.var', async () => {
    const app = buildApp(async () => validClaims)
    const res = await app.fetch(req(`${SESSION_COOKIE}=OK`), ENV)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean; login: string }
    expect(body.ok).toBe(true)
    expect(body.login).toBe('undeadliner')
  })

  it('passes the cookie value to the verifier, not the whole header', async () => {
    let seen = ''
    const app = buildApp(async (t: string) => {
      seen = t
      return validClaims
    })
    await app.fetch(req(`foo=bar; ${SESSION_COOKIE}=THE_TOKEN; baz=qux`), ENV)
    expect(seen).toBe('THE_TOKEN')
  })
})
