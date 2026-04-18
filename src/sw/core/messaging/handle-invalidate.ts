import { log } from '../../logging/logger'
import { workerState } from '../../state/state'
import { deleteGitDatabase } from '../idb-helpers'

/**
 * Handle SW_INVALIDATE: reset worker state AND wipe IndexedDB.
 * Forces a clean slate — next init will re-clone with fresh config.
 * @param reply - Response callback
 */
export const handleInvalidate = (reply: (data: unknown) => void): void => {
  log(
    'info',
    'lifecycle',
    'Invalidation requested — wiping state + IndexedDB'
  )
  workerState.state = 'idle'
  workerState.lastSync = undefined
  workerState.commitSha = undefined
  workerState.config = undefined
  void deleteGitDatabase().then(() => reply({ ok: true }))
}
