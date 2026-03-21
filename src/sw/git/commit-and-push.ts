import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import { workerState } from '../state'
import { fs, REPO_DIR } from './fs'
import { loadGit } from './load-git'

/**
 * Commit staged changes and push to remote.
 * In mock mode, skips git commit and push (FS-only).
 * @param message - Commit message
 * @returns The new commit SHA (or 'mock' in mock mode)
 */
export const commitAndPush = async (message: string): Promise<string> => {
  const config = workerState.config
  if (!config) throw new Error('SW not initialized')

  if (__MOCK_MODE__ || config.mock) {
    log('info', 'git', `mock commit: ${message}`)
    recordOp('commitAndPush', 0)
    return 'mock'
  }

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
