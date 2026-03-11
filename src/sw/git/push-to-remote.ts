import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web'
import { log } from '../logging/logger'
import type { SWGitConfig } from '../protocol'
import { fs, REPO_DIR } from './fs'

/**
 * Push local commits to the remote GitHub repository.
 * @param config - SW git configuration with token
 */
export const pushToRemote = async (config: SWGitConfig): Promise<void> => {
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
