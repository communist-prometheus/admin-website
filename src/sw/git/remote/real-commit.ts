import { Effect } from 'effect'
import { log } from '../../logging/logger'
import { recordOp } from '../../logging/metrics'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'

type SWGitConfig = NonNullable<typeof workerState.config>

/**
 * Execute real git commit + push to remote.
 * @param config - Validated SW git configuration
 * @param message - Commit message
 * @returns Effect yielding the commit SHA
 */
export const realCommit = (config: SWGitConfig, message: string) =>
  Effect.tryPromise(async () => {
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
  })
