import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import type { AccessClaims } from '../auth/cf-access'
import { type RequireAccessEnv, requireAccess } from './require-access'

const claims: AccessClaims = {
  aud: 'aud-tag',
  iss: 'https://comprom.cloudflareaccess.com',
  email: 'admin@comprom.org',
  sub: 'github|undeadliner',
  exp: 9_999_999_999,
  iat: 1_700_000_000,
}

const env: RequireAccessEnv = {
  CF_ACCESS_AUD: 'aud-tag',
  CF_ACCESS_TEAM: 'comprom',
}

type Vars = { readonly access: AccessClaims }

const build = (
  verifier: (token: string) => Promise<AccessClaims | undefined>
) => {
  const app = new Hono<{ Bindings: RequireAccessEnv; Variables: Vars }>()
  app.use('/api/*', requireAccess({ verifier }))
  app.get('/api/echo', c => c.json({ email: c.var.access.email }))
  return app
}

describe('requireAccess middleware', () => {
  it('rejects when the header is missing', async () => {
    const verifier = vi.fn()
    const app = build(verifier)
    const res = await app.fetch(new Request('http://x/api/echo'), env)
    expect(res.status).toBe(401)
    expect(verifier).not.toHaveBeenCalled()
  })

  it('rejects when the verifier returns undefined', async () => {
    const verifier = vi.fn().mockResolvedValue(undefined)
    const app = build(verifier)
    const res = await app.fetch(
      new Request('http://x/api/echo', {
        headers: { 'Cf-Access-Jwt-Assertion': 'bad' },
      }),
      env
    )
    expect(res.status).toBe(401)
    expect(verifier).toHaveBeenCalledWith('bad')
  })

  it('passes through and exposes claims on c.var.access', async () => {
    const verifier = vi.fn().mockResolvedValue(claims)
    const app = build(verifier)
    const res = await app.fetch(
      new Request('http://x/api/echo', {
        headers: { 'Cf-Access-Jwt-Assertion': 'ok' },
      }),
      env
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ email: 'admin@comprom.org' })
  })
})
