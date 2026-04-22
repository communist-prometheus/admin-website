const escapeRe = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Replace each `data:...` src with the local `./assets/<filename>`
 * path so the subsequent HTML→Markdown conversion produces the right
 * Markdown image reference.
 *
 * @param html original HTML string
 * @param images extracted images with their source data URIs
 * @returns HTML with data URIs replaced by local asset paths
 */
export const rewriteImages = (
  html: string,
  images: readonly { readonly dataUri: string; readonly filename: string }[]
): string =>
  images.reduce(
    (acc, img) =>
      acc.replace(
        new RegExp(escapeRe(img.dataUri), 'g'),
        `./assets/${img.filename}`
      ),
    html
  )
