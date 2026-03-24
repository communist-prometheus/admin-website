/**
 * Normalize HeadersInit to Record<string, string>.
 * Handles Headers, string[][], and plain objects.
 * @param headers - Fetch HeadersInit value
 * @returns Flat headers record
 */
export const normalizeHeaders = (
  headers?: HeadersInit
): Record<string, string> => {
  if (!headers) return {}
  if (headers instanceof Headers) {
    const record: Record<string, string> = {}
    headers.forEach((v, k) => {
      record[k] = v
    })
    return record
  }
  if (Array.isArray(headers)) {
    const record: Record<string, string> = {}
    for (const [k, v] of headers) {
      record[k] = v
    }
    return record
  }
  return headers
}
