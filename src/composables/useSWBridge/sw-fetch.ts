import type { SWFetchResponse } from '@/sw/protocol'
import { sendSWMessage } from './send-message'
import { swReady } from './sw-ready'

/**
 * Check if the Service Worker is the active controller
 * (can intercept fetch events).
 * @returns True if SW controls this page
 */
const hasSWController = (): boolean => !!navigator.serviceWorker?.controller

/**
 * Fetch via MessageChannel proxy when SW can't intercept.
 * @param url - Absolute URL string
 * @param init - Optional fetch init
 * @returns Reconstructed Response
 */
const fetchViaMessage = async (
  url: string,
  init?: RequestInit
): Promise<Response> => {
  const headers = init?.headers
    ? Object.fromEntries(new Headers(init.headers))
    : undefined
  const body =
    init?.body !== undefined && init?.body !== null
      ? String(init.body)
      : undefined

  const result = await sendSWMessage<SWFetchResponse>({
    type: 'SW_FETCH',
    url,
    method: init?.method ?? 'GET',
    headers,
    body,
  })

  return new Response(result.body, {
    status: result.status,
    headers: result.headers,
  })
}

/**
 * Fetch wrapper that routes through the Service Worker.
 * Waits for SW initialization before any request.
 * Uses native fetch when SW controls the page (intercepts fetches).
 * Falls back to MessageChannel proxy otherwise (Firefox/WebKit).
 * @param input - URL string or URL object
 * @param init - Optional fetch init options
 * @returns Response from the Service Worker
 */
export const swFetch = async (
  input: string | URL,
  init?: RequestInit
): Promise<Response> => {
  await swReady

  if (hasSWController()) return fetch(input, init)

  const url =
    typeof input === 'string'
      ? new URL(input, globalThis.location.origin).href
      : input.href

  return fetchViaMessage(url, init)
}
