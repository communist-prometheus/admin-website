import { mintSession } from '@/composables/useAuth/mint-session'
import { loadToken } from '@/composables/useAuth/token-storage'
import { getCommsBase } from '@/config/comms'

/**
 * Build an absolute URL pointing at the comms-worker.
 * @param path Path beginning with `/`.
 * @returns Fully-qualified URL.
 */
export const commsUrl = (path: string): string => `${getCommsBase()}${path}`

/**
 * Standard JSON content-type headers used by every comms POST/PATCH.
 * @returns Headers object with `Content-Type: application/json`.
 */
export const jsonHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
})

const send = (url: string, init: RequestInit): Promise<Response> =>
  fetch(url, { ...init, credentials: 'include' })

const retryWithMint = async (
  url: string,
  init: RequestInit,
  token: string,
  first: Response
): Promise<Response> => {
  const minted = await mintSession(token)
  return minted === undefined ? first : await send(url, init)
}

const maybeRetry = async (
  url: string,
  init: RequestInit,
  first: Response
): Promise<Response> => {
  const token = loadToken()
  return token === undefined
    ? first
    : await retryWithMint(url, init, token, first)
}

/**
 * Fetch helper for `comms-worker` calls. Sends credentials with
 * every request and, on a single 401, re-mints the SSO session
 * (cookie may be missing or 24h-expired) and retries once. Any
 * other status — including a second 401 — is returned to the
 * caller as-is.
 * @param path Path on `lists.comprom.org` (beginning with `/`).
 * @param init Standard fetch init; `credentials` is forced to include.
 * @returns Final response, possibly after a single retry.
 */
export const commsFetch = async (
  path: string,
  init: RequestInit = {}
): Promise<Response> => {
  const url = commsUrl(path)
  const first = await send(url, init)
  return first.status === 401 ? await maybeRetry(url, init, first) : first
}

/**
 * Pass-through that throws when the response status is non-2xx.
 * @param res The fetch response.
 * @param step Human-readable label included in the error message.
 * @returns The same response when ok.
 */
export const ensureOk = (res: Response, step: string): Response =>
  res.ok
    ? res
    : (() => {
        throw new Error(`${step} failed: ${res.status}`)
      })()
