import { describe, expect, it } from 'vitest'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import { isPendingReplaced } from './pending-match'

const build = (date: string): CommitBuild => ({
  sha: 'abc',
  message: 'test',
  author: 'u',
  date,
  check: undefined,
})

const pending = (): CommitBuild => ({
  sha: '',
  message: 'updated X',
  author: 'you',
  date: new Date().toISOString(),
  check: undefined,
})

describe('isPendingReplaced', () => {
  it('returns true when no pending', () => {
    expect(isPendingReplaced(undefined, [], 0)).toBe(true)
  })

  it('returns false when count unchanged', () => {
    const f = [build('2026-04-03')]
    expect(isPendingReplaced(pending(), f, 1)).toBe(false)
  })

  it('returns true when new commit appeared', () => {
    const f = [build('2026-04-03'), build('2026-04-02')]
    expect(isPendingReplaced(pending(), f, 1)).toBe(true)
  })

  it('returns true after timeout', () => {
    const old: CommitBuild = {
      ...pending(),
      date: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    }
    expect(isPendingReplaced(old, [], 0)).toBe(true)
  })

  it('returns false before timeout', () => {
    const recent: CommitBuild = {
      ...pending(),
      date: new Date(Date.now() - 1000).toISOString(),
    }
    expect(isPendingReplaced(recent, [], 0)).toBe(false)
  })
})
