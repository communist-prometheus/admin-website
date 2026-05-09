import { fireAndLog } from '../../logging/fire-and-log'
import { log } from '../../logging/logger'
import { loadRoles } from '../../rbac/resolve-role'
import { workerState } from '../../state/state'
import { refreshSupportedLangs } from './refresh-supported-langs'

/**
 * Mark the worker as ready and record sync timestamp.
 * Loads RBAC roles + the supported-languages set from the cloned
 * repo. Both reads run fire-and-forget — they cannot block readiness
 * (the user is mid-init) but real failures must surface through
 * `fireAndLog`, not the silent `.catch(() => {})` we used to have.
 * @param logMessage - Optional lifecycle message to log
 */
export const markReady = (logMessage?: string): void => {
  workerState.state = 'ready'
  workerState.lastSync = Date.now()
  if (logMessage) {
    log('info', 'lifecycle', logMessage)
  }
  fireAndLog(loadRoles(), 'rbac')
  fireAndLog(refreshSupportedLangs(), 'lifecycle')
}
