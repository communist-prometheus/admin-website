import type { D1Database } from '@cloudflare/workers-types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../app'
import type { AccessClaims } from '../auth/cf-access'
import type { Bindings } from '../bindings'
import { makeTestD1 } from '../subscribers/test-d1'
import { signWebhookHeader } from '../webhooks/svix'

const CLAIMS: AccessClaims = {
  aud: 'a',
  iss: 'https://comprom.cloudflareaccess.com',
  email: 'admin@comprom.org',
  sub: 'github|undeadliner',
  exp: 9_999_999_999,
  iat: 1,
}

const RSS_BODY = (lang: string) => `<?xml version="1.0"?>
<rss><channel><title>${lang}</title>
<item>
  <guid>${lang}-a</guid><title>${lang} story A</title>
  <link>https://comprom.org/${lang}/articles/a/</link>
  <pubDate>2026-06-05T08:00:00Z</pubDate>
</item>
<item>
  <guid>${lang}-b</guid><title>${lang} story B</title>
  <link>https://comprom.org/${lang}/articles/b/</link>
  <pubDate>2026-06-04T10:00:00Z</pubDate>
</item>
</channel></rss>`

type ResendCall = { body: string; idempotencyKey: string | null }

const SVIX_SECRET = 'whsec_dGVzdHNlY3JldGtleS0xMjM0NTY3ODkw'

let db: D1Database
let app: ReturnType<typeof createApp>
let resendCalls: ResendCall[]
let resendIdCounter: number

const stubFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.toString()
  if (url.endsWith('/rss.xml')) {
    const lang = /\/(\w+)\/rss\.xml$/.exec(url)?.[1] ?? ''
    return new Response(RSS_BODY(lang), { status: 200 })
  }
  if (url === 'https://api.resend.com/emails') {
    const body = typeof init?.body === 'string' ? init.body : ''
    const headers = new Headers(init?.headers)
    resendCalls.push({
      body,
      idempotencyKey: headers.get('Idempotency-Key'),
    })
    return new Response(JSON.stringify({ id: `re_${++resendIdCounter}` }), {
      status: 200,
    })
  }
  return new Response('not-stubbed', { status: 404 })
}

const env = (): Bindings =>
  ({
    DB: db,
    CF_ACCESS_AUD: 'a',
    CF_ACCESS_TEAM: 'comprom',
    RESEND_API_KEY: 'rk_test',
    UNSUBSCRIBE_SECRET: 'shhh-1234567890abcdef',
    RESEND_WEBHOOK_SECRET: SVIX_SECRET,
    BYPASS_SCHEDULE: '1',
    VERSION: '0.0.0-test',
    ADMIN_HOSTNAME: 'admin.test',
  }) as Bindings

const accessHeaders = {
  'Cf-Access-Jwt-Assertion': 'tok',
  'Content-Type': 'application/json',
}

const adminFetch = (path: string, init: RequestInit = {}) =>
  app.fetch(
    new Request(`http://x${path}`, {
      ...init,
      headers: { ...accessHeaders, ...init.headers },
    }),
    env()
  )

const publicFetch = (path: string, init: RequestInit = {}) =>
  app.fetch(new Request(`http://x${path}`, init), env())

beforeEach(() => {
  db = makeTestD1()
  app = createApp({ accessVerifier: async () => CLAIMS })
  resendCalls = []
  resendIdCounter = 0
  vi.stubGlobal('fetch', stubFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('full-flow happy path (T7.4)', () => {
  it('add → schedule → force-dispatch → unsubscribe → re-dispatch → webhook', async () => {
    const add = await adminFetch('/api/subscribers', {
      method: 'POST',
      body: JSON.stringify({
        email: 'e2e-bot@example.test',
        langs: ['ru', 'en'],
      }),
    })
    expect(add.status).toBe(201)
    const sub = (await add.json()) as { id: number; email: string }

    const put = await adminFetch('/api/schedule', {
      method: 'PUT',
      body: JSON.stringify({ cron: '* * * * *', timezone: 'Etc/UTC' }),
    })
    expect(put.status).toBe(200)

    const tick1 = await adminFetch('/api/dispatch?force=1', {
      method: 'POST',
    })
    expect(tick1.status).toBe(202)
    expect(resendCalls).toHaveLength(1)
    const captured = JSON.parse(resendCalls[0]?.body ?? '{}') as {
      to: string[]
      html: string
      headers: Record<string, string>
    }
    expect(captured.to).toEqual(['e2e-bot@example.test'])
    expect(captured.html).toContain('[ru]')
    expect(captured.html).toContain('[en]')

    const listUnsub = captured.headers['List-Unsubscribe'] ?? ''
    const unsubUrl = listUnsub.replace(/^<|>$/g, '')
    const tokenMatch = /[?&]t=([^&]+)/.exec(unsubUrl)
    expect(tokenMatch).not.toBeNull()
    const token = tokenMatch?.[1] ?? ''

    const oneClick = await publicFetch(`/unsubscribe?t=${token}`, {
      method: 'POST',
    })
    expect(oneClick.status).toBe(200)

    const beforeTick2 = resendCalls.length
    const tick2 = await adminFetch('/api/dispatch?force=1', {
      method: 'POST',
    })
    expect(tick2.status).toBe(202)
    expect(resendCalls.length - beforeTick2).toBe(0)

    const list = await adminFetch('/api/subscribers')
    const listBody = (await list.json()) as {
      subscribers: { id: number; status: string }[]
    }
    const row = listBody.subscribers.find(s => s.id === sub.id)
    expect(row?.status).toBe('unsubscribed')

    const runs = await adminFetch('/api/runs?limit=10')
    expect(runs.status).toBe(200)
    const runsBody = (await runs.json()) as {
      runs: { status: string; email?: string }[]
    }
    expect(runsBody.runs.some(r => r.status === 'sent')).toBe(true)
  })

  it('webhook bounce flips status; next force-dispatch skips that row', async () => {
    const add = await adminFetch('/api/subscribers', {
      method: 'POST',
      body: JSON.stringify({
        email: 'bouncer@example.test',
        langs: ['ru'],
      }),
    })
    const sub = (await add.json()) as { id: number }
    await adminFetch('/api/schedule', {
      method: 'PUT',
      body: JSON.stringify({ cron: '* * * * *', timezone: 'Etc/UTC' }),
    })
    const firstTick = await adminFetch('/api/dispatch?force=1', {
      method: 'POST',
    })
    expect(firstTick.status).toBe(202)
    expect(resendCalls).toHaveLength(1)

    const svixId = 'msg_bounce'
    const ts = String(Math.floor(Date.now() / 1000))
    const payload = JSON.stringify({
      type: 'email.bounced',
      data: { email_id: 're_1' },
    })
    const signature = await signWebhookHeader(
      SVIX_SECRET,
      svixId,
      ts,
      payload
    )
    const webhook = await app.fetch(
      new Request('http://x/webhooks/resend', {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          'svix-id': svixId,
          'svix-timestamp': ts,
          'svix-signature': signature,
        },
      }),
      env()
    )
    expect(webhook.status).toBe(200)

    const beforeTick2 = resendCalls.length
    await adminFetch('/api/dispatch?force=1', { method: 'POST' })
    expect(resendCalls.length).toBe(beforeTick2)

    const list = await adminFetch('/api/subscribers')
    const listBody = (await list.json()) as {
      subscribers: { id: number; status: string }[]
    }
    const row = listBody.subscribers.find(s => s.id === sub.id)
    expect(row?.status).toBe('bounced')
  })
})
