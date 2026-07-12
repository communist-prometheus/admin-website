import type { ContentItem } from '@/types/content'
import type { Language } from '@/types/language'

/** A blog article available to be linked into a magazine issue. */
export interface ArticleOption {
  readonly slug: string
  readonly title: string
  readonly publishedAt: number
}

/** Arguments for {@link articleOptions}. */
export interface ArticleOptionsInput {
  readonly items: readonly ContentItem[]
  readonly lang: Language
  readonly exclude: readonly string[]
}

const stringFm = (fm: ContentItem['frontmatter'], key: string): string => {
  const v = fm[key]
  return typeof v === 'string' ? v : ''
}

const titleOf = (item: ContentItem): string =>
  stringFm(item.frontmatter, 'title').trim() || item.slug

const dateOf = (item: ContentItem): number => {
  const raw =
    stringFm(item.frontmatter, 'publishDate') ||
    stringFm(item.frontmatter, 'pubDate')
  const ms = raw ? Date.parse(raw) : Number.NaN
  return Number.isNaN(ms) ? Number.NEGATIVE_INFINITY : ms
}

const toOption = (item: ContentItem): ArticleOption => ({
  slug: item.slug,
  title: titleOf(item),
  publishedAt: dateOf(item),
})

const compare = (a: ArticleOption, b: ArticleOption): number =>
  b.publishedAt - a.publishedAt || a.title.localeCompare(b.title)

/**
 * Build the available-articles list for the magazine picker, scoped
 * to a single language and sorted newest-first with an alphabetical
 * title tie-break. Already-linked slugs and items in other languages
 * are dropped.
 * @param input Items, current language, and slugs to exclude.
 * @returns Picker options for the current language.
 */
export const articleOptions = (
  input: ArticleOptionsInput
): readonly ArticleOption[] => {
  const taken = new Set(input.exclude)
  return input.items
    .filter(it => it.lang === input.lang && !taken.has(it.slug))
    .map(toOption)
    .sort(compare)
}
