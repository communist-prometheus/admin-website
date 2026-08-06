import type { SWGitConfig } from '../../../protocol'
import { fs, REPO_DIR } from '../../fs'
import type { loadGit } from '../../load-git'
import { ghSend } from './gh-send'
import { refShaOf } from './narrow'

type Git = Awaited<ReturnType<typeof loadGit>>

/**
 * Current commit sha of the remote branch head.
 * @param config - SW git configuration
 * @returns The remote tip sha
 */
export const remoteTipSha = async (config: SWGitConfig): Promise<string> =>
  refShaOf(
    await ghSend(
      'GET',
      `/repos/${config.owner}/${config.repo}/git/ref/heads/${config.branch}`,
      config.token
    )
  )

/**
 * Tree sha of the remote base, read from the LOCAL clone. A remote tip
 * absent locally means the branch advanced beyond our shallow clone —
 * surfaced as a non-fast-forward so the merge/replay recovery re-pulls.
 * @param git - Loaded isomorphic-git instance
 * @param remoteTip - Remote branch head sha
 * @returns The base tree sha
 */
export const baseTreeSha = async (
  git: Git,
  remoteTip: string
): Promise<string> => {
  const commit = await git
    .readCommit({ fs, dir: REPO_DIR, oid: remoteTip })
    .catch(() => {
      throw new Error(
        `not a fast-forward: remote advanced to ${remoteTip.slice(0, 7)}`
      )
    })
  return commit.commit.tree
}
