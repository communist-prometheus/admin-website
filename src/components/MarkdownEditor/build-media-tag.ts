/**
 * Build a markdown/HTML tag for inserting a media asset. For images
 * the caller MUST supply an alt text; without one the public site
 * would ship empty alt attributes. Non-image media keep using the
 * filename as a fallback label.
 *
 * @param name - Asset filename
 * @param mime - MIME type string
 * @param alt - Author-supplied alt text (images only)
 * @returns Markdown image or HTML media tag
 */
export const buildMediaTag = (
  name: string,
  mime: string,
  alt?: string
): string => {
  const src = `./assets/${name}`
  if (mime.startsWith('image/')) return `![${alt ?? name}](${src})`
  if (mime.startsWith('video/'))
    return `<video controls><source src="${src}" type="${mime}" /></video>`
  if (mime.startsWith('audio/'))
    return `<audio controls><source src="${src}" type="${mime}" /></audio>`
  return `[${name}](${src})`
}
