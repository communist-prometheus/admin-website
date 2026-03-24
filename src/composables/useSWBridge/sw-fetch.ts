import type { SWFetchResponse } from '@/sw/protocol'
import { normalizeHeaders } from '@/validation/normalize-headers'
import { serializeBody } from '@/validation/serialize-body'
import { getActiveWorker } from './get-active-worker'
import { postWithTimeout } from './post-with-timeout'
import { swReady } from './sw-ready'

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
    headers: normalizeHeaders(init?.headers),
    body: serializeBody(init?.body),
  })
  return new Response(d.body, {
    status: d.status,
    headers: d.headers,
  })
}

/**
 * Fetch through the Service Worker.
 * Uses native fetch when controller is set (fast path).
 * Falls back to MessageChannel for browsers without controller.
 * @param input - URL string or URL object
 * @param init - Optional fetch init options
 * @returns Response from the Service Worker
 */
export const swFetch = async (
  input: string | URL,
  init?: RequestInit
): Promise<Response> => {
  await swReady
  if (navigator.serviceWorker.controller) return fetch(input, init)
  return viaMessage(String(input), init)
}
