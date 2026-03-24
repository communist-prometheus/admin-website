import { log } from '../../logging/logger'
import type { SWGitConfig } from '../../protocol'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'

/**
 * Push local commits to the remote GitHub repository.
 * @param config - SW git configuration with token
 */
export const pushToRemote = async (config: SWGitConfig): Promise<void> => {
  const git = await loadGit()
  const { default: http } = await import('isomorphic-git/http/web')
  await git.push({
    fs,
    http,
    dir: REPO_DIR,
    corsProxy: config.corsProxy,
    onAuth: () => ({
      username: config.token,
      password: 'x-oauth-basic',
    }),
  })
  log('info', 'git', 'pushed to remote')
}
