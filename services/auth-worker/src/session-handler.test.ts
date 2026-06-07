import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { createApp } from './app'
import { SESSION_COOKIE } from './cookie'
import type { Bindings } from './bindings'

const ENV: Bindings = {
  VERSION: '0.1.0',
  GITHUB_ORG: 'communist-prometheus',
  GITHUB_ADMIN_TEAM: 'admins',
  ALLOWED_ORIGIN: 'https://admin.comprom.org',
  COOKIE_DOMAIN: '.comprom.org',
  JWT_SECRET: 'test-secret',
}

type Stub = {
  readonly login?: { ok: boolean; body?: unknown }
  readonly team?: { ok: boolean; body?: unknown }
}

const stubFetch = (stub: Stub) => {
  vi.stubGlobal('fetch', async (input: RequestInfo) => {
    const url = typeof input === 'string' ? input : input.url
    if (url === 'https://api.github.com/user') {
      const s = stub.login
      return new Response(
        s?.body === undefined ? null : JSON.stringify(s.body),
        { status: s?.ok ? 200 : 401 }
      )
    }
    if (url.startsWith('https://api.github.com/orgs/')) {
      const s = stub.team
      return new Response(
        s?.body === undefined ? null : JSON.stringify(s.body),
        { status: s?.ok ? 200 : 404 }
      )
    }
    return new Response('unexpected', { status: 500 })
  })
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
    expect(res.headers.get('access-control-allow-credentials')).toBe(
      'true'
    )
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
    expect(res.headers.get('access-control-allow-credentials')).toBe(
      'true'
    )
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
