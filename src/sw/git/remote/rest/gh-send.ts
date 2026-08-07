import { API, ghHeaders } from '../../../rbac/github-api'
import { fail } from './fail'

/**
 * Base64-encode bytes in chunks so large binary assets (images, PDFs)
 * never overflow the argument stack of a single `String.fromCharCode`.
 * @param bytes - Raw file bytes
 * @returns Base64 string
 */
export const toBase64 = (bytes: Uint8Array): string => {
  const CHUNK = 0x8000
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += CHUNK)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK))
  return btoa(binary)
}

const bodyHeaders = (token: string): HeadersInit => ({
  ...ghHeaders(token),
  'content-type': 'application/json',
})

const onError = async (
  res: Response,
  method: string,
  path: string
): Promise<never> =>
  fail(
    `github ${res.status} ${method} ${path}: ${(await res.text().catch(() => '')).slice(0, 300)}`
  )

/**
 * One GitHub REST call. Throws on non-2xx with the status and a slice of
 * the body so `classifyPushError` can route the failure — a 422 "not a
 * fast forward" becomes an NFF recovery, 401/403 an auth prompt.
 * @param method - HTTP method
 * @param path - Path under api.github.com
 * @param token - OAuth bearer
 * @param body - JSON body for writes; omit for GET
 * @returns Parsed JSON response body
 */
export const ghSend = async (
  method: string,
  path: string,
  token: string,
  body?: unknown
): Promise<unknown> => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body === undefined ? ghHeaders(token) : bodyHeaders(token),
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return res.ok ? res.json() : onError(res, method, path)
}
