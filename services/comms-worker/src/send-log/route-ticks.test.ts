import type { D1Database } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { beforeEach, describe, expect, it } from 'vitest'
import type { SessionClaims } from '../auth/session-types'
import { requireSession } from '../middleware/require-session'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { createSendLogRepo, type SendLogRepo } from './repo'
import { mountRunsRoute } from './route'

/*
 * The editor's journal needs two reads: the list of dispatches, and —
 * on opening one — who that dispatch reached and how it ended for each
 * of them. The per-recipient `/api/runs` feed answers neither on its own.
 */

const claims: SessionClaims = {
  sub: 'undeadliner',
  login: 'undeadliner',
  roles: ['owner'],
  iat: 1,
  exp: 9_999_999_999,
  aud: 'comprom-sso',
  iss: 'auth.comprom.org',
}

const TICK = '2026-08-08T09:00:00.000Z'
const OLDER = '2026-07-25T09:00:00.000Z'

let db: D1Database
let subs: SubscriberRepo
let log: SendLogRepo
let app: Hono<{
  Bindings: { JWT_SECRET: string; DB: D1Database }
  Variables: { readonly session: SessionClaims }
}>

const buildEnv = () => ({ JWT_SECRET: 'unused', DB: db })

const get = (path: string) =>
  app.fetch(
    new Request(`http://x${path}`, {
      headers: { Cookie: 'comprom_session=tok' },
    }),
    buildEnv()
  )

const record = async (
  email: string,
  tickAt: string,
  status: 'sent' | 'failed' | 'bounced'
): Promise<void> => {
  const sub = await subs.insert({ email, langs: ['ru'] })
  await log.append({
    subscriberId: sub.id,
    tickAt,
    articleCount: 2,
    status,
    resendId: status === 'sent' ? `re_${email}` : undefined,
    error: status === 'failed' ? 'resend 500' : undefined,
  })
}

beforeEach(async () => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
  app = new Hono<{
    Bindings: { JWT_SECRET: string; DB: D1Database }
    Variables: { readonly session: SessionClaims }
  }>()
  app.use('/api/*', requireSession({ verifier: async () => claims }))
  mountRunsRoute(app)
  await record('a@x.t', TICK, 'sent')
  await record('b@x.t', TICK, 'failed')
  await record('c@x.t', OLDER, 'sent')
})

describe('GET /api/runs/ticks', () => {
  it('rejects without the session cookie', async () => {
    const res = await app.fetch(
      new Request('http://x/api/runs/ticks'),
      buildEnv()
    )
    expect(res.status).toBe(401)
  })

  it('lists one entry per dispatch, newest first', async () => {
    const res = await get('/api/runs/ticks')
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ticks: ReadonlyArray<{
        tickAt: string
        recipients: number
        sent: number
        failed: number
      }>
    }
    expect(body.ticks.map(t => t.tickAt)).toEqual([TICK, OLDER])
    expect(body.ticks[0]).toMatchObject({ recipients: 2, sent: 1, failed: 1 })
  })
})

describe('GET /api/runs/tick', () => {
  it('names every recipient of one dispatch with its outcome', async () => {
    const res = await get(`/api/runs/tick?at=${encodeURIComponent(TICK)}`)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      runs: ReadonlyArray<{ email?: string; status: string; error?: string }>
    }
    expect(body.runs).toHaveLength(2)
    const failed = body.runs.find(r => r.status === 'failed')
    expect(failed).toMatchObject({ email: 'b@x.t', error: 'resend 500' })
  })

  it('refuses a request that names no dispatch', async () => {
    const res = await get('/api/runs/tick')
    expect(res.status).toBe(400)
  })

  it('returns an empty list for a dispatch that wrote nothing', async () => {
    const res = await get('/api/runs/tick?at=2020-01-01T00:00:00.000Z')
    expect(res.status).toBe(200)
    expect(((await res.json()) as { runs: unknown[] }).runs).toEqual([])
  })
})
