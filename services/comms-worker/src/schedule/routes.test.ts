import { Hono } from 'hono'
import { beforeEach, describe, expect, it } from 'vitest'
import type { AccessClaims } from '../auth/cf-access'
import { requireAccess } from '../middleware/require-access'
import { createSettingsRepo } from '../settings/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { mountScheduleRoutes } from './routes'

const claims: AccessClaims = {
  aud: 'a',
  iss: 'https://comprom.cloudflareaccess.com',
  email: 'admin@comprom.org',
  sub: 'github|undeadliner',
  exp: 9_999_999_999,
  iat: 1,
}

const env = { CF_ACCESS_AUD: 'a', CF_ACCESS_TEAM: 'comprom' }
const FROZEN = new Date('2026-06-01T00:00:00.000Z')

const build = () => {
  const repo = createSettingsRepo({ db: makeTestD1() })
  const app = new Hono<{
    Bindings: typeof env
    Variables: { readonly access: AccessClaims }
  }>()
  app.use('/api/*', requireAccess({ verifier: async () => claims }))
  mountScheduleRoutes(
    app,
    () => repo,
    () => FROZEN
  )
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

beforeEach(() => {
  app = build().app
})

describe('GET /api/schedule', () => {
  it('rejects when the access header is missing', async () => {
    const res = await app.fetch(new Request('http://x/api/schedule'), env)
    expect(res.status).toBe(401)
  })

  it('returns the seeded default schedule with nextRunAt', async () => {
    const res = await app.fetch(reqJson('/api/schedule'), env)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      cron: string
      timezone: string
      nextRunAt: string
    }
    expect(body.cron).toBe('0 12 * * 6')
    expect(body.timezone).toBe('Europe/Moscow')
    expect(body.nextRunAt).toBe('2026-06-06T09:00:00.000Z')
  })
})

describe('PUT /api/schedule', () => {
  it('rejects when the access header is missing', async () => {
    const res = await app.fetch(
      new Request('http://x/api/schedule', { method: 'PUT' }),
      env
    )
    expect(res.status).toBe(401)
  })

  it('returns 422 with parser message on bad cron', async () => {
    const res = await app.fetch(
      reqJson('/api/schedule', {
        method: 'PUT',
        body: JSON.stringify({
          cron: 'not a cron',
          timezone: 'Etc/UTC',
        }),
      }),
      env
    )
    expect(res.status).toBe(422)
    const body = (await res.json()) as { error: string }
    expect(body.error.length).toBeGreaterThan(0)
  })

  it('returns 422 when timezone is unknown', async () => {
    const res = await app.fetch(
      reqJson('/api/schedule', {
        method: 'PUT',
        body: JSON.stringify({
          cron: '0 12 * * *',
          timezone: 'Mars/Olympus',
        }),
      }),
      env
    )
    expect(res.status).toBe(422)
  })

  it('returns 422 when the body shape is malformed', async () => {
    const res = await app.fetch(
      reqJson('/api/schedule', {
        method: 'PUT',
        body: JSON.stringify({ cron: '0 12 * * *' }),
      }),
      env
    )
    expect(res.status).toBe(422)
  })

  it('persists a valid value and returns the new nextRunAt', async () => {
    const res = await app.fetch(
      reqJson('/api/schedule', {
        method: 'PUT',
        body: JSON.stringify({
          cron: '*/15 * * * *',
          timezone: 'Etc/UTC',
        }),
      }),
      env
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      cron: string
      timezone: string
      nextRunAt: string
    }
    expect(body.cron).toBe('*/15 * * * *')
    expect(body.nextRunAt).toBe('2026-06-01T00:15:00.000Z')
    const after = await app.fetch(reqJson('/api/schedule'), env)
    const afterBody = (await after.json()) as { cron: string }
    expect(afterBody.cron).toBe('*/15 * * * *')
  })
})
