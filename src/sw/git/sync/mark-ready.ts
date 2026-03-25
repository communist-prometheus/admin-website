import { log } from '../../logging/logger'
import { workerState } from '../../state/state'

/**
 * Mark the worker as ready and record sync timestamp.
 * @param logMessage - Optional lifecycle message to log
 */
export const markReady = (logMessage?: string): void => {
  workerState.state = 'ready'
  workerState.lastSync = Date.now()
  if (logMessage) {
    log('info', 'lifecycle', logMessage)
  }
}
