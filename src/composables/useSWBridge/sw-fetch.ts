import type { SWFetchResponse } from '@/sw/protocol'
import { normalizeHeaders } from '@/validation/normalize-headers'
import { serializeBody } from '@/validation/serialize-body'
import { fetchWithReinit } from './fetch-with-reinit'
import { getActiveWorker } from './get-active-worker'
import { postWithTimeout } from './post-with-timeout'
import { getSwNonce } from './sw-nonce'
import { swReady } from './sw-ready'

/** Adds the `X-SW-Nonce` header to a header map, if a nonce is known. */
const withNonceHeaders = (
  headers: Record<string, string>
): Record<string, string> => {
  const nonce = getSwNonce()
  return nonce === undefined ? headers : { ...headers, 'X-SW-Nonce': nonce }
}

/** Adds the `X-SW-Nonce` header to a fetch init, without mutating the input. */
const withNonce = (init?: RequestInit): RequestInit | undefined => {
  const nonce = getSwNonce()
  if (nonce === undefined) return init
  const headers = new Headers(init?.headers)
  headers.set('X-SW-Nonce', nonce)
  return { ...init, headers }
}

/**
 * Fetch via MessageChannel (bypasses fetch event).
 * @param url - URL string
 * @param init - Fetch init options
 * @returns Reconstructed Response
 */
const viaMessage = async (
  url: string,
  init?: RequestInit
): Promise<Response> => {
  const w = await getActiveWorker()
  const d = await postWithTimeout<SWFetchResponse>(w, {
    type: 'SW_FETCH',
    url,
    method: init?.method,
    headers: withNonceHeaders(normalizeHeaders(init?.headers)),
    body: serializeBody(init?.body),
  })
  return new Response(d.body, {
    status: d.status,
    headers: d.headers,
  })
}

/**
 * Pick the fast (native fetch) or MessageChannel transport for one
 * Service Worker request.
 * @param input - URL string or URL object
 * @param init - Optional fetch init options
 * @returns Response from the Service Worker
 */
const transport = (
  input: string | URL,
  init?: RequestInit
): Promise<Response> =>
  navigator.serviceWorker.controller
    ? fetch(input, withNonce(init))
    : viaMessage(String(input), init)

/**
 * Fetch through the Service Worker.
 * Uses native fetch when controller is set (fast path), falling back
 * to MessageChannel otherwise. A "SW not ready" 503 triggers a single
 * re-init from the stored token and retry, so saves survive worker
 * eviction.
 * @param input - URL string or URL object
 * @param init - Optional fetch init options
 * @returns Response from the Service Worker
 */
export const swFetch = async (
  input: string | URL,
  init?: RequestInit
): Promise<Response> => {
  await swReady
  return fetchWithReinit(transport, input, init)
}
