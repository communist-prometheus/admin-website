import { describe, expect, it, vi } from 'vitest'

vi.mock('./gh-fetch', () => ({
  ghFetch: vi.fn(),
}))

vi.mock('./check-runs', () => ({
  fetchCheckRun: vi.fn(),
}))

const { ghFetch } = await import('./gh-fetch')
const { fetchCheckRun } = await import('./check-runs')
const { fetchCommitBuilds } = await import('./commit-builds')

const mockGh = ghFetch as ReturnType<typeof vi.fn>
const mockCheck = fetchCheckRun as ReturnType<typeof vi.fn>

describe('fetchCommitBuilds', () => {
  it('merges commits with check runs', async () => {
    mockGh.mockResolvedValueOnce([
      {
        sha: 'aaa',
        commit: {
          message: 'feat: test',
          author: { name: 'user', date: '2026-03-29' },
        },
      },
    ])
    mockCheck.mockResolvedValueOnce({
      status: 'completed',
      conclusion: 'success',
    })
    const r = await fetchCommitBuilds(1)
    expect(r).toHaveLength(1)
    expect(r[0]?.message).toBe('feat: test')
    expect(r[0]?.check?.status).toBe('completed')
  })

  it('returns empty on failure', async () => {
    mockGh.mockResolvedValueOnce(undefined)
    expect(await fetchCommitBuilds()).toEqual([])
  })
})
