import type { HttpClient } from 'isomorphic-git'

import { log } from '../../../logging/logger'
import type { SWGitConfig } from '../../../protocol'
import { fs, REPO_DIR } from '../../fs'

/**
 * Build isomorphic-git clone options from config.
 * @param config - Repository configuration
 * @param http - HTTP client for isomorphic-git
 * @returns clone options object
 */
export const buildCloneOptions = (config: SWGitConfig, http: HttpClient) => ({
  fs,
  http,
  dir: REPO_DIR,
  url: `https://github.com/${config.owner}/${config.repo}`,
  corsProxy: config.corsProxy,
  ref: config.branch,
  singleBranch: true,
  depth: 1,
  onAuth: () => ({
    username: config.token,
    password: 'x-oauth-basic',
  }),
  onProgress: (e: { phase: string; loaded: number; total: number }) => {
    log('debug', 'git', e.phase, {
      loaded: e.loaded,
      total: e.total,
    })
  },
})
