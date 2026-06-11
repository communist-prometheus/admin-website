import type { D1Database } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { mountUnsubscribeRoutes, type UnsubscribeEnv } from './routes'
import { signUnsubscribeToken } from './token'

const SECRET = 'shhh-secret-1234567890abcdef'

let db: D1Database
let subs: SubscriberRepo
let app: Hono<{ Bindings: UnsubscribeEnv }>

const seedActive = async (email: string): Promise<number> => {
  const s = await subs.insert({ email, langs: ['ru'] })
  return s.id
}

beforeEach(() => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  app = new Hono<{ Bindings: UnsubscribeEnv }>()
  mountUnsubscribeRoutes(app)
})

const env: UnsubscribeEnv = (() => {
  const proxy = { UNSUBSCRIBE_SECRET: SECRET } as UnsubscribeEnv & {
    DB: D1Database
  }
  return proxy as UnsubscribeEnv
})()

const bindEnv = (): UnsubscribeEnv =>
  ({
    DB: db,
    UNSUBSCRIBE_SECRET: SECRET,
  }) as UnsubscribeEnv

describe('GET /unsubscribe', () => {
  it('returns 404 with the expired page when the token is missing', async () => {
    const res = await app.fetch(
      new Request('http://x/unsubscribe'),
      bindEnv()
    )
    expect(res.status).toBe(404)
    expect(res.headers.get('Content-Type')).toMatch(/^text\/html/)
    expect(await res.text()).toContain('expired')
  })

  it('returns 404 with the expired page when the token is tampered', async () => {
    await seedActive('a@b.c')
    const res = await app.fetch(
      new Request('http://x/unsubscribe?t=42.tampered'),
      bindEnv()
    )
    expect(res.status).toBe(404)
    expect(await res.text()).toContain('expired')
  })

  it('returns 404 when the token validates but the subscriber is unknown', async () => {
    const ghostToken = await signUnsubscribeToken(999, SECRET)
    const res = await app.fetch(
      new Request(`http://x/unsubscribe?t=${ghostToken}`),
      bindEnv()
    )
    expect(res.status).toBe(404)
    expect(await res.text()).toContain('expired')
  })

  it('does NOT mutate on a valid GET — renders the confirm form instead', async () => {
    const id = await seedActive('a@b.c')
    const token = await signUnsubscribeToken(id, SECRET)
    const res = await app.fetch(
      new Request(`http://x/unsubscribe?t=${token}`),
      bindEnv()
    )
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('<form method="post"')
    expect(body).toContain('type="submit"')
    const after = await subs.findById(id)
    expect(after?.status).toBe('active')
    expect(after?.unsubscribedAt).toBeUndefined()
  })

  it('shows the already-done page for an unsubscribed row (200, no churn)', async () => {
    const id = await seedActive('a@b.c')
    await subs.setStatus(id, 'unsubscribed')
    const before = (await subs.findById(id))?.unsubscribedAt
    const token = await signUnsubscribeToken(id, SECRET)
    const res = await app.fetch(
      new Request(`http://x/unsubscribe?t=${token}`),
      bindEnv()
    )
    expect(res.status).toBe(200)
    expect(await res.text()).not.toContain('<form')
    const after = await subs.findById(id)
    expect(after?.status).toBe('unsubscribed')
    expect(after?.unsubscribedAt).toBe(before)
  })

  it('honours Accept-Language for the rendered confirm page', async () => {
    const id = await seedActive('a@b.c')
    const token = await signUnsubscribeToken(id, SECRET)
    const res = await app.fetch(
      new Request(`http://x/unsubscribe?t=${token}`, {
        headers: { 'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.5' },
      }),
      bindEnv()
    )
    const body = await res.text()
    expect(body).toMatch(/<html lang="ru">/)
    expect(body).toContain('Подтвердите отписку')
  })

  it('form submit (POST) after the GET performs the flip', async () => {
    const id = await seedActive('a@b.c')
    const token = await signUnsubscribeToken(id, SECRET)
    await app.fetch(new Request(`http://x/unsubscribe?t=${token}`), bindEnv())
    const res = await app.fetch(
      new Request(`http://x/unsubscribe?t=${token}`, { method: 'POST' }),
      bindEnv()
    )
    expect(res.status).toBe(200)
    const after = await subs.findById(id)
    expect(after?.status).toBe('unsubscribed')
  })
})

describe('POST /unsubscribe (RFC 8058 one-click)', () => {
  it('returns 200 with empty body on a valid token', async () => {
    const id = await seedActive('a@b.c')
    const token = await signUnsubscribeToken(id, SECRET)
    const res = await app.fetch(
      new Request(`http://x/unsubscribe?t=${token}`, { method: 'POST' }),
      bindEnv()
    )
    expect(res.status).toBe(200)
    expect((await res.text()).length).toBe(0)
    const after = await subs.findById(id)
    expect(after?.status).toBe('unsubscribed')
  })

  it('returns 404 on a tampered token, no mutation', async () => {
    const id = await seedActive('a@b.c')
    const res = await app.fetch(
      new Request('http://x/unsubscribe?t=42.bogus', { method: 'POST' }),
      bindEnv()
    )
    expect(res.status).toBe(404)
    const after = await subs.findById(id)
    expect(after?.status).toBe('active')
  })

  it('is idempotent on a second one-click (still 200)', async () => {
    const id = await seedActive('a@b.c')
    const token = await signUnsubscribeToken(id, SECRET)
    await app.fetch(
      new Request(`http://x/unsubscribe?t=${token}`, { method: 'POST' }),
      bindEnv()
    )
    const res = await app.fetch(
      new Request(`http://x/unsubscribe?t=${token}`, { method: 'POST' }),
      bindEnv()
    )
    expect(res.status).toBe(200)
  })
})

void env
