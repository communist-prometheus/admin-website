import type { Lang } from '../subscribers/types'
import { parseRss } from './parse'
import type { Article } from './types'

/** Source of truth for the public RSS endpoint. */
export const FALLBACK_BASE = 'https://comprom.org'

type Deps = {
  readonly base?: string
  readonly fetch?: typeof fetch
}

/** Fetcher function signature consumed by the orchestrator. */
export type RssFetcher = (lang: Lang) => Promise<ReadonlyArray<Article>>

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

/**
 * Build a per-language RSS fetcher bound to the given base URL +
 * fetch implementation. Failures (network or non-2xx) collapse to an
 * empty article list; logging is the caller's concern.
 * @param d Injected base + fetch.
 * @returns Fetcher returning parsed articles for one language.
 */
export const createRssFetcher = (d: Deps = {}): RssFetcher => {
  const base = d.base ?? FALLBACK_BASE
  const doFetch = d.fetch ?? globalThis.fetch.bind(globalThis)
  return async lang => {
    const body = await safeFetch(doFetch, `${base}/${lang}/rss.xml`)
    return body === undefined ? [] : parseRss(body, lang)
  }
}
