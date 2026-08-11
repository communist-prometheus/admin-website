import { saveConfig } from '../../git/repo/persist-config'
import { checkRepoAndSync } from '../../git/sync/sync-repo'
import { withTokenIdentity } from '../../git/token-identity'
import { log } from '../../logging/logger'
import type { SWGitConfig } from '../../protocol'
import { workerState } from '../../state/state'

/**
 * Cached init promise — prevents concurrent repo initialization.
 */
let pending: Promise<void> | undefined

const startInit = (
  config: SWGitConfig,
  reply: (data: unknown) => void
): void => {
  // Author is derived from the token itself so it can never diverge from
  // the account that pushes (see identity.ts) — even if the client passed
  // a stale authorName/authorEmail.
  workerState.config = config
  log('info', 'auth', 'Config received', { owner: config.owner })

  if (!pending) {
    pending = checkRepoAndSync(config)
      .then(() => saveConfig(config))
      .finally(() => {
        pending = undefined
      })
  }

  pending
    .then(() => reply({ ok: true, state: 'ready' }))
    .catch(err => {
      const msg = err instanceof Error ? err.message : String(err)
      log('error', 'git', `Init failed: ${msg}`)
      workerState.state = 'error'
      reply({ ok: false, error: msg })
    })
}

/**
 * Handle SW_INIT: store config, initialize git repo, reply when ready.
 * Deduplicates concurrent init requests via a shared promise.
 * @param config - GitHub config with token
 * @param reply - Response callback (called after repo init)
 */
export const handleInit = (
  config: SWGitConfig,
  reply: (data: unknown) => void
): void => {
  void withTokenIdentity(config).then(withAuthor =>
    startInit(withAuthor, reply)
  )
}
