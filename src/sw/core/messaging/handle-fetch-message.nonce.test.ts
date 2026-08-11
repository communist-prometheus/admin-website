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
 * @param url - The proxied request URL
 * @returns The reply payloads pushed during the call
 */
const call = async (
  headers: Record<string, string>,
  url = 'https://admin.test/api/github/tree'
): Promise<{ status?: number }[]> => {
  const replies: { status?: number }[] = []
  handleFetchMessage({ type: 'SW_FETCH', url, method: 'GET', headers }, d =>
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

  it('rejects a /api/github request with no nonce', async () => {
    const replies = await call({})
    expect(replies[0]?.status).toBe(403)
    expect(routeRequest).not.toHaveBeenCalled()
  })

  it('rejects a /api/github request with a wrong nonce', async () => {
    const replies = await call({ 'X-SW-Nonce': 'wrong' })
    expect(replies[0]?.status).toBe(403)
    expect(routeRequest).not.toHaveBeenCalled()
  })

  it('routes a /api/github request that echoes the matching nonce', async () => {
    await call({ 'X-SW-Nonce': 'secret-nonce' })
    expect(routeRequest).toHaveBeenCalledTimes(1)
  })

  it('rejects even a matching nonce when the SW has none yet (pre-init)', async () => {
    workerState.nonce = undefined
    const replies = await call({ 'X-SW-Nonce': 'anything' })
    expect(replies[0]?.status).toBe(403)
    expect(routeRequest).not.toHaveBeenCalled()
  })
})
