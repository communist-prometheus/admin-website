import { log } from '../../logging/logger'
import type { SWGitConfig } from '../../protocol'
import { loadGit } from '../load-git'
import { buildAuthOpts } from './build-auth-opts'
import { pushRejection } from './push-rejection'

type Git = Awaited<ReturnType<typeof loadGit>>
type AuthOpts = ReturnType<typeof buildAuthOpts>

/*
 * Best-effort pre-pull keeps the push fast-forward. A failure here is NOT
 * fatal — the real NFF recovery (handle-failure → tryMergeAfterNff) handles
 * merges and the reset-onto-remote replay — but the error MUST be logged,
 * not swallowed, or "save said OK but nothing reached the remote" is the
 * only observable symptom.
 */
const prePull = (
  git: Git,
  opts: AuthOpts,
  config: SWGitConfig
): Promise<void> =>
  git
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

/**
 * Pull latest then push local commits to remote. Throws on push rejection —
 * including a per-ref `ng` that leaves `result.error` empty (see
 * {@link pushRejection}), which used to be read as success.
 * @param config - SW git configuration with token
 */
export const pushToRemote = async (config: SWGitConfig): Promise<void> => {
  const git = await loadGit()
  const { default: http } = await import('isomorphic-git/http/web')
  const opts = buildAuthOpts(config, http)
  await prePull(git, opts, config)
  const rejection = pushRejection(await git.push(opts))
  if (rejection) throw new Error(`Push rejected: ${rejection}`)
  log('info', 'git', 'pushed to remote')
}
