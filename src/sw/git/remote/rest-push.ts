import { log } from '../../logging/logger'
import type { SWGitConfig } from '../../protocol'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'
import { changedFilesBetween } from './changed-files-between'
import { fail } from './rest/fail'
import { publishTree } from './rest/publish'
import { baseTreeSha, remoteTipSha } from './rest/push-reads'
import { buildTree } from './rest/push-tree'

/**
 * Publish the local HEAD commit to the remote branch WITHOUT git
 * smart-HTTP: blobs → tree → commit → update-ref through the GitHub REST
 * Git Data API (api.github.com, CORS-enabled). This bypasses the
 * `/api/cors` git-receive-pack proxy, whose forward to
 * `github.com/.../git-receive-pack` stalls (git-upload-pack reads are
 * unaffected) — the recurring "Push failed: Network unreachable".
 *
 * Fast-forward safety is preserved: the commit's parent is the current
 * remote tip and the ref is updated with `force: false`, so a concurrent
 * push is rejected (422 → non-fast-forward → merge/replay recovery). An
 * identical re-save is a no-op, never an empty commit.
 * @param config - SW git configuration with token + remote coordinates
 */
export const restPush = async (config: SWGitConfig): Promise<void> => {
  const git = await loadGit()
  const head = workerState.commitSha ?? fail('rest push: no local commit')
  const local = await git.readCommit({ fs, dir: REPO_DIR, oid: head })
  const remoteTip = await remoteTipSha(config)
  const baseTree = await baseTreeSha(git, remoteTip)
  const changes = await changedFilesBetween(remoteTip, head)
  await (changes.length === 0
    ? Promise.resolve(
        log('info', 'git', 'rest push: nothing to push (identical to remote)')
      )
    : buildTree(config, baseTree, changes).then(tree =>
        publishTree(config, {
          message: local.commit.message,
          author: local.commit.author,
          parent: remoteTip,
          tree,
        })
      ))
}
