import type { ResendClient } from '../resend/types'
import type { RssFetcher } from '../rss/fetch'
import type { SendLogRepo } from '../send-log/repo'
import type { SettingsRepo } from '../settings/repo'
import type { SubscriberRepo } from '../subscribers/repo'

/** Injected dependencies for {@link runDispatch}. */
export type RunDispatchDeps = {
  readonly subscriberRepo: SubscriberRepo
  readonly sendLogRepo: SendLogRepo
  readonly settingsRepo: SettingsRepo
  readonly rss: RssFetcher
  readonly resend: ResendClient
  readonly secret: string
  readonly fromAddress: string
  readonly publicBaseUrl: string
  readonly tickAt: Date
  readonly retentionDays?: number
}

/** Per-tick summary returned by {@link runDispatch}. */
export type DispatchSummary = {
  readonly sent: number
  readonly failed: number
  readonly skipped: number
  readonly durationMs: number
}
