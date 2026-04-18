const META_DB = 'sw-meta'

const openMeta = (): Promise<IDBDatabase> =>
  new Promise(resolve => {
    const req = indexedDB.open(META_DB, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(req.result)
  })

/** Read a string value from the sw-meta KV store. */
export const readMetaKey = async (
  key: string
): Promise<string | undefined> => {
  const db = await openMeta()
  return new Promise(resolve => {
    const get = db.transaction('kv', 'readonly').objectStore('kv').get(key)
    get.onsuccess = () => {
      db.close()
      resolve(get.result as string | undefined)
    }
    get.onerror = () => {
      db.close()
      resolve(undefined)
    }
  })
}

/** Write a string value to the sw-meta KV store. */
export const writeMetaKey = async (
  key: string,
  value: string
): Promise<void> => {
  const db = await openMeta()
  return new Promise(resolve => {
    const tx = db.transaction('kv', 'readwrite')
    tx.objectStore('kv').put(value, key)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      resolve()
    }
  })
}
