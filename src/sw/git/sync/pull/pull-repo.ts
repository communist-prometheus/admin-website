import { log } from '../../../logging/logger'
import { recordOp } from '../../../logging/metrics'
import type { SWGitConfig } from '../../../protocol'
import { fs, REPO_DIR } from '../../fs'
import { loadGit } from '../../load-git'

/**
 * Pull latest from remote (fetch + fast-forward merge).
 * Throws on non-ff (force push) — caller handles fallback.
 * @param config - Repository configuration with token
 */
export const pullRepo = async (config: SWGitConfig): Promise<void> => {
  const start = Date.now()
  log('info', 'git', 'Pulling remote updates')
  const git = await loadGit()
  const { default: http } = await import('isomorphic-git/http/web')

  await git.pull({
    fs,
    http,
    dir: REPO_DIR,
    ref: config.branch,
    singleBranch: true,
    corsProxy: config.corsProxy,
    fastForward: true,
    fastForwardOnly: true,
    author: { name: 'SW', email: 'sw@local' },
    onAuth: () => ({
      username: config.token,
      password: 'x-oauth-basic',
    }),
  })

  recordOp('pull', Date.now() - start)
  log('info', 'git', 'Pull complete')
}
