import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { type HealthBody, registerHealthRoute } from './health'

const buildApp = () =>
  registerHealthRoute(new Hono<{ Bindings: { VERSION: string } }>())

describe('GET /health (comms-worker)', () => {
  it('returns status ok and the configured version', async () => {
    const app = buildApp()
    const res = await app.fetch(new Request('http://localhost/health'), {
      VERSION: '0.1.0',
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as HealthBody
    expect(body.status).toBe('ok')
    expect(body.version).toBe('0.1.0')
    expect(body.at).toBeGreaterThan(0)
  })

  it('returns 404 for unknown routes', async () => {
    const app = buildApp()
    const res = await app.fetch(new Request('http://localhost/missing'), {
      VERSION: '0',
    })
    expect(res.status).toBe(404)
  })
})
