import { loadConfig } from '../git/repo/persist-config'
import { checkRepoAndSync } from '../git/sync/sync-repo'
import { log } from '../logging/logger'
import { workerState } from '../state/state'

/**
 * Attempt to auto-recover after browser-triggered SW restart.
 * Loads persisted config from IndexedDB and re-verifies repo.
 * @returns true if recovery succeeded and SW is ready
 */
export const autoRecover = async (): Promise<boolean> => {
  try {
    const config = await loadConfig()
    if (!config) return false
    workerState.config = config
    await checkRepoAndSync(config)
    log('info', 'lifecycle', 'Auto-recovered after SW restart')
    return workerState.state === 'ready'
  } catch (err) {
    log('error', 'lifecycle', `Auto-recover failed: ${err}`)
    return false
  }
}
