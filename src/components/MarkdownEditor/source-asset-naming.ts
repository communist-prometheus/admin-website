import type { AssetDisplay } from '@/composables/useAssets/types'

/**
 * Per-lang filename for a newspaper source. Mirrors the convention
 * used by `findIssueAsset` in public-website.
 * @param slug - Issue slug
 * @param lang - Language code
 * @param ext - File extension WITHOUT the leading dot
 * @returns Per-lang filename like `magazine-1.ru.pdf`
 */
export const sourceName = (slug: string, lang: string, ext: string): string =>
  `${slug}.${lang}.${ext}`

/**
 * Per-lang cover filename matching the convention above.
 * @param lang - Language code
 * @returns Cover filename like `cover.ru.png`
 */
export const coverName = (lang: string): string => `cover.${lang}.png`

const isLive = (a: AssetDisplay): boolean => a.status !== 'pending-delete'

/**
 * Match a source asset against the current `<slug>.<lang>.<ext>`
 * naming. Falls back to the pre-multilang `<slug>.<ext>` so
 * existing single-language issues keep rendering until someone
 * re-uploads under the new convention.
 * @param a - Asset under inspection
 * @param slug - Issue slug
 * @param lang - Active language
 * @param ext - File extension without the leading dot
 * @returns Whether the asset is the source for this lang
 */
export const matchesSource = (
  a: AssetDisplay,
  slug: string,
  lang: string,
  ext: string
): boolean => {
  const name = a.name.toLowerCase()
  return (
    isLive(a) &&
    name.endsWith(`.${ext}`) &&
    (name === sourceName(slug, lang, ext).toLowerCase() ||
      name === `${slug}.${ext}`.toLowerCase())
  )
}
