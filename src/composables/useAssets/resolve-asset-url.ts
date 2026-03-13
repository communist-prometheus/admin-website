import { fetchAsset } from '../useGitHubApi/fetch-asset'
import { createBlobUrl } from './create-blob-url'

const cache = new Map<string, string>()

/**
 * Resolve a committed asset path to a displayable blob URL.
 * Fetches from SW, caches the result.
 * @param path - Full asset path
 * @returns Blob URL
 */
export const resolveAssetUrl = async (path: string): Promise<string> => {
  const cached = cache.get(path)
  if (cached) return cached

  const asset = await fetchAsset(path)
  const url = createBlobUrl(asset.content, asset.mimeType)
  cache.set(path, url)
  return url
}

/**
 * Revoke all cached blob URLs and clear the cache.
 */
export const clearAssetUrlCache = (): void => {
  for (const url of cache.values()) URL.revokeObjectURL(url)
  cache.clear()
}
