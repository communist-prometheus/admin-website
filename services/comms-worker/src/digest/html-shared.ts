import type { Article } from '../rss/types'
import type { Lang } from '../subscribers/types'

/** Pre-stamped article + UTM-tagged URL pair. */
export type StampedArticle = readonly [Article, string]

/** Article groups in the recipient's preferred order. */
export type LangGroups = ReadonlyArray<
  readonly [Lang, ReadonlyArray<StampedArticle>]
>

/** Stamped newspaper issues split into top announcements + foot current. */
export type StampedNewspapers = {
  readonly announcements: ReadonlyArray<StampedArticle>
  readonly current: ReadonlyArray<StampedArticle>
}

/** Light-card background applied inline so non-style-aware clients keep working. */
export const CARD_STYLE = 'background:#fff;color:#222'
