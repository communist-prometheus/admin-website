import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from './app'
import type { Bindings } from './bindings'
import { SESSION_COOKIE } from './cookie'

const ENV: Bindings = {
  VERSION: '0.1.0',
  GITHUB_ORG: 'communist-prometheus',
  GITHUB_ADMIN_TEAM: 'admins',
  ALLOWED_ORIGIN: 'https://admin.comprom.org',
  COOKIE_DOMAIN: '.comprom.org',
  JWT_SECRET: 'test-secret',
}

type StubResponse = { ok: boolean; body?: unknown }
type Stub = {
  readonly login?: StubResponse
  readonly team?: StubResponse
}

const buildResponse = (
  s: StubResponse | undefined,
  okStatus: number,
  failStatus: number
): Response => {
  const body = s?.body === undefined ? null : JSON.stringify(s.body)
  return new Response(body, { status: s?.ok ? okStatus : failStatus })
}

const routeStub = (stub: Stub, url: string): Response => {
  if (url === 'https://api.github.com/user') {
    return buildResponse(stub.login, 200, 401)
  }
  return url.startsWith('https://api.github.com/orgs/')
    ? buildResponse(stub.team, 200, 404)
    : new Response('unexpected', { status: 500 })
}

const stubFetch = (stub: Stub) => {
  vi.stubGlobal('fetch', async (input: RequestInfo) =>
    routeStub(stub, typeof input === 'string' ? input : input.url)
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(1_780_000_000_000))
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const post = (token?: string): Request => {
  const headers = new Headers({ Origin: 'https://admin.comprom.org' })
  if (token !== undefined) headers.set('Authorization', `Bearer ${token}`)
  return new Request('http://localhost/auth/session', {
    method: 'POST',
    headers,
  })
}

describe('POST /auth/session', () => {
  it('mints a cookie + body for an active admin team member', async () => {
    stubFetch({
      login: { ok: true, body: { login: 'undeadliner' } },
      team: { ok: true, body: { state: 'active' } },
    })
    const res = await createApp().fetch(post('ghp_OK'), ENV)
    expect(res.status).toBe(200)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${SESSION_COOKIE}=`)
    expect(setCookie).toContain('Domain=.comprom.org')
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('Secure')
    const body = (await res.json()) as {
      login: string
      teams: string[]
      expires: number
    }
    expect(body.login).toBe('undeadliner')
    expect(body.teams).toEqual(['admins'])
    expect(body.expires).toBeGreaterThan(0)
  })

  it('returns 401 when the Authorization header is missing', async () => {
    stubFetch({})
    const res = await createApp().fetch(post(), ENV)
    expect(res.status).toBe(401)
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('returns 401 when GitHub rejects the token', async () => {
    stubFetch({ login: { ok: false } })
    const res = await createApp().fetch(post('ghp_BAD'), ENV)
    expect(res.status).toBe(401)
  })

  it('returns 403 when the login is not an admin team member', async () => {
    stubFetch({
      login: { ok: true, body: { login: 'outsider' } },
      team: { ok: false },
    })
    const res = await createApp().fetch(post('ghp_OK'), ENV)
    expect(res.status).toBe(403)
  })

  it('returns 403 for a pending (not yet accepted) team invitation', async () => {
    stubFetch({
      login: { ok: true, body: { login: 'pendinguser' } },
      team: { ok: true, body: { state: 'pending' } },
    })
    const res = await createApp().fetch(post('ghp_OK'), ENV)
    expect(res.status).toBe(403)
  })

  it('echoes the allowed origin in CORS headers', async () => {
    stubFetch({
      login: { ok: true, body: { login: 'undeadliner' } },
      team: { ok: true, body: { state: 'active' } },
    })
    const res = await createApp().fetch(post('ghp_OK'), ENV)
    expect(res.headers.get('access-control-allow-origin')).toBe(
      'https://admin.comprom.org'
    )
    expect(res.headers.get('access-control-allow-credentials')).toBe('true')
  })
})

describe('OPTIONS preflight', () => {
  it('returns 204 with CORS headers and no body', async () => {
    const req = new Request('http://localhost/auth/session', {
      method: 'OPTIONS',
      headers: new Headers({ Origin: 'https://admin.comprom.org' }),
    })
    const res = await createApp().fetch(req, ENV)
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-credentials')).toBe('true')
  })

  it('does not emit CORS headers for an unknown origin', async () => {
    const req = new Request('http://localhost/auth/session', {
      method: 'OPTIONS',
      headers: new Headers({ Origin: 'https://attacker.example' }),
    })
    const res = await createApp().fetch(req, ENV)
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })
})

describe('POST /auth/logout', () => {
  it('clears the cookie via Max-Age=0', async () => {
    const req = new Request('http://localhost/auth/logout', {
      method: 'POST',
      headers: new Headers({ Origin: 'https://admin.comprom.org' }),
    })
    const res = await createApp().fetch(req, ENV)
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie') ?? '').toContain('Max-Age=0')
  })
})
