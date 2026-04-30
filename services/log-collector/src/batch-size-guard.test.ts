import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { batchSizeGuard, MAX_BATCH_SIZE_BYTES } from './batch-size-guard'

const buildApp = () => {
  const app = new Hono()
  app.use('*', batchSizeGuard())
  app.post('/v1/x', c => c.json({ ok: true }))
  return app
}

describe('batchSizeGuard', () => {
  it('passes payloads at or below the limit', async () => {
    const res = await buildApp().fetch(
      new Request('http://localhost/v1/x', {
        method: 'POST',
        headers: {
          'Content-Length': String(MAX_BATCH_SIZE_BYTES),
          'Content-Type': 'application/json',
        },
        body: 'x'.repeat(10),
      })
    )
    expect(res.status).toBe(200)
  })

  it('returns 413 with a chunk-size hint above the limit', async () => {
    const res = await buildApp().fetch(
      new Request('http://localhost/v1/x', {
        method: 'POST',
        headers: {
          'Content-Length': String(MAX_BATCH_SIZE_BYTES + 1),
          'Content-Type': 'application/json',
        },
        body: '',
      })
    )
    expect(res.status).toBe(413)
    const body = (await res.json()) as { chunkSize: number }
    expect(body.chunkSize).toBe(MAX_BATCH_SIZE_BYTES / 2)
  })
})
