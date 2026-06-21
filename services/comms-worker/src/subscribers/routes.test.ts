import { Hono } from 'hono'
import { beforeEach, describe, expect, it } from 'vitest'
import type { SessionClaims } from '../auth/session-types'
import { requireSession } from '../middleware/require-session'
import { createRepo } from './repo'
import { mountSubscriberRoutes } from './routes'
import { makeTestD1 } from './test-d1'
import type { Subscriber } from './types'

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

const build = () => {
  const repo = createRepo({
    db: makeTestD1(),
    now: () => '2026-06-03T08:00:00.000Z',
  })
  const app = new Hono<{
    Bindings: typeof env
    Variables: { readonly session: SessionClaims }
  }>()
  app.use('/api/*', requireSession({ verifier: async () => claims }))
  mountSubscriberRoutes(app, () => repo)
  return { app, repo }
}

const reqJson = (path: string, init: RequestInit = {}) =>
  new Request(`http://x${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'comprom_session=tok',
      ...init.headers,
    },
  })

let app: ReturnType<typeof build>['app']
let repo: ReturnType<typeof build>['repo']

beforeEach(() => {
  const b = build()
  app = b.app
  repo = b.repo
})

describe('POST /api/subscribers', () => {
  it('rejects when the session cookie is missing', async () => {
    const res = await app.fetch(
      new Request('http://x/api/subscribers', { method: 'POST' }),
      env
    )
    expect(res.status).toBe(401)
  })

  it('creates a new active row and returns 201', async () => {
    const res = await app.fetch(
      reqJson('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.c', langs: ['ru'] }),
      }),
      env
    )
    expect(res.status).toBe(201)
    const body = (await res.json()) as Subscriber
    expect(body.email).toBe('a@b.c')
    expect(body.langs).toEqual(['ru'])
  })

  it('defaults messageLang to en when omitted', async () => {
    const res = await app.fetch(
      reqJson('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.c', langs: ['ru'] }),
      }),
      env
    )
    expect(res.status).toBe(201)
    const body = (await res.json()) as Subscriber
    expect(body.messageLang).toBe('en')
  })

  it('persists an explicit messageLang', async () => {
    const res = await app.fetch(
      reqJson('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({
          email: 'a@b.c',
          langs: ['ru'],
          messageLang: 'ru',
        }),
      }),
      env
    )
    expect(res.status).toBe(201)
    const body = (await res.json()) as Subscriber
    expect(body.messageLang).toBe('ru')
  })

  it('returns 422 for an unknown messageLang', async () => {
    const res = await app.fetch(
      reqJson('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({
          email: 'a@b.c',
          langs: ['ru'],
          messageLang: 'xx',
        }),
      }),
      env
    )
    expect(res.status).toBe(422)
  })

  it('returns 422 for invalid email syntax', async () => {
    const res = await app.fetch(
      reqJson('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email: 'not-an-email', langs: ['ru'] }),
      }),
      env
    )
    expect(res.status).toBe(422)
  })

  it('returns 422 when langs is empty', async () => {
    const res = await app.fetch(
      reqJson('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.c', langs: [] }),
      }),
      env
    )
    expect(res.status).toBe(422)
  })

  it('returns 409 for duplicate active emails', async () => {
    await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    const res = await app.fetch(
      reqJson('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.c', langs: ['en'] }),
      }),
      env
    )
    expect(res.status).toBe(409)
  })
})

describe('GET /api/subscribers', () => {
  it('lists all rows including unsubscribed', async () => {
    const a = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    await repo.insert({ email: 'b@b.c', langs: ['en'] })
    await repo.setStatus(a.id, 'unsubscribed')
    const res = await app.fetch(reqJson('/api/subscribers'), env)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      readonly subscribers: ReadonlyArray<Subscriber>
    }
    expect(body.subscribers).toHaveLength(2)
  })
})

describe('PATCH /api/subscribers/:id', () => {
  it('updates langs and returns the new row', async () => {
    const s = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    const res = await app.fetch(
      reqJson(`/api/subscribers/${s.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ langs: ['en', 'it'] }),
      }),
      env
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as Subscriber
    expect(body.langs).toEqual(['en', 'it'])
  })

  it('updates messageLang and returns the new row', async () => {
    const s = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    const res = await app.fetch(
      reqJson(`/api/subscribers/${s.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ messageLang: 'it' }),
      }),
      env
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as Subscriber
    expect(body.messageLang).toBe('it')
  })

  it('returns 422 for an empty patch', async () => {
    const s = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    const res = await app.fetch(
      reqJson(`/api/subscribers/${s.id}`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      }),
      env
    )
    expect(res.status).toBe(422)
  })

  it('returns 404 for unknown id', async () => {
    const res = await app.fetch(
      reqJson('/api/subscribers/999', {
        method: 'PATCH',
        body: JSON.stringify({ langs: ['ru'] }),
      }),
      env
    )
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/subscribers/:id', () => {
  it('hard-deletes the row', async () => {
    const s = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    const res = await app.fetch(
      reqJson(`/api/subscribers/${s.id}`, { method: 'DELETE' }),
      env
    )
    expect(res.status).toBe(204)
    expect(await repo.findById(s.id)).toBeUndefined()
  })

  it('returns 404 for unknown id', async () => {
    const res = await app.fetch(
      reqJson('/api/subscribers/999', { method: 'DELETE' }),
      env
    )
    expect(res.status).toBe(404)
  })
})
