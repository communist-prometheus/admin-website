import git from 'isomorphic-git'
import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import { workerState } from '../state'
import { fs, REPO_DIR } from './fs'
import { pushToRemote } from './push-to-remote'

/**
 * Commit staged changes and push to remote.
 * @param message - Commit message
 * @returns The new commit SHA
 */
export const commitAndPush = async (message: string): Promise<string> => {
  const config = workerState.config
  if (!config) throw new Error('SW not initialized')

  const start = Date.now()
  const sha = await git.commit({
    fs,
    dir: REPO_DIR,
    message,
    author: { name: 'Admin', email: 'admin@prometheus.org' },
  })

  log('info', 'git', `committed ${sha.slice(0, 7)}`)
  if (!config.mock) await pushToRemote(config)

  workerState.commitSha = sha
  recordOp('commitAndPush', Date.now() - start)
  return sha
}
