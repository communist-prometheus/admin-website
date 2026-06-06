import { constantTimeEqual } from './hmac-bytes'

const WHSEC_PREFIX = 'whsec_'

/** Decode a `whsec_*` shared secret into raw bytes. */
export const decodeWebhookSecret = (
  secret: string
): Uint8Array | undefined => {
  if (!secret.startsWith(WHSEC_PREFIX)) return undefined
  try {
    const bin = globalThis.atob(secret.slice(WHSEC_PREFIX.length))
    return Uint8Array.from(bin, c => c.charCodeAt(0))
  } catch {
    return undefined
  }
}

/** Pluck every `v1,*` signature from the (possibly multi-value) header. */
export const extractV1Signatures = (header: string): ReadonlyArray<string> =>
  header
    .split(/\s+/)
    .filter(s => s.startsWith('v1,'))
    .map(s => s.slice(3))

/** Constant-time membership test for a candidate signature. */
export const anyMatches = (
  expected: string,
  presented: ReadonlyArray<string>
): boolean => presented.some(s => constantTimeEqual(expected, s))

/** Window-aware timestamp check used by both verify + auditing helpers. */
export const timestampWithin = (
  tsSecRaw: string,
  nowMs: number,
  windowMs: number
): boolean => {
  const tsSec = Number(tsSecRaw)
  if (!Number.isFinite(tsSec)) return false
  return Math.abs(nowMs - tsSec * 1000) <= windowMs
}
