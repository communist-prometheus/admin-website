import { fetchAssetList } from '../useGitHubApi/fetch-asset-list'
import { buildAssetsPrefix } from './build-asset-path'
import { resolveAssetUrl } from './resolve-asset-url'
import type { AssetState } from './state'

/**
 * Create a function that loads committed assets from SW.
 * @param type - Content type
 * @param slug - Content slug
 * @param state - Reactive asset state
 * @returns Async loader function
 */
export const createLoadCommitted =
  (type: string, slug: string, state: AssetState) =>
  async (): Promise<void> => {
    state.loading.value = true
    try {
      const prefix = buildAssetsPrefix(type, slug)
      const items = await fetchAssetList(prefix)
      state.committed.value = items
      const urls = new Map<string, string>()
      for (const item of items) {
        const url = await resolveAssetUrl(item.path)
        urls.set(`./assets/${item.name}`, url)
      }
      state.resolvedUrls.value = urls
    } finally {
      state.loading.value = false
    }
  }
