import { log } from '../logging/logger'

export { readMetaKey, writeMetaKey } from './idb-meta'

const GIT_DB = 'sw-git'

/** Delete the sw-git IndexedDB database. */
export const deleteGitDatabase = (): Promise<void> =>
  new Promise(resolve => {
    const req = indexedDB.deleteDatabase(GIT_DB)
    req.onsuccess = () => {
      log('info', 'lifecycle', `Deleted ${GIT_DB}`)
      resolve()
    }
    req.onerror = () => resolve()
    req.onblocked = () => resolve()
  })
