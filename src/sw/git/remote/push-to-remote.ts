import { log } from '../../logging/logger'
import type { SWGitConfig } from '../../protocol'
import { restPush } from './rest-push'

/**
 * Publish local commits to the remote branch.
 *
 * Writes through the GitHub REST Git Data API (see {@link restPush})
 * rather than a git smart-HTTP push. The `/api/cors` proxy's forward to
 * `github.com/.../git-receive-pack` stalls indefinitely (git-upload-pack
 * reads are unaffected), which reached editors as the recurring
 * "Push failed: Network unreachable" and blocked publishing entirely.
 * REST writes go straight to api.github.com (CORS-enabled) and keep
 * fast-forward safety: the new commit's parent is the current remote tip
 * and the ref is updated with `force: false`, so a genuine divergence is
 * rejected and routed to the existing merge/replay recovery.
 * @param config - SW git configuration with token
 */
export const pushToRemote = async (config: SWGitConfig): Promise<void> => {
  await restPush(config)
  log('info', 'git', 'pushed to remote')
}
