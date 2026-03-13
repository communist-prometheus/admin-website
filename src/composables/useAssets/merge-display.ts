import { type ComputedRef, computed } from 'vue'
import {
  committedToDisplay,
  isCoverMatch,
  pendingToDisplay,
} from './display-mappers'
import type { AssetState } from './state'
import type { AssetDisplay } from './types'

/**
 * Create a computed list merging committed and pending.
 * @param slug - Blog article slug
 * @param state - Reactive asset state
 * @returns Computed array of display items
 */
export const createAllAssets = (
  slug: string,
  state: AssetState
): ComputedRef<readonly AssetDisplay[]> =>
  computed(() => {
    const dels = state.pendingDeletes.value
    const cover = state.coverPath.value
    const urls = state.resolvedUrls.value
    const c = state.committed.value.map(i =>
      committedToDisplay(
        i,
        dels.has(i.path),
        isCoverMatch(i.name, cover),
        urls.get(`./assets/${i.name}`) ?? ''
      )
    )
    const p = state.pendingAdds.value.map(a =>
      pendingToDisplay(a, slug, isCoverMatch(a.name, cover))
    )
    return [...c, ...p]
  })
