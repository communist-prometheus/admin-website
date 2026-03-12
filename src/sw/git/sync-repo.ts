import { log } from '../logging/logger'
import type { SWGitConfig } from '../protocol'
import { workerState } from '../state'
import { fs, REPO_DIR } from './fs'
import { initMockRepo } from './init-mock-repo'
import { markReady } from './mark-ready'

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
 * Resolve whether the repo already exists.
 * @param config - SW git configuration
 * @returns true if repo is present
 */
const repoExists = async (config: SWGitConfig): Promise<boolean> => {
  if (__MOCK_MODE__ || config.mock) return checkMockReady()
  const { checkRepoExists } = await import('./check-repo-exists')
  return checkRepoExists()
}

/**
 * Check if repo exists and initialize if needed.
 * @param config - SW git configuration
 */
export const checkRepoAndSync = async (
  config: SWGitConfig
): Promise<void> => {
  if (await repoExists(config)) {
    log('info', 'git', 'Repo already exists, reusing')
    markReady()
    return
  }

  workerState.state = 'cloning'

  if (__MOCK_MODE__ || config.mock) {
    await initMockRepo()
  } else {
    const { cloneRepo } = await import('./clone-repo')
    await cloneRepo(config)
  }

  markReady('SW state → ready')
}
