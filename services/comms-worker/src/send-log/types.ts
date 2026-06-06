/** Lifecycle statuses recorded against each per-tick dispatch attempt. */
export type SendLogStatus =
  | 'sent'
  | 'failed'
  | 'bounced'
  | 'complained'
  | 'skipped'

/** Domain representation of a `send_log` row. */
export type SendLog = {
  readonly id: number
  readonly subscriberId: number | undefined
  readonly tickAt: string
  readonly articleCount: number
  readonly status: SendLogStatus
  readonly resendId: string | undefined
  readonly error: string | undefined
}

/** Inputs accepted by the `append` repo call. */
export type NewSendLog = Omit<SendLog, 'id'>
