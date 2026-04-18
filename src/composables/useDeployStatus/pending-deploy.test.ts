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

const realBuild = (message: string, sha: string): DeployBuild => ({
  run: {
    id: 1,
    name: 'Deploy',
    status: 'in_progress',
    conclusion: undefined,
    head_branch: 'master',
    head_sha: sha,
    created_at: '2026-04-16T00:00:00Z',
    updated_at: '2026-04-16T00:00:00Z',
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
    const real = [realBuild('same message', 'deadbeef')]
    expect(isPendingMatched(requirePending(), real)).toBe(true)
  })

  it('matches when real commit has content: prefix', () => {
    setPendingDeploy('updated Hero in pages')
    const real = [realBuild('content: updated Hero in pages', 'deadbeef')]
    expect(isPendingMatched(requirePending(), real)).toBe(true)
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
})
