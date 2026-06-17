import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { type CorsEnv, cors } from './cors'

const ORIGIN = 'https://admin.comprom.org'
const env: CorsEnv = { ALLOWED_ORIGIN: ORIGIN }

const build = () => {
  const app = new Hono<{ Bindings: CorsEnv }>()
  app.use('*', cors())
  app.get('/x', c => c.json({ ok: true }))
  app.patch('/x', c => c.json({ ok: true }))
  return app
}

const req = (method: string, origin: string) =>
  new Request('http://x/x', { method, headers: { origin } })

describe('cors middleware', () => {
  it('allows PATCH in the preflight for the allowed origin', async () => {
    const res = await build().fetch(req('OPTIONS', ORIGIN), env)
    expect(res.status).toBe(204)
    const methods = res.headers.get('Access-Control-Allow-Methods') ?? ''
    // The admin edits subscriber langs via PATCH; it must be allowed.
    expect(methods.split(', ')).toEqual(
      expect.arrayContaining(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    )
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
  })

  it('mirrors origin + methods on a normal cross-origin response', async () => {
    const res = await build().fetch(req('GET', ORIGIN), env)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('PATCH')
  })

  it('omits CORS headers for a disallowed origin', async () => {
    const res = await build().fetch(req('OPTIONS', 'https://evil.test'), env)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    expect(res.headers.get('Access-Control-Allow-Methods')).toBeNull()
  })
})
