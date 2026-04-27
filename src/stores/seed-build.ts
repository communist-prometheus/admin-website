import { contentFile } from '@/config/content-paths'
import type { ContentItem, ContentType } from '@/types/content'
import { stringifyFrontmatter } from '@/utils/frontmatter/stringify'

/** A seed file ready to stage: target path + serialised content. */
export interface SeedFile {
  readonly path: string
  readonly content: string
}

const groupBySlug = (
  items: readonly ContentItem[]
): ReadonlyMap<string, readonly ContentItem[]> => {
  const map = new Map<string, ContentItem[]>()
  for (const it of items) {
    const list = map.get(it.slug) ?? []
    list.push(it)
    map.set(it.slug, list)
  }
  return map
}

const pickTemplate = (
  variants: readonly ContentItem[]
): ContentItem | undefined =>
  variants.find(v => v.lang === 'en') ?? variants[0]

const seedsForSlug = (
  type: ContentType,
  slug: string,
  variants: readonly ContentItem[],
  newLangs: readonly string[]
): readonly SeedFile[] => {
  const template = pickTemplate(variants)
  return template === undefined
    ? []
    : newLangs
        .filter(lang => !variants.some(v => v.lang === lang))
        .map(lang => ({
          path: contentFile(type, slug, lang),
          content: stringifyFrontmatter(
            { ...template.frontmatter, lang },
            ''
          ),
        }))
}

/**
 * For every slug in `items`, produce a seed file per `newLangs` lang
 * that doesn't already have a translation. Frontmatter is cloned from
 * the picked template and the `lang` field is overwritten — body is
 * intentionally empty so editors fill it in via admin.
 *
 * @param type - Content type (`pages` or `common`)
 * @param items - All existing content items of that type
 * @param newLangs - Lang codes that just got added
 * @returns Files to stage; empty when nothing needs seeding
 */
export const buildSeed = (
  type: ContentType,
  items: readonly ContentItem[],
  newLangs: readonly string[]
): readonly SeedFile[] =>
  [...groupBySlug(items)].flatMap(([slug, variants]) =>
    seedsForSlug(type, slug, variants, newLangs)
  )
