import type { Lang } from '../subscribers/types'

/** Parsed RSS item with `pubDate` normalised to ISO-8601 UTC. */
export type Article = {
  readonly guid: string
  readonly title: string
  readonly link: string
  readonly lang: Lang
  readonly pubDate: string
}
