import type { IssuesByLang } from '../newspaper/fetch'
import type { ResendClient } from '../resend/types'
import type { SendLogRepo } from '../send-log/repo'
import type { SubscriberRepo } from '../subscribers/repo'
import type { ArticlesByLang } from './fetch-articles'

/** Static inputs shared across every subscriber in a single tick. */
export type DispatchContext = {
  readonly subscriberRepo: SubscriberRepo
  readonly sendLogRepo: SendLogRepo
  readonly resend: ResendClient
  readonly secret: string
  readonly fromAddress: string
  readonly publicBaseUrl: string
  readonly tickAt: Date
  readonly byLang: ArticlesByLang
  readonly newspapersByLang: IssuesByLang
  readonly cutoffMs: number | undefined
}
