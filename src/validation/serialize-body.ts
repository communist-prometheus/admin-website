/**
 * Serialize a BodyInit to string for SW message transport.
 * Only string bodies are supported in the SW MessageChannel.
 * @param body - Fetch BodyInit value
 * @returns String body or undefined
 */
export const serializeBody = (body?: BodyInit | null): string | undefined => {
  if (body === undefined || body === null) return undefined
  if (typeof body === 'string') return body
  if (body instanceof URLSearchParams) return body.toString()
  return undefined
}
