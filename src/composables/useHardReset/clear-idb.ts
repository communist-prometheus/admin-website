/*
 * indexedDB.databases() is supported on Chromium 71+ and Safari 14+ but
 * NOT on Firefox as of this writing. Where unavailable we still hit the
 * known SW-owned DBs by name so the essentials get wiped even on FF.
 */
const KNOWN_DB_NAMES = ['sw-git', 'sw-meta']

const deleteDbByName = (name: string): Promise<void> =>
  new Promise(resolve => {
    const req = indexedDB.deleteDatabase(name)
    req.onsuccess = () => resolve()
    req.onerror = () => resolve()
    req.onblocked = () => resolve()
  })

const listViaApi = async (): Promise<readonly string[]> => {
  const list = await (
    indexedDB.databases as () => Promise<{ readonly name?: string }[]>
  )().catch(() => [] as { readonly name?: string }[])
  return list.map(d => d.name).filter((n): n is string => Boolean(n))
}

const listAllDbs = async (): Promise<readonly string[]> =>
  'databases' in indexedDB ? listViaApi() : []

const wipeAll = async (): Promise<void> => {
  const names = [...new Set([...KNOWN_DB_NAMES, ...(await listAllDbs())])]
  await Promise.all(names.map(n => deleteDbByName(n)))
}

/**
 * Drop every IndexedDB the origin owns — the discovered ones plus the
 * known SW-owned names, so essentials are wiped even on browsers that
 * don't support `indexedDB.databases()`.
 *
 * @returns Resolves once every deleteDatabase() request settles.
 */
export const clearAllIDB = async (): Promise<void> =>
  typeof indexedDB === 'undefined' ? undefined : wipeAll()
