import { openMeta } from './idb-meta-open'

/**
 * Read a string value from the sw-meta KV store.
 * @param key - Key to look up
 * @returns Stored value or undefined
 */
export const readMetaKey = async (
  key: string
): Promise<string | undefined> => {
  const db = await openMeta()
  return new Promise(r => {
    const g = db.transaction('kv', 'readonly').objectStore('kv').get(key)
    g.onsuccess = () => {
      db.close()
      r(g.result as string | undefined)
    }
    g.onerror = () => {
      db.close()
      r(undefined)
    }
  })
}
