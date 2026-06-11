/**
 * Read a named cookie value from document.cookie.
 * @param name - Cookie name to look up
 * @returns Cookie value or undefined if not found
 */
export const readCookie = (name: string): string | undefined =>
  document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=') || undefined

/**
 * Expire a named cookie on the current host and the parent domain.
 * A JS-readable credential cookie must not outlive its one-time
 * migration into localStorage — it is an XSS-exfiltration target.
 * @param name - Cookie name to delete
 */
export const deleteCookie = (name: string): void => {
  const stale = `${name}=; max-age=0; path=/`
  const host = globalThis.location?.hostname ?? ''
  const parent = host.split('.').slice(-2).join('.')
  const variants =
    parent && parent !== host ? [stale, `${stale}; domain=.${parent}`] : [stale]
  for (const v of variants) document.cookie = v
}
