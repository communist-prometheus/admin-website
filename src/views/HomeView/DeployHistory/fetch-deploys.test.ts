import { describe, expect, it, vi } from 'vitest'
import { fetchDeploys } from './fetch-deploys'

describe('fetchDeploys', () => {
  it('returns deploys on success', async () => {
    const data = [
      {
        id: '1',
        createdOn: '2026-03-29',
        source: 'wrangler',
        versionId: 'v1',
      },
    ]
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    })
    const result = await fetchDeploys()
    expect(result).toEqual(data)
  })

  it('returns empty array on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })
    expect(await fetchDeploys()).toEqual([])
  })
})
