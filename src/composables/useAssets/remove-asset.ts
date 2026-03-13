import type { AssetState } from './state'

/**
 * Create a function that marks an asset for removal.
 * Pending adds are removed immediately; committed assets
 * are added to the pending-delete set.
 * @param state - Reactive asset state
 * @returns Function accepting asset path
 */
export const createRemoveAsset =
  (state: AssetState) =>
  (path: string): void => {
    const pending = state.pendingAdds.value
    const name = path.split('/').pop() ?? ''
    const idx = pending.findIndex(a => a.name === name)
    if (idx >= 0) {
      const asset = pending[idx]
      if (asset) URL.revokeObjectURL(asset.blobUrl)
      state.pendingAdds.value = pending.filter((_, i) => i !== idx)
      return
    }
    const next = new Set(state.pendingDeletes.value)
    next.add(path)
    state.pendingDeletes.value = next
  }
