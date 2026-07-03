/*
 * Human-readable extraction of GitHub's error envelope. The REST body is
 * `{"message": "...", "errors": [{"resource": ..., "code": ..., "message":
 * ...}]}`. Fall through to the raw text on parse failure so we never lose
 * the diagnostic when GitHub returns something unexpected.
 */

interface GhError {
  readonly message?: string
  readonly errors?: readonly { readonly message?: string }[]
}

/**
 * Pull a human-readable message out of GitHub's error body.
 *
 * @param raw Raw response text from the GitHub REST API.
 * @returns Human message when parseable, otherwise the raw text.
 */
export const readGhError = (raw: string): string => {
  try {
    const body = JSON.parse(raw) as GhError
    const primary = body.message
    const detail = body.errors?.[0]?.message
    return detail && primary ? `${primary}: ${detail}` : (primary ?? raw)
  } catch {
    return raw
  }
}
