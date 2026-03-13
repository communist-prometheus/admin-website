import type { MarkedExtension } from 'marked'

/**
 * Create a marked extension that resolves ./assets/ image URLs
 * to blob URLs from the provided map.
 * @param urlMap - Map of relative paths to blob URLs
 * @returns Marked extension with custom image renderer
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
  },
})
