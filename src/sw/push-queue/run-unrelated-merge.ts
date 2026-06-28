import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'
import { buildAuthOpts } from '../git/remote/build-auth-opts'
import type { workerState } from '../state/state'

type SWGitConfig = NonNullable<typeof workerState.config>

const authorOf = (config: SWGitConfig) => ({
  name: config.authorName ?? 'Admin',
  email: config.authorEmail ?? 'admin@prometheus.org',
})

/**
 * Fetch the force-pushed remote ref and merge it into the local
 * branch with `allowUnrelatedHistories`, then materialise the
 * result into the working tree. `git.pull` cannot do this — it
 * never forwards the unrelated-histories flag to `merge`.
 * @param config Validated SW git configuration.
 * @returns Resolves once the branch points at the merge commit.
 */
export const runUnrelatedMerge = async (
  config: SWGitConfig
): Promise<void> => {
  const git = await loadGit()
  const { default: http } = await import('isomorphic-git/http/web')
  const opts = buildAuthOpts(config, http)
  await git.fetch({ ...opts, ref: config.branch, singleBranch: true })
  await git.merge({
    fs,
    dir: REPO_DIR,
    ours: config.branch,
    theirs: `refs/remotes/origin/${config.branch}`,
    allowUnrelatedHistories: true,
    author: authorOf(config),
  })
  await git.checkout({ fs, dir: REPO_DIR, ref: config.branch })
}
