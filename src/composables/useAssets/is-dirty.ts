import { computed } from 'vue'
import type { AssetState } from './state'

/**
 * Create a computed dirty flag for asset state.
 * @param state - Reactive asset state
 * @returns Computed boolean indicating pending changes
 */
export const createIsDirty = (state: AssetState) =>
  computed(
    () =>
      state.pendingAdds.value.length > 0 ||
      state.pendingDeletes.value.size > 0
  )
