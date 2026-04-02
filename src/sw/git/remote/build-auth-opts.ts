import type { HttpClient } from 'isomorphic-git'
import type { SWGitConfig } from '../../protocol'
import { fs, REPO_DIR } from '../fs'

/**
 * Build auth options for isomorphic-git push/pull.
 * @param config - SW git configuration
 * @param http - HTTP client for isomorphic-git
 * @returns Auth options object
 */
export const buildAuthOpts = (config: SWGitConfig, http: HttpClient) => ({
  fs,
  http,
  dir: REPO_DIR,
  corsProxy: config.corsProxy,
  onAuth: () => ({
    username: config.token,
    password: 'x-oauth-basic',
  }),
})
