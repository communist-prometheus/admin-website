import type { D1Database } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { beforeEach, describe, expect, it } from 'vitest'
import type { SessionClaims } from '../auth/session-types'
import { requireSession } from '../middleware/require-session'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { createSendLogRepo, type SendLogRepo } from './repo'
import { mountRunsRoute } from './route'

const claims: SessionClaims = {
  sub: 'undeadliner',
  login: 'undeadliner',
  roles: ['owner'],
  iat: 1,
  exp: 9_999_999_999,
  aud: 'comprom-sso',
  iss: 'auth.comprom.org',
}

const env = { JWT_SECRET: 'unused-in-tests' }

let db: D1Database
let subs: SubscriberRepo
let log: SendLogRepo
let app: Hono<{
  Bindings: typeof env & { DB: D1Database }
  Variables: { readonly session: SessionClaims }
}>

const buildEnv = () => ({ ...env, DB: db })

const seed = async (email: string): Promise<{ readonly id: number }> => {
  const s = await subs.insert({ email, langs: ['ru'] })
  return { id: s.id }
}

const populate = async (rows: number) => {
  for (let i = 0; i < rows; i++) {
    const { id } = await seed(`s${i}@x.t`)
    await log.append({
      subscriberId: id,
      tickAt: `2026-06-${String(rows - i).padStart(2, '0')}T00:00:00.000Z`,
      articleCount: i + 1,
      status: i % 5 === 0 ? 'failed' : 'sent',
      resendId: i % 5 === 0 ? undefined : `re_${i}`,
      error: i % 5 === 0 ? 'resend 500' : undefined,
    })
  }
}

beforeEach(() => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
  app = new Hono<{
    Bindings: typeof env & { DB: D1Database }
    Variables: { readonly session: SessionClaims }
  }>()
  app.use('/api/*', requireSession({ verifier: async () => claims }))
  mountRunsRoute(app)
})

const reqWithAccess = (path: string) =>
  new Request(`http://x${path}`, {
    headers: { Cookie: 'comprom_session=tok' },
  })

describe('GET /api/runs', () => {
  it('rejects without the session cookie', async () => {
    const res = await app.fetch(new Request('http://x/api/runs'), buildEnv())
    expect(res.status).toBe(401)
  })

  it('returns the default 20 newest rows when limit is absent', async () => {
    await populate(30)
    const res = await app.fetch(reqWithAccess('/api/runs'), buildEnv())
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      runs: ReadonlyArray<{ tickAt: string; email?: string }>
    }
    expect(body.runs).toHaveLength(20)
    expect(body.runs[0]?.email).toBe('s0@x.t')
  })

  it('caps the limit at 100 even when the client asks for more', async () => {
    await populate(120)
    const res = await app.fetch(
      reqWithAccess('/api/runs?limit=500'),
      buildEnv()
    )
    const body = (await res.json()) as { runs: ReadonlyArray<unknown> }
    expect(body.runs).toHaveLength(100)
  })

  it('respects ?limit=N when N is in range', async () => {
    await populate(10)
    const res = await app.fetch(
      reqWithAccess('/api/runs?limit=5'),
      buildEnv()
    )
    const body = (await res.json()) as { runs: ReadonlyArray<unknown> }
    expect(body.runs).toHaveLength(5)
  })

  it('falls back to the default limit when ?limit is not a positive integer', async () => {
    await populate(25)
    const res = await app.fetch(
      reqWithAccess('/api/runs?limit=not-a-number'),
      buildEnv()
    )
    const body = (await res.json()) as { runs: ReadonlyArray<unknown> }
    expect(body.runs).toHaveLength(20)
  })

  it('surfaces error + status=failed on rows with a Resend failure', async () => {
    await populate(2)
    const res = await app.fetch(
      reqWithAccess('/api/runs?limit=10'),
      buildEnv()
    )
    const body = (await res.json()) as {
      runs: ReadonlyArray<{ status: string; error?: string }>
    }
    const failed = body.runs.find(r => r.status === 'failed')
    expect(failed?.error).toBe('resend 500')
  })
})
