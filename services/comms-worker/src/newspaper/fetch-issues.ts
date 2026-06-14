import type { Lang, Subscriber } from '../subscribers/types'
import type { IssuesByLang, NewspaperFetcher } from './fetch'

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
 * Fetch the latest newspaper issue for every language any subscriber
 * wants, once per tick. Languages with no issue are simply absent.
 * @param subs Active subscribers for the current tick.
 * @param fetcher Per-language newspaper fetcher.
 * @returns Latest issue grouped by language.
 */
export const fetchLatestIssues = async (
  subs: ReadonlyArray<Subscriber>,
  fetcher: NewspaperFetcher
): Promise<IssuesByLang> => {
  const acc: IssuesByLang = {}
  for (const lang of uniqueLangs(subs)) {
    const issue = await fetcher(lang)
    if (issue !== undefined) acc[lang] = issue
  }
  return acc
}
