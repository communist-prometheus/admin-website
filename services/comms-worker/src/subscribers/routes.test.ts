import { Hono } from 'hono'
import { beforeEach, describe, expect, it } from 'vitest'
import type { AccessClaims } from '../auth/cf-access'
import { requireAccess } from '../middleware/require-access'
import { createRepo } from './repo'
import { mountSubscriberRoutes } from './routes'
import { makeTestD1 } from './test-d1'
import type { Subscriber } from './types'

const claims: AccessClaims = {
  aud: 'a',
  iss: 'https://comprom.cloudflareaccess.com',
  email: 'admin@comprom.org',
  sub: 'github|undeadliner',
  exp: 9_999_999_999,
  iat: 1,
}

const env = { CF_ACCESS_AUD: 'a', CF_ACCESS_TEAM: 'comprom' }

const build = () => {
  const repo = createRepo({
    db: makeTestD1(),
    now: () => '2026-06-03T08:00:00.000Z',
  })
  const app = new Hono<{
    Bindings: typeof env
    Variables: { readonly access: AccessClaims }
  }>()
  app.use('/api/*', requireAccess({ verifier: async () => claims }))
  mountSubscriberRoutes(app, () => repo)
  return { app, repo }
}

const reqJson = (path: string, init: RequestInit = {}) =>
  new Request(`http://x${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Cf-Access-Jwt-Assertion': 'tok',
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
  it('rejects when the access header is missing', async () => {
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
