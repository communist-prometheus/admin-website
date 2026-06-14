import { resolveAssetUrl } from './resolve-asset-url'
import type { AssetDisplay } from './types'

/** Minimal asset reference sufficient to download a file. */
export interface DownloadableAsset {
  readonly path: string
  readonly name: string
  /** In-memory blob URL for a not-yet-committed (pending) asset. */
  readonly blobUrl?: string
}

/**
 * Map a display asset to a downloadable reference: a committed asset is
 * fetched fresh through the SW, a pending one is only in memory so its
 * blob URL is handed straight to the downloader.
 * @param asset - Display asset
 * @returns Downloadable reference
 */
export const assetToDownloadable = (
  asset: AssetDisplay
): DownloadableAsset => ({
  path: asset.path,
  name: asset.name,
  blobUrl: asset.status === 'committed' ? undefined : asset.thumbnailUrl,
})

/**
 * Resolve the URL to download an asset from: the in-memory blob URL for
 * a pending asset, otherwise the committed file fetched through the SW.
 * @param asset - Asset reference
 * @returns Object URL to download from
 */
export const resolveDownloadUrl = (
  asset: DownloadableAsset
): Promise<string> =>
  asset.blobUrl ? Promise.resolve(asset.blobUrl) : resolveAssetUrl(asset.path)

/**
 * Trigger a browser download of `url` saved under `filename`, without
 * navigating the current document.
 * @param url - Object or remote URL
 * @param filename - Suggested download filename
 */
export const triggerDownload = (url: string, filename: string): void => {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
}

/**
 * Download an asset file under its original name.
 * @param asset - Asset reference (pending or committed)
 */
export const downloadAsset = async (
  asset: DownloadableAsset
): Promise<void> => {
  const url = await resolveDownloadUrl(asset)
  triggerDownload(url, asset.name)
}
