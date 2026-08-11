import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../handlers/route', () => ({
  routeRequest: vi.fn(async () => new Response('ok', { status: 200 })),
}))

import { routeRequest } from '../../handlers/route'
import { workerState } from '../../state/state'
import { handleFetchMessage } from './handle-fetch-message'

/**
 * Collects the reply payloads for one handleFetchMessage call.
 * @param headers - Request headers to send in the SW_FETCH message
 * @param method - HTTP method (writes are guarded, GET reads are open)
 * @param url - The proxied request URL
 * @returns The reply payloads pushed during the call
 */
const call = async (
  headers: Record<string, string>,
  method = 'POST',
  url = 'https://admin.test/api/github/commit'
): Promise<{ status?: number }[]> => {
  const replies: { status?: number }[] = []
  handleFetchMessage({ type: 'SW_FETCH', url, method, headers }, d =>
    replies.push(d as { status?: number })
  )
  await new Promise(r => setTimeout(r, 0))
  return replies
}

describe('SW_FETCH confused-deputy nonce guard', () => {
  beforeEach(() => {
    workerState.nonce = 'secret-nonce'
    vi.mocked(routeRequest).mockClear()
  })

  it('rejects a github WRITE with no nonce', async () => {
    const replies = await call({})
    expect(replies[0]?.status).toBe(403)
    expect(routeRequest).not.toHaveBeenCalled()
  })

  it('rejects a github WRITE with a wrong nonce', async () => {
    const replies = await call({ 'X-SW-Nonce': 'wrong' })
    expect(replies[0]?.status).toBe(403)
    expect(routeRequest).not.toHaveBeenCalled()
  })

  it('routes a github WRITE that echoes the matching nonce', async () => {
    await call({ 'X-SW-Nonce': 'secret-nonce' })
    expect(routeRequest).toHaveBeenCalledTimes(1)
  })

  it('rejects a WRITE with a matching nonce when the SW has none yet', async () => {
    workerState.nonce = undefined
    const replies = await call({ 'X-SW-Nonce': 'anything' })
    expect(replies[0]?.status).toBe(403)
    expect(routeRequest).not.toHaveBeenCalled()
  })

  it('leaves a github READ (GET) open without a nonce', async () => {
    await call({}, 'GET', 'https://admin.test/api/github/file?path=x')
    expect(routeRequest).toHaveBeenCalledTimes(1)
  })
})
