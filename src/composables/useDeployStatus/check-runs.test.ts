import { describe, expect, it, vi } from 'vitest'

vi.mock('./gh-fetch', () => ({
  ghFetch: vi.fn(),
}))

const { ghFetch } = await import('./gh-fetch')
const { fetchCheckRun } = await import('./check-runs')

const mockGh = ghFetch as ReturnType<typeof vi.fn>

describe('fetchCheckRun', () => {
  it('returns first check run', async () => {
    mockGh.mockResolvedValueOnce({
      check_runs: [
        {
          name: 'Workers Builds',
          status: 'in_progress',
          conclusion: undefined,
        },
      ],
    })
    const r = await fetchCheckRun('abc123')
    expect(r?.status).toBe('in_progress')
  })

  it('returns undefined when no data', async () => {
    mockGh.mockResolvedValueOnce(undefined)
    expect(await fetchCheckRun('abc')).toBeUndefined()
  })
})
