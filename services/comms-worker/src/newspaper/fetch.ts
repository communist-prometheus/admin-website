import { FALLBACK_BASE } from '../rss/fetch'
import { parseRss } from '../rss/parse'
import type { Article } from '../rss/types'
import type { Lang } from '../subscribers/types'

/** The latest newspaper issue for a language, or none. */
export type IssuesByLang = Partial<Record<Lang, Article>>

type Deps = {
  readonly base?: string
  readonly fetch?: typeof fetch
}

/** Fetcher returning the newest published issue for one language. */
export type NewspaperFetcher = (lang: Lang) => Promise<Article | undefined>

const safeFetch = async (
  doFetch: typeof fetch,
  url: string
): Promise<string | undefined> => {
  try {
    const res = await doFetch(url)
    return res.ok ? await res.text() : undefined
  } catch {
    return undefined
  }
}

const newest = (items: ReadonlyArray<Article>): Article | undefined =>
  [...items].sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate))[0]

/**
 * Build a per-language newspaper fetcher bound to the given base URL.
 * Reads `/<lang>/newspaper.xml` and returns the newest published
 * issue (or undefined on network/parse failure or an empty feed).
 * @param d Injected base + fetch.
 * @returns Fetcher returning the latest issue for one language.
 */
export const createNewspaperFetcher = (d: Deps = {}): NewspaperFetcher => {
  const base = d.base ?? FALLBACK_BASE
  const doFetch = d.fetch ?? globalThis.fetch.bind(globalThis)
  return async lang => {
    const body = await safeFetch(doFetch, `${base}/${lang}/newspaper.xml`)
    if (body === undefined) return undefined
    return newest(parseRss(body, lang))
  }
}
