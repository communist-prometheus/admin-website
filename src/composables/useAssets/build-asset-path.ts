import { assetDir, assetFile } from '@/config/content-paths'

/**
 * Build the full path for an asset in a blog article.
 * @param slug - Blog article slug
 * @param filename - Asset filename
 * @returns Full path like blog/{slug}/assets/{filename}
 */
export const buildAssetPath = (slug: string, filename: string): string =>
  assetFile(slug, filename)

/**
 * Build the assets directory prefix for listing.
 * @param slug - Blog article slug
 * @returns Directory prefix
 */
export const buildAssetsPrefix = (slug: string): string => assetDir(slug)
