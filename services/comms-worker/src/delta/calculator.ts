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
 * Compute the per-subscriber digest delta: every article whose lang is
 * in `sub.langs[]` AND whose `pubDate` is strictly newer than
 * `sub.lastSentAt`. Results are merged across languages and sorted
 * newest-first (R3.8).
 * @param sub The recipient.
 * @param byLang RSS items grouped by language code.
 * @returns Sorted, deduplicable article list.
 */
export const computeDelta = (
  sub: Subscriber,
  byLang: ArticlesByLang
): ReadonlyArray<Article> => {
  const thresholdMs =
    sub.lastSentAt === undefined ? undefined : Date.parse(sub.lastSentAt)
  const collected = collectFor(sub, byLang, thresholdMs)
  return [...collected].sort(
    (a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate)
  )
}
