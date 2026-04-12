import { loadToken } from '@/composables/useAuth/token-storage'

const GH = 'https://api.github.com'

/**
 * Authenticated GitHub API fetch using OAuth token.
 * @param path - API path (e.g. /repos/owner/repo/...)
 * @returns Parsed JSON or undefined on failure
 */
export const ghFetch = async <T>(path: string): Promise<T | undefined> => {
  const token = loadToken()
  if (!token) return undefined
  const r = await fetch(`${GH}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  return r.ok ? r.json() : undefined
}
