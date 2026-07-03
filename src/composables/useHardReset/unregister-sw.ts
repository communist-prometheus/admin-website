const dropAll = async (): Promise<void> => {
  const regs = await navigator.serviceWorker
    .getRegistrations()
    .catch(() => [])
  await Promise.all(regs.map(r => r.unregister().catch(() => false)))
}

/**
 * Unregister every ServiceWorkerRegistration under this origin. The next
 * page load starts with no controller and installs a fresh /sw.js.
 *
 * @returns Resolves once every unregister() settles.
 */
export const unregisterAllSW = async (): Promise<void> =>
  'serviceWorker' in navigator ? dropAll() : undefined
