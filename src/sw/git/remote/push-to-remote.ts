import { log } from '../../logging/logger'
import type { SWGitConfig } from '../../protocol'
import { loadTracedHttp } from '../../tracing/load-traced-http'
import { loadGit } from '../load-git'
import { buildAuthOpts } from './build-auth-opts'

/**
 * Pull latest then push local commits to remote.
 * Throws on push rejection.
 * @param config - SW git configuration with token
 */
export const pushToRemote = async (config: SWGitConfig): Promise<void> => {
  const git = await loadGit()
  const http = await loadTracedHttp()
  const opts = buildAuthOpts(config, http)
  await git
    .pull({
      ...opts,
      ref: config.branch,
      singleBranch: true,
      author: {
        name: config.authorName ?? 'Admin',
        email: config.authorEmail ?? 'admin@prometheus.org',
      },
    })
    .catch(() => log('warn', 'git', 'pull before push failed'))
  const result = await git.push(opts)
  if (result.error) throw new Error(`Push rejected: ${result.error}`)
  log('info', 'git', 'pushed to remote')
}
