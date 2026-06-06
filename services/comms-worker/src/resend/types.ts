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

/** Thin send-only client facade. */
export type ResendClient = {
  readonly send: (input: SendInput) => Promise<SendResult>
}
