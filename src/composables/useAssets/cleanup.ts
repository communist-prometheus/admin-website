import { clearAssetUrlCache } from './resolve-asset-url'
import type { AssetState } from './state'

/**
 * Create a function that resets pending asset changes.
 * @param state - Reactive asset state
 * @returns Reset function
 */
export const createResetPending =
  (state: AssetState): (() => void) =>
  (): void => {
    for (const a of state.pendingAdds.value) {
      URL.revokeObjectURL(a.blobUrl)
    }
    state.pendingAdds.value = []
    state.pendingDeletes.value = new Set()
  }

/**
 * Create a cleanup function that resets pending and clears URL cache.
 * @param resetPending - Reset pending function
 * @returns Cleanup function
 */
export const createCleanup =
  (resetPending: () => void): (() => void) =>
  (): void => {
    resetPending()
    clearAssetUrlCache()
  }
