import { log } from '../../logging/logger'
import { workerState } from '../../state/state'

const DB_NAME = 'sw-git'

/**
 * Wipe the IndexedDB database used by LightningFS.
 * This is the nuclear option — forces a fresh clone on next init.
 */
const wipeDatabase = async (): Promise<void> => {
  try {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(DB_NAME)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      req.onblocked = () => {
        log(
          'warn',
          'lifecycle',
          'IndexedDB delete blocked — connections still open'
        )
        resolve()
      }
    })
    log('info', 'lifecycle', `Deleted IndexedDB "${DB_NAME}"`)
  } catch (err) {
    log('warn', 'lifecycle', `Failed to delete IndexedDB: ${err}`)
  }
}

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
  void wipeDatabase().then(() => reply({ ok: true }))
}
