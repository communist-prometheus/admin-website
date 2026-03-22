import { onUnmounted } from 'vue'
import { createAddAsset } from './add-asset'
import { createCleanup, createResetPending } from './cleanup'
import { createRemoveCover, createSetCover } from './cover-ops'
import { createIsDirty } from './is-dirty'
import { createLoadCommitted } from './load-committed'
import { createAllAssets } from './merge-display'
import { createRemoveAsset } from './remove-asset'
import { createAssetState } from './state'
import { createCoverUrl, createUrlMap } from './url-map'

/**
 * Asset management composable for content items with folder-based structure.
 * @param type - Content type (blog, pages, positions)
 * @param slug - Content slug
 * @param initialCover - Initial cover path from frontmatter
 * @returns Asset manager interface
 */
export const useAssets = (type: string, slug: string, initialCover: string | undefined) => {
  const state = createAssetState(initialCover)
  const urlMap = createUrlMap(state)
  const resetPending = createResetPending(state)
  const cleanup = createCleanup(resetPending)

  onUnmounted(cleanup)

  return {
    ...state,
    allAssets: createAllAssets(type, slug, state),
    urlMap,
    coverUrl: createCoverUrl(state, urlMap),
    isDirty: createIsDirty(state),
    loadAssets: createLoadCommitted(type, slug, state),
    addAsset: createAddAsset(state),
    removeAsset: createRemoveAsset(state),
    setCover: createSetCover(state),
    removeCover: createRemoveCover(state),
    resetPending,
    cleanup,
  }
}
