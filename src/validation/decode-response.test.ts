import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { decodeResponse } from './decode-response'

const Commit = Schema.Struct({
  content: Schema.Struct({ sha: Schema.String }),
  commit: Schema.Struct({ sha: Schema.String }),
})

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('decodeResponse', () => {
  it('decodes a well-formed success payload', async () => {
    const res = jsonResponse({
      content: { sha: 'abc' },
      commit: { sha: 'def' },
    })
    const decoded = await decodeResponse(Commit)(res)
    expect(decoded).toEqual({
      content: { sha: 'abc' },
      commit: { sha: 'def' },
    })
  })

  it('throws with server error message on 5xx response', async () => {
    const res = jsonResponse(
      { error: 'git push rejected (non-fast-forward)' },
      500
    )
    await expect(decodeResponse(Commit)(res)).rejects.toThrow(
      'git push rejected (non-fast-forward)'
    )
  })

  it('throws with server error message on 4xx response', async () => {
    const res = jsonResponse({ error: 'Missing required fields' }, 400)
    await expect(decodeResponse(Commit)(res)).rejects.toThrow(
      'Missing required fields'
    )
  })

  it('falls back to status-based message when error field is missing', async () => {
    const res = jsonResponse({}, 503)
    await expect(decodeResponse(Commit)(res)).rejects.toThrow(
      'Request failed with status 503'
    )
  })

  it('does not leak schema decode error when response is 4xx', async () => {
    // Previously this returned a cryptic "content is missing" from Effect
    // Schema because decodeResponse ignored response.ok.
    const res = jsonResponse({ error: 'boom' }, 500)
    await expect(decodeResponse(Commit)(res)).rejects.toThrow('boom')
  })
})
