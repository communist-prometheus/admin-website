import type { Page } from '@playwright/test'

/**
 * Clear the SW's IndexedDB to force fresh mock data on next init.
 * Unregisters SW and deletes ALL IndexedDB databases for the origin.
 * @param page - Playwright page
 */
export const resetSWData = async (page: Page): Promise<void> => {
  await page.goto('/', { waitUntil: 'commit' })

  // Unregister SW first so it stops using IndexedDB
  await page.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(regs.map(r => r.unregister()))
  })

  // Delete ALL IndexedDB databases
  await page.evaluate(async () => {
    const dbs = await globalThis.indexedDB.databases()
    await Promise.all(
      dbs.map(
        db =>
          new Promise<void>((resolve, reject) => {
            const req = globalThis.indexedDB.deleteDatabase(db.name ?? '')
            req.onsuccess = () => resolve()
            req.onerror = () => reject(req.error)
          })
      )
    )
  })

  // Reload to trigger fresh SW registration and mock init
  await page.reload({ waitUntil: 'domcontentloaded' })
}
