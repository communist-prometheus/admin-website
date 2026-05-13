import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import {
  clearPendingDeploy,
  isPendingMatched,
  pendingDeploy,
  pendingToDeployBuild,
  setPendingDeploy,
} from './pending-deploy'
import type { DeployBuild } from './workflow-types'

const realBuild = (
  message: string,
  sha: string,
  createdAt = '2026-04-16T00:00:00Z'
): DeployBuild => ({
  run: {
    id: 1,
    name: 'Deploy',
    status: 'in_progress',
    conclusion: undefined,
    head_branch: 'master',
    head_sha: sha,
    created_at: createdAt,
    updated_at: createdAt,
    head_commit: {
      message,
      author: { name: 'undeadliner', email: 'u@example.com' },
    },
  },
  jobs: [],
})

beforeEach(() => {
  sessionStorage.clear()
  clearPendingDeploy()
})
afterEach(() => {
  clearPendingDeploy()
})

describe('pendingDeploy', () => {
  it('setPendingDeploy + clearPendingDeploy round-trip', () => {
    setPendingDeploy('updated Hero in pages')
    expect(pendingDeploy.value?.message).toBe('updated Hero in pages')
    clearPendingDeploy()
    expect(pendingDeploy.value).toBeUndefined()
  })

  it('persists through sessionStorage', async () => {
    setPendingDeploy('msg-A')
    await nextTick()
    expect(sessionStorage.getItem('pending_deploy')).toContain('msg-A')
    clearPendingDeploy()
    await nextTick()
    expect(sessionStorage.getItem('pending_deploy')).toBeNull()
  })
})

const requirePending = (): NonNullable<typeof pendingDeploy.value> => {
  const v = pendingDeploy.value
  if (!v) throw new Error('pendingDeploy expected to be set')
  return v
}

describe('pendingToDeployBuild', () => {
  it('shapes a synthetic DeployBuild with queued status', () => {
    setPendingDeploy('my commit')
    const pending = requirePending()
    const built = pendingToDeployBuild(pending)
    expect(built.run.status).toBe('queued')
    expect(built.run.conclusion).toBeUndefined()
    expect(built.run.head_commit.message).toBe('my commit')
    expect(built.jobs).toEqual([])
  })
})

describe('isPendingMatched', () => {
  it('returns true when a real run has the same commit message', () => {
    setPendingDeploy('same message')
    const pending = requirePending()
    const real = [
      realBuild('same message', 'deadbeef', new Date().toISOString()),
    ]
    expect(isPendingMatched(pending, real)).toBe(true)
  })

  it('matches when real commit has content: prefix', () => {
    setPendingDeploy('updated Hero in pages')
    const pending = requirePending()
    const real = [
      realBuild(
        'content: updated Hero in pages',
        'deadbeef',
        new Date().toISOString()
      ),
    ]
    expect(isPendingMatched(pending, real)).toBe(true)
  })

  it('returns false when no real run matches', () => {
    setPendingDeploy('pending msg')
    const real = [realBuild('other msg', 'abc1234')]
    expect(isPendingMatched(requirePending(), real)).toBe(false)
  })

  it('ignores the pending placeholder itself in the list', () => {
    setPendingDeploy('pending msg')
    const built = pendingToDeployBuild(requirePending())
    expect(isPendingMatched(requirePending(), [built])).toBe(false)
  })

  /*
   * Regression: the newspaper edit view always emits the commit
   * message `updated <title> in newspaper`. Re-editing the same
   * issue (e.g. uploading a PDF for another language) produces the
   * SAME message every time. The old run that completed a few
   * minutes ago carried that exact message. Without a timestamp
   * floor the optimistic pending entry was matched by the OLD run
   * the instant the home list rendered — the new "queued" card
   * vanished and nothing appeared again until GitHub's API caught
   * up (10 manual refreshes for the user).
   */
  it('does NOT match a real run that already existed before the pending was created', () => {
    const before = '2026-04-16T10:00:00Z'
    const justNow = '2026-04-16T10:30:00Z'
    setPendingDeploy('updated Magazine N 1 in newspaper')
    const pending = requirePending()
    const overrideCreatedAt = { ...pending, createdAt: justNow }
    const oldRun = realBuild(
      'updated Magazine N 1 in newspaper',
      'deadbeef',
      before
    )
    expect(isPendingMatched(overrideCreatedAt, [oldRun])).toBe(false)
  })

  it('matches a real run that started AFTER the pending was created', () => {
    const justNow = '2026-04-16T10:30:00Z'
    const afterPending = '2026-04-16T10:30:08Z'
    setPendingDeploy('updated Magazine N 1 in newspaper')
    const pending = requirePending()
    const overrideCreatedAt = { ...pending, createdAt: justNow }
    const newRun = realBuild(
      'updated Magazine N 1 in newspaper',
      'cafef00d',
      afterPending
    )
    expect(isPendingMatched(overrideCreatedAt, [newRun])).toBe(true)
  })

  /*
   * GitHub stamps `workflow_runs[].created_at` server-side; the
   * pending's `createdAt` is client-side `new Date()`. Clock skew
   * of a few seconds is normal — a fresh run can be stamped
   * slightly before the pending. The match must absorb that.
   */
  it('matches a fresh run stamped within the clock-skew slack window', () => {
    const justNow = '2026-04-16T10:30:00Z'
    const slightlyEarlier = '2026-04-16T10:29:55Z'
    setPendingDeploy('updated Magazine N 1 in newspaper')
    const pending = requirePending()
    const overrideCreatedAt = { ...pending, createdAt: justNow }
    const skewedRun = realBuild(
      'updated Magazine N 1 in newspaper',
      'cafef00d',
      slightlyEarlier
    )
    expect(isPendingMatched(overrideCreatedAt, [skewedRun])).toBe(true)
  })
})
