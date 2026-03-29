import { describe, expect, it, vi } from 'vitest'
import { fetchCfDeployments } from './fetch-cf'

describe('fetchCfDeployments', () => {
  it('maps raw CF data to CfDeploy', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: {
            deployments: [
              {
                id: 'dep-1',
                created_on: '2026-03-29T12:00:00Z',
                source: 'wrangler',
                versions: [{ version_id: 'v-1' }],
              },
            ],
          },
        }),
    })
    const r = await fetchCfDeployments('tok', 'acc', 'script')
    expect(r).toEqual([
      {
        id: 'dep-1',
        createdOn: '2026-03-29T12:00:00Z',
        source: 'wrangler',
        versionId: 'v-1',
      },
    ])
  })

  it('returns empty on failed fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })
    const r = await fetchCfDeployments('tok', 'acc', 'script')
    expect(r).toEqual([])
  })
})
