import type { Article } from '../rss/types'
import type { Lang, Subscriber } from '../subscribers/types'

/** RSS items grouped by language code, as the orchestrator caches them. */
export type ArticlesByLang = Readonly<
  Partial<Record<Lang, ReadonlyArray<Article>>>
>

const isNewerThan = (a: Article, threshold: number | undefined): boolean => {
  const ms = Date.parse(a.pubDate)
  if (!Number.isFinite(ms)) return false
  return threshold === undefined || ms > threshold
}

const collectFor = (
  sub: Subscriber,
  byLang: ArticlesByLang,
  thresholdMs: number | undefined
): ReadonlyArray<Article> => {
  const out: Article[] = []
  for (const lang of sub.langs) {
    const items = byLang[lang] ?? []
    for (const item of items) {
      if (isNewerThan(item, thresholdMs)) out.push(item)
    }
  }
  return out
}

/**
 * Compute the per-subscriber digest delta: every article whose lang
 * is in `sub.langs[]` AND whose `pubDate` is strictly newer than the
 * shared `cutoffMs` watermark. Results are merged across the
 * subscriber's languages and sorted newest-first.
 *
 * The cutoff is global (stored in `settings.cutoff_at`) and is
 * advanced after every successful dispatch tick, so all subscribers
 * see the same "what is new" boundary.
 * @param sub The recipient.
 * @param byLang RSS items grouped by language code.
 * @param cutoffMs Global cutoff in ms (undefined = no cutoff yet).
 * @returns Sorted, deduplicable article list.
 */
export const computeDelta = (
  sub: Subscriber,
  byLang: ArticlesByLang,
  cutoffMs: number | undefined
): ReadonlyArray<Article> => {
  const collected = collectFor(sub, byLang, cutoffMs)
  return [...collected].sort(
    (a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate)
  )
}
