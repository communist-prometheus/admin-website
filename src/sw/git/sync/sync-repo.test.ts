import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../state/state', () => ({
  workerState: { state: 'idle', config: undefined },
}))

const mockCheckRepoExists = vi.fn()
vi.mock('../repo/check-repo-exists', () => ({
  checkRepoExists: () => mockCheckRepoExists(),
}))

const mockTryPull = vi.fn()
vi.mock('./pull/try-pull', () => ({
  tryPull: (...a: readonly unknown[]) => mockTryPull(...a),
}))

const mockClone = vi.fn()
vi.mock('./clone/clone-repo', () => ({
  cloneRepo: (...a: readonly unknown[]) => mockClone(...a),
}))

const mockWipe = vi.fn()
vi.mock('./wipe-repo', () => ({
  wipeRepo: () => mockWipe(),
}))

const mockListPending = vi.fn()
vi.mock('../../push-queue', () => ({
  listPending: () => mockListPending(),
}))

vi.mock('./mark-ready', () => ({ markReady: vi.fn() }))
vi.mock('../repo/init-mock-repo', () => ({ initMockRepo: vi.fn() }))
vi.mock('../fs', () => ({
  fs: {
    promises: {
      readdir: vi.fn().mockResolvedValue([]),
      mkdir: vi.fn().mockResolvedValue(undefined),
    },
  },
  REPO_DIR: '/repo',
}))

const { checkRepoAndSync } = await import('./sync-repo')

const cfg = {
  owner: 'o',
  repo: 'r',
  branch: 'main',
  token: 't',
  contentPath: 'src/content',
  corsProxy: 'https://proxy',
  mock: false,
}

describe('checkRepoAndSync', () => {
  beforeEach(() => vi.clearAllMocks())

  it('pulls when repo exists', async () => {
    mockCheckRepoExists.mockResolvedValueOnce(true)
    mockTryPull.mockResolvedValueOnce(true)
    await checkRepoAndSync(cfg)
    expect(mockTryPull).toHaveBeenCalled()
    expect(mockClone).not.toHaveBeenCalled()
  })

  it('wipes and re-clones when pull fails and nothing is queued', async () => {
    mockCheckRepoExists.mockResolvedValueOnce(true)
    mockTryPull.mockResolvedValueOnce(false)
    mockListPending.mockResolvedValueOnce([])
    mockWipe.mockResolvedValueOnce(undefined)
    mockClone.mockResolvedValueOnce(undefined)
    await checkRepoAndSync(cfg)
    expect(mockWipe).toHaveBeenCalled()
    expect(mockClone).toHaveBeenCalled()
  })

  it('keeps a diverged clone that still holds unpushed commits', async () => {
    mockCheckRepoExists.mockResolvedValueOnce(true)
    mockTryPull.mockResolvedValueOnce(false)
    mockListPending.mockResolvedValueOnce([{ sha: 'unpushed' }])
    await checkRepoAndSync(cfg)
    // Wiping would orphan the queue and lose the edit; recovery happens at
    // push time via reset-onto-remote replay instead.
    expect(mockWipe).not.toHaveBeenCalled()
    expect(mockClone).not.toHaveBeenCalled()
  })

  it('clones fresh when repo does not exist', async () => {
    mockCheckRepoExists.mockResolvedValueOnce(false)
    mockWipe.mockResolvedValueOnce(undefined)
    mockClone.mockResolvedValueOnce(undefined)
    await checkRepoAndSync(cfg)
    expect(mockTryPull).not.toHaveBeenCalled()
    expect(mockClone).toHaveBeenCalled()
  })
})
