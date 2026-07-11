import type { MagazineFetcher } from '../magazine/fetch'
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
  readonly magazine: MagazineFetcher
  readonly resend: ResendClient
  readonly secret: string
  readonly fromAddress: string
  readonly publicBaseUrl: string
  readonly tickAt: Date
  readonly retentionDays?: number
  /**
   * When set, dispatch only these subscriber ids (a targeted test
   * send) and DO NOT advance the global cutoff — otherwise a test to
   * a subset would move the watermark for everyone. Unset on the
   * scheduled path: full active list, cutoff advances as usual.
   */
  readonly targetIds?: ReadonlyArray<number>
}

/** Per-tick summary returned by {@link runDispatch}. */
export type DispatchSummary = {
  readonly sent: number
  readonly failed: number
  readonly skipped: number
  readonly durationMs: number
}
