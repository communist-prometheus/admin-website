const META_DB = 'sw-meta'

/**
 * Open the sw-meta IndexedDB database.
 * @returns Open database handle
 */
export const openMeta = (): Promise<IDBDatabase> =>
  new Promise(resolve => {
    const req = indexedDB.open(META_DB, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('kv'))
        req.result.createObjectStore('kv')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(req.result)
  })
