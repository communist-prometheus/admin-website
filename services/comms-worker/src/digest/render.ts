import type { MagazineSelection } from '../magazine/classify'
import type { Article } from '../rss/types'
import type { Subscriber } from '../subscribers/types'
import { renderHtml } from './html'
import {
  chromeFor,
  EMPTY_MAGAZINES,
  groupByLang,
  stampMagazines,
  subjectFor,
} from './render-helpers'
import { renderText } from './text'
import { isoWeekString } from './utm'

/** Inputs accepted by {@link renderDigest}. */
export type DigestRenderInput = {
  readonly subscriber: Subscriber
  readonly articles: ReadonlyArray<Article>
  readonly magazines?: MagazineSelection
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
  const chrome = chromeFor(input.subscriber.messageLang)
  const campaign = isoWeekString(input.tickAt)
  const groups = groupByLang(input.subscriber.langs, input.articles, campaign)
  const selection = input.magazines ?? EMPTY_MAGAZINES
  const papers = stampMagazines(selection, campaign)
  return {
    subject: subjectFor(
      chrome,
      input.articles.length,
      selection.announcements
    ),
    html: renderHtml(chrome, groups, papers, input.unsubscribeUrl),
    text: renderText(chrome, groups, papers, input.unsubscribeUrl),
    listUnsubscribe: `<${input.unsubscribeUrl}>`,
    listUnsubscribePost: POST_HEADER,
  }
}
