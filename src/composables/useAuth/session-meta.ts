/**
 * Sidecar fields persisted beside the access token.
 *
 * Accepted tradeoff: the ~6-month refresh token lives in localStorage (an
 * XSS payload gains long persistence). This is inherent to an SPA that
 * drives client-side git with the GitHub token — there is no HttpOnly
 * option for a token isomorphic-git must read — so it is documented rather
 * than avoided.
 */
export interface SessionMeta {
  readonly refreshToken?: string
  readonly expiresAt?: number
  readonly refreshTokenExpiresAt?: number
}

const META_KEY = 'gh_session_meta'

const isMeta = (value: unknown): value is SessionMeta =>
  typeof value === 'object' && value !== null

const parseMeta = (raw: string): SessionMeta => {
  try {
    const value: unknown = JSON.parse(raw)
    return isMeta(value) ? value : {}
  } catch {
    return {}
  }
}

/**
 * Read the sidecar meta, tolerating absent or corrupt JSON.
 * @returns The stored meta, or an empty object
 */
export const loadMeta = (): SessionMeta => {
  const raw = localStorage.getItem(META_KEY)
  return raw ? parseMeta(raw) : {}
}

/**
 * Persist the sidecar meta.
 * @param meta - Refresh material and expiry deadlines
 */
export const saveMeta = (meta: SessionMeta): void => {
  localStorage.setItem(META_KEY, JSON.stringify(meta))
}

/** Remove the sidecar meta. */
export const clearMeta = (): void => {
  localStorage.removeItem(META_KEY)
}
