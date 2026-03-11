import git from 'isomorphic-git'
import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import type { SWGitConfig } from '../protocol'
import { buildCloneOptions } from './clone-options'

/**
 * Clone the GitHub repository using isomorphic-git.
 * Uses shallow clone (depth 1) through CORS proxy.
 * @param config - Repository configuration with token
 */
export const cloneRepo = async (config: SWGitConfig): Promise<void> => {
  const start = Date.now()
  log('info', 'git', 'Cloning repository', {
    owner: config.owner,
    repo: config.repo,
  })
  await git.clone(buildCloneOptions(config))
  recordOp('clone', Date.now() - start)
  log('info', 'git', 'Clone complete')
}
