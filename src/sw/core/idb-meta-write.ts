import { openMeta } from './idb-meta-open'

/**
 * Write a string value to the sw-meta KV store.
 * @param key - Key to store under
 * @param value - Value to persist
 */
export const writeMetaKey = async (
  key: string,
  value: string
): Promise<void> => {
  const db = await openMeta()
  return new Promise(r => {
    const tx = db.transaction('kv', 'readwrite')
    tx.objectStore('kv').put(value, key)
    tx.oncomplete = () => {
      db.close()
      r()
    }
    tx.onerror = () => {
      db.close()
      r()
    }
  })
}
