/** GitHub REST API base URL. */
export const API = 'https://api.github.com'

/**
 * Standard headers for a GitHub API call with the admin's bearer.
 *
 * @param token OAuth bearer token
 * @returns request headers
 */
export const ghHeaders = (token: string): HeadersInit => ({
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
})

/**
 * Fetch a JSON GitHub endpoint; throws on non-2xx so callers can
 * `.catch()` and provide fallback values.
 *
 * @param url absolute URL
 * @param token OAuth bearer
 * @returns parsed JSON body
 */
export const ghJson = async <T>(url: string, token: string): Promise<T> => {
  const res = await fetch(url, { headers: ghHeaders(token) })
  return res.ok
    ? ((await res.json()) as T)
    : Promise.reject(new Error(`github ${res.status} ${url}`))
}
