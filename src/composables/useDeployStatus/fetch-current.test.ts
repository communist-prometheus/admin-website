import { describe, expect, it, vi } from 'vitest'
import { fetchCurrentVersion } from './fetch-current'

describe('fetchCurrentVersion', () => {
  it('returns version number on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: 42 }),
    })
    expect(await fetchCurrentVersion()).toBe(42)
  })

  it('returns 0 on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })
    expect(await fetchCurrentVersion()).toBe(0)
  })

  it('returns 0 when version missing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    expect(await fetchCurrentVersion()).toBe(0)
  })
})
