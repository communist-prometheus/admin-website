import type { MarkedExtension } from 'marked'

/**
 * Replace src attributes pointing to ./assets/ with blob URLs.
 * @param html - Raw HTML string
 * @param urlMap - Map of relative paths to blob URLs
 * @returns HTML with resolved asset URLs
 */
export const resolveHtmlSrc = (
  html: string,
  urlMap: ReadonlyMap<string, string>
): string =>
  html.replace(/src="(\.\/assets\/[^"]+)"/g, (_, path: string) => {
    const resolved = urlMap.get(path)
    return `src="${resolved ?? path}"`
  })

/**
 * Create a marked extension that resolves ./assets/ URLs
 * to blob URLs in images and raw HTML (video, audio, source).
 * @param urlMap - Map of relative paths to blob URLs
 * @returns Marked extension with custom renderers
 */
export const createAssetExtension = (
  urlMap: ReadonlyMap<string, string>
): MarkedExtension => ({
  renderer: {
    image({ href, text }) {
      const resolved = urlMap.get(href)
      const src = resolved ?? href
      const alt = text.replace(/"/g, '&quot;')
      return `<img src="${src}" alt="${alt}">`
    },
    html({ text }) {
      return resolveHtmlSrc(text, urlMap)
    },
  },
})
