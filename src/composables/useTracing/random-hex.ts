/**
 * Generate a lower-case hex string of the requested byte length
 * using `crypto.getRandomValues`. Throws when crypto is missing —
 * intentionally fail loud rather than silently emit predictable
 * trace ids that would mask outages later.
 * @param bytes Number of random bytes to encode.
 * @returns Hex string of length `bytes * 2`.
 */
export const randomHex = (bytes: number): string => {
  const buf = new Uint8Array(bytes)
  globalThis.crypto.getRandomValues(buf)
  return Array.from(buf, b => b.toString(16).padStart(2, '0')).join('')
}
