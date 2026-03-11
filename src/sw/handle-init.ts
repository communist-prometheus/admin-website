import { checkRepoAndSync } from './git/sync-repo'
import { log } from './logging/logger'
import type { SWGitConfig } from './protocol'
import { workerState } from './state'

/**
 * Handle SW_INIT: store config, initialize git repo, reply when ready.
 * @param config - GitHub config with token
 * @param reply - Response callback (called after repo init)
 */
export const handleInit = (
  config: SWGitConfig,
  reply: (data: unknown) => void
): void => {
  workerState.config = config
  log('info', 'auth', 'Config received', { owner: config.owner })

  checkRepoAndSync(config)
    .then(() => reply({ ok: true, state: 'ready' }))
    .catch(err => {
      const msg = err instanceof Error ? err.message : String(err)
      log('error', 'git', `Init failed: ${msg}`)
      workerState.state = 'error'
      reply({ ok: false, error: msg })
    })
}
