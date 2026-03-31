import { describe, expect, it, vi } from 'vitest'

vi.mock('@/composables/useDeployStatus/commit-builds', () => ({
  fetchCommitBuilds: vi
    .fn()
    .mockResolvedValue([
      { sha: 'a', message: 'test', author: 'u', date: '2026' },
    ]),
}))

const { fetchDeploys } = await import('./fetch-deploys')

describe('fetchDeploys', () => {
  it('delegates to fetchCommitBuilds', async () => {
    const r = await fetchDeploys()
    expect(r).toHaveLength(1)
    expect(r[0]?.message).toBe('test')
  })
})
