import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithReinit } from './fetch-with-reinit'
import { reinitSWFromStorage } from './reinit-from-storage'

vi.mock('./reinit-from-storage', () => ({
  reinitSWFromStorage: vi.fn(),
}))

const reinitMock = vi.mocked(reinitSWFromStorage)

const res = (status: number): Response => new Response('{}', { status })

describe('fetchWithReinit', () => {
  beforeEach(() => {
    reinitMock.mockReset()
  })

  it('returns a successful response without re-init', async () => {
    const fetcher = vi.fn().mockResolvedValue(res(200))
    const out = await fetchWithReinit(fetcher, '/api/github/x')
    expect(out.status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(reinitMock).not.toHaveBeenCalled()
  })

  it('re-inits and retries once on a 503, returning the retry result', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(res(503))
      .mockResolvedValueOnce(res(200))
    reinitMock.mockResolvedValue(true)
    const out = await fetchWithReinit(fetcher, '/api/github/x')
    expect(out.status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(reinitMock).toHaveBeenCalledTimes(1)
  })

  it('returns the original 503 when no stored token is available', async () => {
    const fetcher = vi.fn().mockResolvedValue(res(503))
    reinitMock.mockResolvedValue(false)
    const out = await fetchWithReinit(fetcher, '/api/github/x')
    expect(out.status).toBe(503)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('does not retry more than once even if the retry also 503s', async () => {
    const fetcher = vi.fn().mockResolvedValue(res(503))
    reinitMock.mockResolvedValue(true)
    const out = await fetchWithReinit(fetcher, '/api/github/x')
    expect(out.status).toBe(503)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
