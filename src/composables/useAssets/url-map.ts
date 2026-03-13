import { type ComputedRef, computed } from 'vue'
import type { AssetState } from './state'

/**
 * Create a computed map of relative asset paths to blob URLs.
 * Used by the markdown preview renderer.
 * @param state - Reactive asset state
 * @returns Computed map: './assets/name' -> blob URL
 */
export const createUrlMap = (
  state: AssetState
): ComputedRef<ReadonlyMap<string, string>> =>
  computed(() => {
    const map = new Map(state.resolvedUrls.value)
    for (const asset of state.pendingAdds.value) {
      map.set(`./assets/${asset.name}`, asset.blobUrl)
    }
    return map
  })

/**
 * Create a computed cover blob URL from the URL map.
 * @param state - Reactive asset state
 * @param urlMap - Computed URL map
 * @returns Computed cover URL or undefined
 */
export const createCoverUrl = (
  state: AssetState,
  urlMap: ComputedRef<ReadonlyMap<string, string>>
): ComputedRef<string | undefined> =>
  computed(() => {
    const cp = state.coverPath.value
    if (!cp) return undefined
    return urlMap.value.get(cp)
  })
