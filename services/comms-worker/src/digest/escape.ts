const ESCAPE_MAP: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * Escape HTML-special characters so a string is safe to interpolate
 * into element text or an attribute value.
 * @param raw Unescaped string.
 * @returns Escaped string.
 */
export const htmlEscape = (raw: string): string =>
  raw.replace(/[&<>"']/g, c => ESCAPE_MAP[c] ?? c)
