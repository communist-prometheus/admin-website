import { fromRequest, listPending, txStore } from './idb'

/**
 * Clear the `attempt` counter on every queued entry. Called when
 * connectivity is restored so prior backoff schedules do not delay
 * the drain after the user is back online.
 * @returns Resolves once the rewrite completes.
 */
export const resetAttempts = async (): Promise<void> => {
  const all = await listPending()
  await Promise.all(
    all.map(async entry => {
      const store = await txStore('readwrite')
      await fromRequest(store.put({ ...entry, attempt: 1 }))
    })
  )
}
