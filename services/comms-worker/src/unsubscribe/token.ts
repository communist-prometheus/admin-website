import { constantTimeEqual, hmacSignBase64url } from './hmac'

const POSITIVE_INT_RE = /^[1-9]\d*$/

/**
 * Sign an unsubscribe token of the form `<id>.<base64url-sig>` for the
 * given subscriber id under the worker's `UNSUBSCRIBE_SECRET`.
 * @param id Subscriber row id.
 * @param secret Shared secret used by both sign and verify.
 * @returns Token string suitable for inclusion as a query parameter.
 */
export const signUnsubscribeToken = async (
  id: number,
  secret: string
): Promise<string> => {
  const sig = await hmacSignBase64url(secret, String(id))
  return `${id}.${sig}`
}

/**
 * Verify an unsubscribe token. Returns `{id}` when the embedded id matches
 * a freshly-recomputed signature under the supplied secret; `undefined`
 * otherwise. Constant-time signature comparison.
 * @param token Raw token from the URL `t` parameter.
 * @param secret Shared secret used to recompute the signature.
 * @returns `{id}` on success, `undefined` on any failure.
 */
export const verifyUnsubscribeToken = async (
  token: string,
  secret: string
): Promise<{ readonly id: number } | undefined> => {
  const parts = token.split('.')
  if (parts.length !== 2) return undefined
  const [rawId, sig] = parts
  if (rawId === undefined || sig === undefined) return undefined
  if (!POSITIVE_INT_RE.test(rawId)) return undefined
  const expected = await hmacSignBase64url(secret, rawId)
  return constantTimeEqual(expected, sig) ? { id: Number(rawId) } : undefined
}
