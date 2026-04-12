interface BasicCredentials {
  readonly user: string
  readonly pass: string
}

/**
 * Parse a `Basic <base64>` Authorization header into `{user, pass}`.
 * @param header - Raw Authorization header value or undefined
 * @returns Parsed credentials or undefined if absent/malformed
 */
export const parseBasicAuth = (
  header: string | undefined
): BasicCredentials | undefined => {
  if (!header) return undefined
  const match = header.match(/^Basic\s+(.+)$/)
  if (!match || !match[1]) return undefined
  try {
    const decoded = atob(match[1])
    const idx = decoded.indexOf(':')
    if (idx < 0) return undefined
    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) }
  } catch {
    return undefined
  }
}

/**
 * Constant-time string comparison — avoids leaking length or early-exit
 * information that would help an attacker guess a password character by
 * character.
 * @param expected - Expected secret
 * @param actual - Value supplied by the caller
 * @returns True when the two strings are byte-identical
 */
export const timingSafeEqual = (
  expected: string,
  actual: string
): boolean => {
  const a = new TextEncoder().encode(expected)
  const b = new TextEncoder().encode(actual)
  let diff = a.length ^ b.length
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  }
  return diff === 0
}
