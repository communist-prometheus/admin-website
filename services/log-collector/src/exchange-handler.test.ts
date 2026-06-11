import { Hono } from 'hono'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ExchangeBindings,
  registerExchangeRoute,
} from './exchange-handler'

const ENV: ExchangeBindings = {
  JWT_SECRET: 'test-secret-test-secret-test-secret!',
  GH_CLIENT_ID: 'id',
  GH_CLIENT_SECRET: 'secret',
  GITHUB_ORG: 'communist-prometheus',
}

const app = registerExchangeRoute(new Hono<{ Bindings: ExchangeBindings }>())

const fetchMock = vi.fn()

const jsonResponse = (body: object): Response =>
  new Response(JSON.stringify(body), { status: 200 })

const githubHappyPath = (membershipState: string | undefined): void => {
  fetchMock.mockImplementation((url: string) => {
    if (url.includes('login/oauth'))
      return Promise.resolve(jsonResponse({ access_token: 'gho_x' }))
    if (url.endsWith('/user'))
      return Promise.resolve(jsonResponse({ login: 'mallory' }))
    if (url.includes('/memberships/'))
      return membershipState === undefined
        ? Promise.resolve(new Response('not found', { status: 404 }))
        : Promise.resolve(
            jsonResponse({ state: membershipState, role: 'member' })
          )
    return Promise.reject(new Error(`unexpected url ${url}`))
  })
}

const exchange = (): Promise<Response> =>
  app.request(
    '/auth/exchange',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'abc' }),
    },
    ENV
  )

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe('/auth/exchange org gate', () => {
  it('rejects a non-member with 403 and mints no JWT', async () => {
    githubHappyPath(undefined)
    const res = await exchange()
    expect(res.status).toBe(403)
    const body: Record<string, unknown> = await res.json()
    expect(body.token).toBeUndefined()
  })

  it('rejects a pending (not yet active) member', async () => {
    githubHappyPath('pending')
    const res = await exchange()
    expect(res.status).toBe(403)
  })

  it('mints a JWT for an active member', async () => {
    githubHappyPath('active')
    const res = await exchange()
    expect(res.status).toBe(200)
    const body: Record<string, unknown> = await res.json()
    expect(typeof body.token).toBe('string')
    expect(body.login).toBe('mallory')
  })

  it('maps a failed GitHub exchange to 400, not 500', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'bad_code' }))
    const res = await exchange()
    expect(res.status).toBe(400)
    const body: Record<string, unknown> = await res.json()
    expect(body.error).toBe('oauth_failed')
  })
})
