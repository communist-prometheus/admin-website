const HEX_RADIX = 16
const BYTE_HEX_WIDTH = 2
/** 128 bits of the digest — ample against collision, short in a header. */
const FINGERPRINT_BYTES = 16

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, b =>
    b.toString(HEX_RADIX).padStart(BYTE_HEX_WIDTH, '0')
  ).join('')

const fingerprint = async (body: string): Promise<string> => {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(body)
  )
  return toHex(new Uint8Array(digest).slice(0, FINGERPRINT_BYTES))
}

/**
 * Bind an idempotency key to the exact payload it travels with.
 *
 * Resend keeps one key namespace per account and refuses a key it has
 * already seen with a different body (`409 invalid_idempotent_request`).
 * A key built only from where the request sits in a dispatch — tick,
 * chunk, subscriber id — is therefore not ours alone: the production and
 * the develop workers share the account and the cron, derived the same
 * key on the same tick, and whichever came second had its mail refused
 * (2026-09-12, 2026-10-03). With the payload's fingerprint in the key,
 * the same key can only ever name the same request, so a retry still
 * replays and nothing else can collide with it.
 * @param scope Caller's key: what the request is, within one dispatch.
 * @param body The serialised request body the key will be sent with.
 * @returns The `Idempotency-Key` header value.
 */
export const payloadBoundKey = async (
  scope: string,
  body: string
): Promise<string> => `${scope}:${await fingerprint(body)}`
