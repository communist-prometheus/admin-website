import type { Article } from '../rss/types'
import type { Lang, Subscriber } from '../subscribers/types'
import type { LangGroups, StampedArticle } from './html'
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

const stampedFor = (a: Article, campaign: string): StampedArticle =>
  [a, appendUtm(a.link, campaign)] as const

const groupByLang = (
  langs: ReadonlyArray<Lang>,
  articles: ReadonlyArray<Article>,
  campaign: string
): LangGroups =>
  langs
    .map(lang => {
      const items = articles
        .filter(a => a.lang === lang)
        .map(a => stampedFor(a, campaign))
      return [lang, items] as const
    })
    .filter(([, items]) => items.length > 0)

const chromeFor = (langs: ReadonlyArray<Lang>) => CHROME[langs[0] ?? 'en']

/**
 * Build the per-subscriber digest payload — subject, HTML body, text
 * body, and the two RFC-8058 List-Unsubscribe header values. Articles
 * are grouped by language in the recipient's preferred order; the
 * subscriber's first language drives the chrome (subject + intro +
 * unsubscribe copy).
 * @param input Subscriber, articles, unsubscribe URL, tick moment.
 * @returns Complete digest ready to hand to the Resend client.
 */
export const renderDigest = (input: DigestRenderInput): Digest => {
  const chrome = chromeFor(input.subscriber.langs)
  const campaign = isoWeekString(input.tickAt)
  const groups = groupByLang(input.subscriber.langs, input.articles, campaign)
  return {
    subject: chrome.subject(input.articles.length),
    html: renderHtml(chrome, groups, input.unsubscribeUrl),
    text: renderText(chrome, groups, input.unsubscribeUrl),
    listUnsubscribe: `<${input.unsubscribeUrl}>`,
    listUnsubscribePost: POST_HEADER,
  }
}
