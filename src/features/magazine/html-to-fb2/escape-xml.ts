/**
 * Escape XML-unsafe characters in a text node value before
 * embedding into FB2 markup.
 *
 * @param s Raw string from a DOM text node or attribute.
 * @returns String safe to embed verbatim into XML.
 */
export const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
