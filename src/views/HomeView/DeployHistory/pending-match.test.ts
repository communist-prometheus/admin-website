import { describe, expect, it } from 'vitest'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import { isPendingReplaced } from './pending-match'

const build = (date: string, sha = 'abc'): CommitBuild => ({
  sha,
  message: 'test',
  author: 'user',
  date,
  check: undefined,
})

describe('isPendingReplaced', () => {
  it('returns true when no pending', () => {
    expect(isPendingReplaced(undefined, [])).toBe(true)
  })

  it('returns false when fetched is empty', () => {
    const p = build('2026-04-03T12:00:00Z', '')
    expect(isPendingReplaced(p, [])).toBe(false)
  })

  it('returns true when fetched has newer commit', () => {
    const p = build('2026-04-03T12:00:00Z', '')
    const f = [build('2026-04-03T12:01:00Z')]
    expect(isPendingReplaced(p, f)).toBe(true)
  })

  it('returns true when fetched has same-time commit', () => {
    const p = build('2026-04-03T12:00:00Z', '')
    const f = [build('2026-04-03T12:00:00Z')]
    expect(isPendingReplaced(p, f)).toBe(true)
  })

  it('returns false when all fetched are older', () => {
    const p = build('2026-04-03T12:00:00Z', '')
    const f = [build('2026-04-03T11:00:00Z')]
    expect(isPendingReplaced(p, f)).toBe(false)
  })

  it('handles different message names', () => {
    const p: CommitBuild = {
      sha: '',
      message: 'updated Test Article 1 in blog',
      author: 'you',
      date: '2026-04-03T12:00:00Z',
      check: undefined,
    }
    const f: CommitBuild[] = [
      {
        sha: 'abc',
        message: 'content: updated test 01 in blog',
        author: 'undeadliner',
        date: '2026-04-03T12:02:00Z',
        check: {
          name: 'build',
          status: 'in_progress',
          conclusion: undefined,
          started_at: undefined,
          completed_at: undefined,
          details_url: undefined,
          output: undefined,
        },
      },
    ]
    expect(isPendingReplaced(p, f)).toBe(true)
  })
})
