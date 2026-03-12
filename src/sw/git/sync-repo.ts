import { log } from '../logging/logger'
import type { SWGitConfig } from '../protocol'
import { workerState } from '../state'
import { checkRepoExists } from './check-repo-exists'
import { cloneRepo } from './clone-repo'
import { initMockRepo } from './init-mock-repo'

/**
 * Check if repo exists and initialize if needed.
 * Skips re-init if repo already exists (both modes).
 * @param config - SW git configuration
 */
export const checkRepoAndSync = async (
  config: SWGitConfig
): Promise<void> => {
  const exists = await checkRepoExists()
  if (exists) {
    log('info', 'git', 'Repo already exists, reusing')
    workerState.state = 'ready'
    workerState.lastSync = Date.now()
    return
  }

  workerState.state = 'cloning'

  if (config.mock) {
    const sha = await initMockRepo()
    workerState.commitSha = sha
  } else {
    await cloneRepo(config)
  }

  workerState.state = 'ready'
  workerState.lastSync = Date.now()
  log('info', 'lifecycle', 'SW state → ready')
}
