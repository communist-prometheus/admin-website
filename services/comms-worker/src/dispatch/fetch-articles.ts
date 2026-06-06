import type { RssFetcher } from '../rss/fetch'
import type { Article } from '../rss/types'
import type { Lang, Subscriber } from '../subscribers/types'

/** Articles grouped by language, materialised once per tick. */
export type ArticlesByLang = Partial<Record<Lang, ReadonlyArray<Article>>>

const uniqueLangs = (
  subs: ReadonlyArray<Subscriber>
): ReadonlyArray<Lang> => {
  const set = new Set<Lang>()
  for (const s of subs) {
    for (const l of s.langs) set.add(l)
  }
  return [...set]
}

/**
 * Fetch every language requested by any subscriber, exactly once per
 * tick. Failed fetches degrade to `[]` for that language.
 * @param subs Active subscribers for the current tick.
 * @param fetcher Per-language RSS fetcher.
 * @returns Articles grouped by language.
 */
export const fetchAllLangs = async (
  subs: ReadonlyArray<Subscriber>,
  fetcher: RssFetcher
): Promise<ArticlesByLang> => {
  const langs = uniqueLangs(subs)
  const acc: Partial<Record<Lang, ReadonlyArray<Article>>> = {}
  for (const lang of langs) {
    acc[lang] = await fetcher(lang)
  }
  return acc
}
