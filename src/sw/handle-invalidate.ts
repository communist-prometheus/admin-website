import { log } from './logging/logger'
import { workerState } from './state'

/**
 * Handle SW_INVALIDATE: reset worker state.
 * @param reply - Response callback
 */
export const handleInvalidate = (reply: (data: unknown) => void): void => {
  log('info', 'lifecycle', 'Invalidation requested')
  workerState.state = 'idle'
  workerState.lastSync = undefined
  workerState.commitSha = undefined
  reply({ ok: true })
}
