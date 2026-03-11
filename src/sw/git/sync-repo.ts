import { log } from '../logging/logger'
import type { SWGitConfig } from '../protocol'
import { workerState } from '../state'
import { checkRepoExists } from './check-repo-exists'
import { cloneRepo } from './clone-repo'
import { initMockRepo } from './init-mock-repo'

/**
 * Check if repo exists and initialize if needed.
 * Mock mode: always reinitializes from scratch.
 * Real mode: clone if absent, reuse if present.
 * @param config - SW git configuration
 */
export const checkRepoAndSync = async (
  config: SWGitConfig
): Promise<void> => {
  workerState.state = 'cloning'

  if (config.mock) {
    const sha = await initMockRepo()
    workerState.commitSha = sha
  } else {
    const exists = await checkRepoExists()
    if (exists) {
      log('info', 'git', 'Repo already cloned, reusing')
    } else {
      await cloneRepo(config)
    }
  }

  workerState.state = 'ready'
  workerState.lastSync = Date.now()
  log('info', 'lifecycle', 'SW state → ready')
}
