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
  roles: ['owner'],
  iat: 1,
  exp: 9_999_999_999,
  aud: 'comprom-sso',
  iss: 'auth.comprom.org',
}

type SessionEnv = { JWT_SECRET: string }

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

describe('POST /api/dispatch — ?force=1 opt-in', () => {
  it('returns 404 when ?force is missing', async () => {
    const res = await build().fetch(reqWithAccess('/api/dispatch'), env)
    expect(res.status).toBe(404)
    expect(dispatcher).not.toHaveBeenCalled()
  })

  it('returns 404 when ?force is something other than 1', async () => {
    const res = await build().fetch(
      reqWithAccess('/api/dispatch?force=0'),
      env
    )
    expect(res.status).toBe(404)
    expect(dispatcher).not.toHaveBeenCalled()
  })

  it('runs dispatch with current wall-clock and returns 202 on force=1', async () => {
    const res = await build().fetch(
      reqWithAccess('/api/dispatch?force=1'),
      env
    )
    expect(res.status).toBe(202)
    expect(dispatcher).toHaveBeenCalledOnce()
    const body = (await res.json()) as { sent: number; failed: number }
    expect(body.sent).toBe(1)
  })

  it('forwards the selected subscriber ids as the dispatcher target', async () => {
    const req = new Request('http://x/api/dispatch?force=1', {
      method: 'POST',
      headers: {
        Cookie: 'comprom_session=tok',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriberIds: [2, 5] }),
    })
    const res = await build().fetch(req, env)
    expect(res.status).toBe(202)
    expect(dispatcher).toHaveBeenCalledWith(env, expect.any(Date), [2, 5])
  })

  it('passes undefined target when no body is supplied (everyone)', async () => {
    await build().fetch(reqWithAccess('/api/dispatch?force=1'), env)
    expect(dispatcher).toHaveBeenCalledWith(env, expect.any(Date), undefined)
  })
})
