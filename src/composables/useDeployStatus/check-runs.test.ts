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
          started_at: '2026-04-04T12:00:00Z',
          completed_at: undefined,
          details_url: 'https://cf.com/build/123',
          output: undefined,
        },
      ],
    })
    const r = await fetchCheckRun('abc123')
    expect(r?.status).toBe('in_progress')
    expect(r?.conclusion).toBeUndefined()
    expect(r?.details_url).toBe('https://cf.com/build/123')
  })

  it('returns completed with conclusion', async () => {
    mockGh.mockResolvedValueOnce({
      check_runs: [
        {
          name: 'Workers Builds',
          status: 'completed',
          conclusion: 'failure',
          started_at: '2026-04-04T12:00:00Z',
          completed_at: '2026-04-04T12:02:00Z',
          details_url: undefined,
          output: {
            title: 'Build failed',
            summary: 'Error in astro build',
          },
        },
      ],
    })
    const r = await fetchCheckRun('def456')
    expect(r?.status).toBe('completed')
    expect(r?.conclusion).toBe('failure')
    expect(r?.output?.summary).toContain('Error')
  })

  it('returns undefined when no check runs', async () => {
    mockGh.mockResolvedValueOnce({ check_runs: [] })
    expect(await fetchCheckRun('none')).toBeUndefined()
  })

  it('returns undefined on API failure', async () => {
    mockGh.mockResolvedValueOnce(undefined)
    expect(await fetchCheckRun('fail')).toBeUndefined()
  })

  it('returns queued status', async () => {
    mockGh.mockResolvedValueOnce({
      check_runs: [
        {
          name: 'Workers Builds',
          status: 'queued',
          conclusion: undefined,
          started_at: undefined,
          completed_at: undefined,
          details_url: undefined,
          output: undefined,
        },
      ],
    })
    const r = await fetchCheckRun('queued')
    expect(r?.status).toBe('queued')
  })
})
