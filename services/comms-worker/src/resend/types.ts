import type { QuotaKind } from './response'

/** Resend transactional email payload, as sent by the worker. */
export type SendInput = {
  readonly from: string
  readonly to: string
  readonly subject: string
  readonly html: string
  readonly text: string
  readonly headers?: Readonly<Record<string, string>>
  readonly idempotencyKey?: string
}

/** Discriminated outcome returned by {@link ResendClient.send}. */
export type SendResult =
  | { readonly ok: true; readonly id: string }
  | { readonly ok: false; readonly error: string }

/**
 * Outcome of one {@link ResendClient.sendBatch} call. The Resend batch
 * endpoint is all-or-nothing per request: on success every email was
 * accepted (ids in input order); on failure none went out.
 *
 * `definitive` says whether Resend actually rejected the request (a
 * terminal 4xx — nothing was sent, and one bad payload can poison the
 * whole batch) as opposed to the attempts running out on a transient
 * error, where the batch may or may not have landed. Only a definitive
 * rejection is safe to retry one email at a time; re-sending after an
 * exhausted transient failure risks duplicates.
 */
export type BatchResult =
  | { readonly ok: true; readonly ids: ReadonlyArray<string> }
  | {
      readonly ok: false
      readonly error: string
      readonly definitive: boolean
      /**
       * Set when the batch was rejected by an account-wide sending
       * quota (`daily_quota_exceeded` / `monthly_quota_exceeded`). The
       * dispatcher pauses until that quota resets rather than replaying
       * the un-sent recipients every tick.
       */
      readonly quota?: QuotaKind
    }

/** Thin send client facade — single + batched transactional email. */
export type ResendClient = {
  readonly send: (input: SendInput) => Promise<SendResult>
  /**
   * Send up to 100 emails in one Resend `/emails/batch` call (one HTTP
   * request → no per-email rate-limit burst). `idempotencyKey` makes a
   * retried batch a no-op when the first attempt was accepted but its
   * response was lost.
   */
  readonly sendBatch: (
    inputs: ReadonlyArray<SendInput>,
    idempotencyKey?: string
  ) => Promise<BatchResult>
}
