import { assetDir, assetFile } from '@/config/content-paths'

/**
 * Build the full path for an asset in a content item.
 * @param type - Content type
 * @param slug - Content slug
 * @param filename - Asset filename
 * @returns Full path like blog/{slug}/assets/{filename}
 */
export const buildAssetPath = (type: string, slug: string, filename: string): string =>
  assetFile(type, slug, filename)

/**
 * Build the assets directory prefix for listing.
 * @param type - Content type
 * @param slug - Content slug
 * @returns Directory prefix
 */
export const buildAssetsPrefix = (type: string, slug: string): string => assetDir(type, slug)
