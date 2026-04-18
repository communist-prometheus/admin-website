import { log } from '../../logging/logger'
import { loadRoles } from '../../rbac/resolve-role'
import { workerState } from '../../state/state'

/**
 * Mark the worker as ready and record sync timestamp.
 * Loads RBAC roles from the cloned repo.
 * @param logMessage - Optional lifecycle message to log
 */
export const markReady = (logMessage?: string): void => {
  workerState.state = 'ready'
  workerState.lastSync = Date.now()
  if (logMessage) {
    log('info', 'lifecycle', logMessage)
  }
  loadRoles().catch(() => {})
}
