/**
 * Per-session capability nonce the Service Worker issues at init (confused-
 * deputy guard). Held in module memory only — never in localStorage/IndexedDB —
 * so a casually injected same-origin script cannot read it and borrow the
 * ambient token. Attached to every `/api/github/*` request as `X-SW-Nonce`.
 */
let nonce: string | undefined

/**
 * Records the nonce returned by an init reply, or clears it on logout.
 * @param value - The capability nonce, or undefined to clear it
 */
export const setSwNonce = (value: string | undefined): void => {
  nonce = value
}

/**
 * The current nonce, or undefined before the first successful init.
 * @returns The capability nonce, or undefined
 */
export const getSwNonce = (): string | undefined => nonce
