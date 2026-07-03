const dropAll = async (): Promise<void> => {
  const keys = await caches.keys().catch(() => [] as string[])
  await Promise.all(keys.map(k => caches.delete(k).catch(() => false)))
}

/**
 * Drop every entry in the browser's CacheStorage. Missing API (older
 * Safari / private modes) is treated as "nothing to clear".
 *
 * @returns Resolves once all `caches.delete()` calls settle.
 */
export const clearCaches = async (): Promise<void> =>
  typeof caches === 'undefined' ? undefined : dropAll()
