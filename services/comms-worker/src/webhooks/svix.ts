import { hmacSignBase64Bytes } from './hmac-bytes'
import {
  anyMatches,
  decodeWebhookSecret,
  extractV1Signatures,
  timestampWithin,
} from './svix-helpers'

/** Svix freshness window: rejects timestamps older / newer than 5 min. */
export const WEBHOOK_WINDOW_MS = 5 * 60 * 1000

/**
 * Build the standard `svix-signature` header value (`v1,<base64-sig>`)
 * for `(secret, id, timestamp, body)` — exposed so the route's unit
 * tests can produce a signature without rolling their own crypto.
 * @param secret `whsec_*` shared secret.
 * @param id Value of the `svix-id` header.
 * @param timestamp Value of the `svix-timestamp` header (Unix seconds).
 * @param body Raw request body (the exact bytes the server received).
 * @returns Ready-to-send header value.
 */
export const signWebhookHeader = async (
  secret: string,
  id: string,
  timestamp: string,
  body: string
): Promise<string> => {
  const bytes = decodeWebhookSecret(secret)
  if (bytes === undefined) return 'v1,'
  const sig = await hmacSignBase64Bytes(bytes, `${id}.${timestamp}.${body}`)
  return `v1,${sig}`
}

/** Inputs accepted by {@link verifyWebhookSignature}. */
export type VerifyInput = {
  readonly secret: string
  readonly id: string
  readonly timestamp: string
  readonly body: string
  readonly signatureHeader: string
  readonly nowMs: number
}

/**
 * Verify a `svix-signature` header against the body + headers as Svix
 * specifies: HMAC-SHA256 of `${id}.${timestamp}.${body}`, base64, then
 * constant-time compared against every `v1,*` entry in the header.
 * @param input Signature inputs (see {@link VerifyInput}).
 * @returns `true` only when at least one valid signature is present
 *   AND the timestamp is within {@link WEBHOOK_WINDOW_MS}.
 */
export const verifyWebhookSignature = async (
  input: VerifyInput
): Promise<boolean> => {
  const bytes = decodeWebhookSecret(input.secret)
  if (bytes === undefined) return false
  if (!timestampWithin(input.timestamp, input.nowMs, WEBHOOK_WINDOW_MS)) {
    return false
  }
  const presented = extractV1Signatures(input.signatureHeader)
  if (presented.length === 0) return false
  const expected = await hmacSignBase64Bytes(
    bytes,
    `${input.id}.${input.timestamp}.${input.body}`
  )
  return anyMatches(expected, presented)
}
