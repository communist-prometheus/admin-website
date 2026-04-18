import { log } from '../logging/logger'
import { SW_VERSION } from '../protocol'

declare const self: ServiceWorkerGlobalScope

const VERSION_KEY = 'sw-version'
const DB_NAME = 'sw-git'

/**
 * Check stored SW version against current. If different, wipe
 * IndexedDB to prevent stale data from breaking the new code.
 */
const ensureVersionMatch = async (): Promise<void> => {
  try {
    const stored = await readVersionFromIDB()
    if (stored && stored !== SW_VERSION) {
      log(
        'info',
        'lifecycle',
        `Version mismatch: ${stored} → ${SW_VERSION}, wiping IndexedDB`
      )
      await deleteDatabase()
    }
    await writeVersionToIDB()
  } catch (err) {
    log('warn', 'lifecycle', `Version check failed: ${err}`)
  }
}

const readVersionFromIDB = (): Promise<string | undefined> =>
  new Promise(resolve => {
    const req = indexedDB.open('sw-meta', 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv')
    }
    req.onsuccess = () => {
      const db = req.result
      const tx = db.transaction('kv', 'readonly')
      const get = tx.objectStore('kv').get(VERSION_KEY)
      get.onsuccess = () => {
        db.close()
        resolve(get.result as string | undefined)
      }
      get.onerror = () => {
        db.close()
        resolve(undefined)
      }
    }
    req.onerror = () => resolve(undefined)
  })

const writeVersionToIDB = (): Promise<void> =>
  new Promise(resolve => {
    const req = indexedDB.open('sw-meta', 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv')
    }
    req.onsuccess = () => {
      const db = req.result
      const tx = db.transaction('kv', 'readwrite')
      tx.objectStore('kv').put(SW_VERSION, VERSION_KEY)
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        resolve()
      }
    }
    req.onerror = () => resolve()
  })

const deleteDatabase = (): Promise<void> =>
  new Promise(resolve => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = () => {
      log('info', 'lifecycle', `Deleted ${DB_NAME}`)
      resolve()
    }
    req.onerror = () => resolve()
    req.onblocked = () => resolve()
  })

/**
 * Register SW lifecycle event listeners.
 * Install: skipWaiting for immediate activation.
 * Activate: claim all clients + version-check IndexedDB.
 */
export const registerLifecycle = (): void => {
  self.addEventListener('install', () => {
    log('info', 'lifecycle', 'SW installed')
    self.skipWaiting()
  })

  self.addEventListener('activate', event => {
    log('info', 'lifecycle', 'SW activated')
    event.waitUntil(ensureVersionMatch().then(() => self.clients.claim()))
  })
}
