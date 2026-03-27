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
