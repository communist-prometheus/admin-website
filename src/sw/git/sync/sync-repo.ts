import type { SWGitConfig } from '../../protocol'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { initMockRepo } from '../repo/init-mock-repo'
import { markReady } from './mark-ready'
import { tryPull } from './pull/try-pull'
import { wipeRepo } from './wipe-repo'

/**
 * Check if mock repo files exist via FS readdir.
 * @returns true if REPO_DIR has entries
 */
const checkMockReady = async (): Promise<boolean> => {
  try {
    const entries = await fs.promises.readdir(REPO_DIR)
    return entries.length > 0
  } catch {
    return false
  }
}

/**
 * Resolve whether the repo already exists as a git repo.
 * @param config - SW git configuration
 * @returns true if repo is present
 */
const repoExists = async (config: SWGitConfig): Promise<boolean> => {
  if (__MOCK_MODE__ || config.mock) return checkMockReady()
  const { checkRepoExists } = await import('../repo/check-repo-exists')
  return checkRepoExists()
}

/**
 * Wipe IndexedDB and clone fresh from remote.
 * @param config - SW git configuration
 */
const freshClone = async (config: SWGitConfig): Promise<void> => {
  workerState.state = 'cloning'
  await wipeRepo()
  await fs.promises.mkdir(REPO_DIR).catch(() => {})
  const { cloneRepo } = await import('./clone/clone-repo')
  await cloneRepo(config)
  markReady('SW state → ready (fresh clone)')
}

/**
 * Sync repo: pull if exists, clone if not.
 * Falls back to wipe+clone on pull failure (force push).
 * @param config - SW git configuration
 */
export const checkRepoAndSync = async (
  config: SWGitConfig
): Promise<void> => {
  if (await repoExists(config)) {
    if (!__MOCK_MODE__ && !config.mock) {
      const pulled = await tryPull(config)
      if (!pulled) {
        await freshClone(config)
        return
      }
    }
    markReady()
    return
  }

  if (__MOCK_MODE__ || config.mock) {
    workerState.state = 'cloning'
    await wipeRepo()
    await fs.promises.mkdir(REPO_DIR).catch(() => {})
    await initMockRepo()
    markReady('SW state → ready')
  } else {
    await freshClone(config)
  }
}
