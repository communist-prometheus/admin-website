import { getSwNonce } from './sw-nonce'

/**
 * Adds the `X-SW-Nonce` capability header to a plain header map (the
 * MessageChannel transport), if a nonce is known.
 * @param headers - Header map to extend
 * @returns Header map including the nonce when present
 */
export const withNonceHeaders = (
  headers: Record<string, string>
): Record<string, string> => {
  const nonce = getSwNonce()
  return nonce === undefined ? headers : { ...headers, 'X-SW-Nonce': nonce }
}

/**
 * Copies a fetch init and sets the `X-SW-Nonce` header on the copy.
 * @param init - Fetch init to extend
 * @param nonce - The capability nonce to attach
 * @returns A new fetch init carrying the nonce header
 */
const withHeader = (
  init: RequestInit | undefined,
  nonce: string
): RequestInit => {
  const headers = new Headers(init?.headers)
  headers.set('X-SW-Nonce', nonce)
  return { ...init, headers }
}

/**
 * Adds the `X-SW-Nonce` capability header to a fetch init (the native path)
 * without mutating the input, when a nonce is known.
 * @param init - Fetch init to extend
 * @returns Fetch init including the nonce header when present
 */
export const withNonce = (init?: RequestInit): RequestInit | undefined => {
  const nonce = getSwNonce()
  return nonce === undefined ? init : withHeader(init, nonce)
}
