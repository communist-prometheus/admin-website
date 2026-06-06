import type { D1Database } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSendLogRepo, type SendLogRepo } from '../send-log/repo'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { mountWebhookRoutes, type WebhookEnv } from './routes'
import { signWebhookHeader } from './svix'

const SECRET = 'whsec_dGVzdHNlY3JldGtleS0xMjM0NTY3ODkw'
const NOW_MS = 1_750_000_000_000
const NOW_SEC = String(Math.floor(NOW_MS / 1000))
const SVIX_ID = 'msg_1'

const TICK_AT = '2026-06-06T09:00:00.000Z'

let db: D1Database
let subs: SubscriberRepo
let log: SendLogRepo
let app: Hono<{ Bindings: WebhookEnv }>

const seed = async (
  email: string,
  resendId: string
): Promise<{ readonly id: number }> => {
  const s = await subs.insert({ email, langs: ['ru'] })
  await log.append({
    subscriberId: s.id,
    tickAt: TICK_AT,
    articleCount: 1,
    status: 'sent',
    resendId,
    error: undefined,
  })
  return { id: s.id }
}

beforeEach(() => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
  app = new Hono<{ Bindings: WebhookEnv }>()
  mountWebhookRoutes(app, { now: () => NOW_MS })
})

const bindEnv = (): WebhookEnv =>
  ({
    DB: db,
    RESEND_WEBHOOK_SECRET: SECRET,
  }) as WebhookEnv

const post = async (body: string, headers: Record<string, string>) =>
  app.fetch(
    new Request('http://x/webhooks/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body,
    }),
    bindEnv()
  )

const signedHeaders = async (
  body: string
): Promise<Record<string, string>> => ({
  'svix-id': SVIX_ID,
  'svix-timestamp': NOW_SEC,
  'svix-signature': await signWebhookHeader(SECRET, SVIX_ID, NOW_SEC, body),
})

describe('POST /webhooks/resend — signature failures', () => {
  it('returns 401 when the signature header is missing', async () => {
    await seed('a@b.c', 're_1')
    const res = await post(
      JSON.stringify({ type: 'email.bounced', data: { email_id: 're_1' } }),
      { 'svix-id': SVIX_ID, 'svix-timestamp': NOW_SEC }
    )
    expect(res.status).toBe(401)
    expect((await subs.findById(1))?.status).toBe('active')
  })

  it('returns 401 on a tampered body', async () => {
    const { id } = await seed('a@b.c', 're_1')
    const body = JSON.stringify({
      type: 'email.bounced',
      data: { email_id: 're_1' },
    })
    const headers = await signedHeaders(body)
    const tampered = `${body} `
    const res = await post(tampered, headers)
    expect(res.status).toBe(401)
    expect((await subs.findById(id))?.status).toBe('active')
  })
})

describe('POST /webhooks/resend — email.bounced (R3.10)', () => {
  it('flips status to bounced + appends send_log row', async () => {
    const { id } = await seed('a@b.c', 're_1')
    const body = JSON.stringify({
      type: 'email.bounced',
      data: { email_id: 're_1' },
    })
    const res = await post(body, await signedHeaders(body))
    expect(res.status).toBe(200)
    expect((await subs.findById(id))?.status).toBe('bounced')
    const logs = await log.listRecent(10)
    expect(
      logs.some(r => r.status === 'bounced' && r.resendId === 're_1')
    ).toBe(true)
  })
})

describe('POST /webhooks/resend — email.complained (R3.11)', () => {
  it('flips status to complained + appends send_log row', async () => {
    const { id } = await seed('a@b.c', 're_2')
    const body = JSON.stringify({
      type: 'email.complained',
      data: { email_id: 're_2' },
    })
    const res = await post(body, await signedHeaders(body))
    expect(res.status).toBe(200)
    expect((await subs.findById(id))?.status).toBe('complained')
    const logs = await log.listRecent(10)
    expect(
      logs.some(r => r.status === 'complained' && r.resendId === 're_2')
    ).toBe(true)
  })
})

describe('POST /webhooks/resend — other event types', () => {
  it('returns 200 and is a no-op for non-bounce / non-complaint events', async () => {
    const { id } = await seed('a@b.c', 're_3')
    const body = JSON.stringify({
      type: 'email.delivered',
      data: { email_id: 're_3' },
    })
    const res = await post(body, await signedHeaders(body))
    expect(res.status).toBe(200)
    expect((await subs.findById(id))?.status).toBe('active')
  })
})

describe('POST /webhooks/resend — unknown email_id', () => {
  it('returns 200 (idempotent) and does not change any row', async () => {
    await seed('a@b.c', 're_known')
    const body = JSON.stringify({
      type: 'email.bounced',
      data: { email_id: 're_unknown' },
    })
    const res = await post(body, await signedHeaders(body))
    expect(res.status).toBe(200)
    expect((await subs.findById(1))?.status).toBe('active')
  })
})
