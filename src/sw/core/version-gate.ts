import { log } from '../logging/logger'
import { SW_VERSION } from '../protocol'
import { deleteGitDatabase, readMetaKey, writeMetaKey } from './idb-helpers'

const VERSION_KEY = 'sw-version'

/**
 * Compare stored SW version with current. Wipe IndexedDB on mismatch
 * so stale data from a previous build cannot break the new code.
 */
export const ensureVersionMatch = async (): Promise<void> => {
  try {
    const stored = await readMetaKey(VERSION_KEY)
    if (stored && stored !== SW_VERSION) {
      log(
        'info',
        'lifecycle',
        `Version mismatch: ${stored} → ${SW_VERSION}, wiping IndexedDB`
      )
      await deleteGitDatabase()
    }
    await writeMetaKey(VERSION_KEY, SW_VERSION)
  } catch (err) {
    log('warn', 'lifecycle', `Version check failed: ${err}`)
  }
}
