import { Hono } from 'hono'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { corsProxy } from './cors-proxy'

const APP_ORIGIN = 'https://admin.comprom.org'
const GIT_PATH = '/api/cors/github.com/owner/repo/info/refs'

const app = new Hono().all('/api/cors/*', corsProxy)

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockResolvedValue(new Response('ok', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe('corsProxy origin gate', () => {
  it('rejects a foreign origin without proxying', async () => {
    const res = await app.request(GIT_PATH, {
      headers: { Origin: 'https://evil.example' },
    })
    expect(res.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('answers preflight for the app origin', async () => {
    const res = await app.request(GIT_PATH, {
      method: 'OPTIONS',
      headers: { Origin: APP_ORIGIN },
    })
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(APP_ORIGIN)
  })

  it('allows localhost dev origins', async () => {
    const res = await app.request(GIT_PATH, {
      headers: { Origin: 'http://localhost:5173' },
    })
    expect(res.status).toBe(200)
  })
})

describe('corsProxy target gate', () => {
  it('rejects non-github hosts without proxying', async () => {
    const res = await app.request('/api/cors/evil.example/x', {
      headers: { Origin: APP_ORIGIN },
    })
    expect(res.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects github paths outside git smart-HTTP', async () => {
    const res = await app.request(
      '/api/cors/github.com/owner/repo/contents/secrets',
      { headers: { Origin: APP_ORIGIN } }
    )
    expect(res.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('proxies git ref discovery with the query intact', async () => {
    await app.request(`${GIT_PATH}?service=git-upload-pack`, {
      headers: { Origin: APP_ORIGIN },
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://github.com/owner/repo/info/refs?service=git-upload-pack',
      expect.objectContaining({ method: 'GET' })
    )
  })
})

describe('corsProxy header hygiene', () => {
  it('forwards Authorization but strips Cookie', async () => {
    await app.request(GIT_PATH, {
      headers: {
        Origin: APP_ORIGIN,
        Authorization: 'Basic dXNlcjp0b2tlbg==',
        Cookie: 'comprom_session=secret',
      },
    })
    const call = fetchMock.mock.calls[0]
    if (!call) throw new Error('fetch was not called')
    const headers = call[1].headers
    expect(headers.get('authorization')).toBe('Basic dXNlcjp0b2tlbg==')
    expect(headers.get('cookie')).toBeNull()
  })

  it('reflects only the validated origin on the response', async () => {
    const res = await app.request(GIT_PATH, {
      headers: { Origin: APP_ORIGIN },
    })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(APP_ORIGIN)
  })
})
