import { log } from '../../logging/logger'
import { recordOp } from '../../logging/metrics'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'

type Config = NonNullable<typeof workerState.config>

/**
 * Run git commit + push and record metrics.
 * @param config - SW git configuration
 * @param message - Commit message
 * @returns Commit SHA string
 */
export const execCommit = async (
  config: Config,
  message: string
): Promise<string> => {
  const start = Date.now()
  const git = await loadGit()
  const sha = await git.commit({
    fs,
    dir: REPO_DIR,
    message,
    author: {
      name: config.authorName ?? 'Admin',
      email: config.authorEmail ?? 'admin@prometheus.org',
    },
  })
  log('info', 'git', `committed ${sha.slice(0, 7)}`)
  const { pushToRemote } = await import('./push-to-remote')
  await pushToRemote(config)
  workerState.commitSha = sha
  recordOp('commitAndPush', Date.now() - start)
  return sha
}
