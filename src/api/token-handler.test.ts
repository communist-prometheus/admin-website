import { Hono } from 'hono'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Env } from './app'
import { tokenHandler } from './token-handler'

const CLIENT_ID = 'Ov23test'

const app = new Hono<{ Bindings: Env }>().post(
  '/api/oauth/token',
  tokenHandler
)

const fetchMock = vi.fn()

const post = (
  fields: Record<string, string>,
  env: Partial<Env> = {}
): Promise<Response> =>
  Promise.resolve(
    app.request(
      '/api/oauth/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fields).toString(),
      },
      { GITHUB_CLIENT_SECRET: 's3cret', GITHUB_CLIENT_ID: CLIENT_ID, ...env }
    )
  )

beforeEach(() => {
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        access_token: 'gho_abc',
        token_type: 'bearer',
        scope: 'repo',
        internal_field: 'leak-me',
      }),
      { status: 200 }
    )
  )
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe('tokenHandler client pinning', () => {
  it('rejects a foreign client_id without contacting GitHub', async () => {
    const res = await post({ client_id: 'other-app', code: 'c' })
    expect(res.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a missing code', async () => {
    const res = await post({ client_id: CLIENT_ID })
    expect(res.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('exchanges a valid request and injects the secret', async () => {
    const res = await post({
      client_id: CLIENT_ID,
      code: 'c',
      code_verifier: 'v',
    })
    expect(res.status).toBe(200)
    const sent = String(fetchMock.mock.calls[0]?.[1]?.body)
    expect(sent).toContain('client_secret=s3cret')
    expect(sent).toContain('code_verifier=v')
  })

  it('drops unknown inbound params instead of relaying them', async () => {
    await post({ client_id: CLIENT_ID, code: 'c', evil: 'param' })
    const sent = String(fetchMock.mock.calls[0]?.[1]?.body)
    expect(sent).not.toContain('evil')
  })
})

describe('tokenHandler response filtering', () => {
  it('returns only documented fields', async () => {
    const res = await post({ client_id: CLIENT_ID, code: 'c' })
    const body: Record<string, unknown> = await res.json()
    expect(body.access_token).toBe('gho_abc')
    expect(body.internal_field).toBeUndefined()
  })

  it('survives a non-JSON GitHub response', async () => {
    fetchMock.mockResolvedValue(new Response('plain', { status: 502 }))
    const res = await post({ client_id: CLIENT_ID, code: 'c' })
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({})
  })
})
