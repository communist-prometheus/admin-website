import { log } from '../../logging/logger'
import type { SWGitConfig } from '../../protocol'
import { loadGit } from '../load-git'
import { buildAuthOpts } from './build-auth-opts'

/**
 * Pull latest then push local commits to remote.
 * Throws on push rejection.
 * @param config - SW git configuration with token
 */
export const pushToRemote = async (config: SWGitConfig): Promise<void> => {
  const git = await loadGit()
  const { default: http } = await import('isomorphic-git/http/web')
  const opts = buildAuthOpts(config, http)
  /*
   * Best-effort pre-pull keeps the push fast-forward. A failure
   * here is NOT fatal — the explicit NFF recovery in
   * handle-failure → tryMergeAfterNff handles real merges. But the
   * actual error MUST surface; the old blanket `.catch(() => …)`
   * swallowed everything, leaving "save said OK but nothing
   * reached the remote" as the only observable symptom.
   */
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
    .catch((err: unknown) =>
      log(
        'warn',
        'git',
        `pull before push failed: ${err instanceof Error ? err.message : String(err)}`
      )
    )
  const result = await git.push(opts)
  if (result.error) throw new Error(`Push rejected: ${result.error}`)
  log('info', 'git', 'pushed to remote')
}
