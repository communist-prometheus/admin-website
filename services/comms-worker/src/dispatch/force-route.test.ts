import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionClaims } from '../auth/session-types'
import { requireSession } from '../middleware/require-session'
import { makeTestD1 } from '../subscribers/test-d1'
import { mountForceDispatchRoute } from './force-route'
import type { DispatchEnv } from './runtime-env'

const claims: SessionClaims = {
  sub: 'undeadliner',
  login: 'undeadliner',
  teams: ['admins'],
  iat: 1,
  exp: 9_999_999_999,
  aud: 'comprom-sso',
  iss: 'auth.comprom.org',
}

type SessionEnv = { JWT_SECRET: string; REQUIRED_TEAM: string }

let env: DispatchEnv
let dispatcher: ReturnType<typeof vi.fn>

const build = () => {
  const app = new Hono<{
    Bindings: DispatchEnv & SessionEnv
    Variables: { readonly session: SessionClaims }
  }>()
  app.use('/api/*', requireSession({ verifier: async () => claims }))
  mountForceDispatchRoute(app, { dispatcher })
  return app
}

const reqWithAccess = (path: string) =>
  new Request(`http://x${path}`, {
    method: 'POST',
    headers: { Cookie: 'comprom_session=tok' },
  })

beforeEach(() => {
  dispatcher = vi
    .fn()
    .mockResolvedValue({ sent: 1, failed: 0, skipped: 0, durationMs: 5 })
  env = {
    DB: makeTestD1(),
    RESEND_API_KEY: 'rk_test',
    UNSUBSCRIBE_SECRET: 'shhh',
    JWT_SECRET: 'unused-in-tests',
    REQUIRED_TEAM: 'admins',
  } as DispatchEnv & SessionEnv
})

describe('POST /api/dispatch — auth gating', () => {
  it('returns 401 without the session cookie', async () => {
    const res = await build().fetch(
      new Request('http://x/api/dispatch?force=1', { method: 'POST' }),
      env
    )
    expect(res.status).toBe(401)
    expect(dispatcher).not.toHaveBeenCalled()
  })
})

describe('POST /api/dispatch — BYPASS_SCHEDULE gating', () => {
  it('returns 404 when BYPASS_SCHEDULE is unset (default prod posture)', async () => {
    const res = await build().fetch(
      reqWithAccess('/api/dispatch?force=1'),
      env
    )
    expect(res.status).toBe(404)
    expect(dispatcher).not.toHaveBeenCalled()
  })

  it('returns 404 when BYPASS_SCHEDULE is set but ?force is missing', async () => {
    const res = await build().fetch(reqWithAccess('/api/dispatch'), {
      ...env,
      BYPASS_SCHEDULE: '1',
    })
    expect(res.status).toBe(404)
    expect(dispatcher).not.toHaveBeenCalled()
  })

  it('runs dispatch with current wall-clock and returns 202 on force=1', async () => {
    const res = await build().fetch(reqWithAccess('/api/dispatch?force=1'), {
      ...env,
      BYPASS_SCHEDULE: '1',
    })
    expect(res.status).toBe(202)
    expect(dispatcher).toHaveBeenCalledOnce()
    const body = (await res.json()) as { sent: number; failed: number }
    expect(body.sent).toBe(1)
  })
})
