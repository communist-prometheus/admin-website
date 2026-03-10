import { log } from './logging/logger'
import type { SWGitConfig } from './protocol'
import { workerState } from './state'

/**
 * Handle SW_INIT: store config from client.
 * @param config - GitHub config with token
 * @param reply - Response callback
 */
export const handleInit = (
  config: SWGitConfig,
  reply: (data: unknown) => void
): void => {
  workerState.config = config
  log('info', 'auth', 'Config received', {
    owner: config.owner,
  })
  reply({ ok: true })
}
