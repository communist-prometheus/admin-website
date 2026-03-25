import { log } from '../../../logging/logger'
import { recordOp } from '../../../logging/metrics'
import type { SWGitConfig } from '../../../protocol'
import { loadGit } from '../../load-git'
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
  const git = await loadGit()
  const { default: http } = await import('isomorphic-git/http/web')
  await git.clone(buildCloneOptions(config, http))
  recordOp('clone', Date.now() - start)
  log('info', 'git', 'Clone complete')
}
