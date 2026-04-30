import { activeContext } from '../tracing/active-context'

/** GitHub REST API base URL. */
export const API = 'https://api.github.com'

const traceparentHeader = (): Record<string, string> => {
  const ctx = activeContext()
  return ctx === undefined
    ? {}
    : { traceparent: `00-${ctx.traceId}-${ctx.spanId}-01` }
}

/**
 * Standard headers for a GitHub API call with the admin's bearer.
 * Adds a W3C `traceparent` when the SW dispatcher has an active
 * context so server logs can stitch back to the client trace.
 *
 * @param token OAuth bearer token
 * @returns request headers
 */
export const ghHeaders = (token: string): Record<string, string> => ({
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
  ...traceparentHeader(),
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
