import type { Article } from '../rss/types'
import type { Lang, Subscriber } from '../subscribers/types'
import { renderHtml } from './html'
import { CHROME } from './i18n'
import { renderText } from './text'
import { appendUtm, isoWeekString } from './utm'

/** Inputs accepted by {@link renderDigest}. */
export type DigestRenderInput = {
  readonly subscriber: Subscriber
  readonly articles: ReadonlyArray<Article>
  readonly unsubscribeUrl: string
  readonly tickAt: Date
}

/** Outputs of the digest renderer. */
export type Digest = {
  readonly subject: string
  readonly html: string
  readonly text: string
  readonly listUnsubscribe: string
  readonly listUnsubscribePost: string
}

const POST_HEADER = 'List-Unsubscribe=One-Click'

const stampItems = (
  articles: ReadonlyArray<Article>,
  campaign: string
): ReadonlyArray<readonly [Article, string]> =>
  articles.map(a => [a, appendUtm(a.link, campaign)] as const)

const chromeFor = (langs: ReadonlyArray<Lang>) => CHROME[langs[0] ?? 'en']

/**
 * Build the per-subscriber digest payload — subject, HTML body, text
 * body, and the two RFC-8058 List-Unsubscribe header values.
 * @param input Subscriber, articles, unsubscribe URL, tick moment.
 * @returns Complete digest ready to hand to the Resend client.
 */
export const renderDigest = (input: DigestRenderInput): Digest => {
  const chrome = chromeFor(input.subscriber.langs)
  const campaign = isoWeekString(input.tickAt)
  const items = stampItems(input.articles, campaign)
  return {
    subject: chrome.subject(input.articles.length),
    html: renderHtml(chrome, items, input.unsubscribeUrl),
    text: renderText(chrome, items, input.unsubscribeUrl),
    listUnsubscribe: `<${input.unsubscribeUrl}>`,
    listUnsubscribePost: POST_HEADER,
  }
}
