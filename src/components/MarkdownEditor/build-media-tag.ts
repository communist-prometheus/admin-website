/**
 * Build a markdown/HTML tag for inserting a media asset.
 * @param name - Asset filename
 * @param mime - MIME type string
 * @returns Markdown image or HTML media tag
 */
export const buildMediaTag = (name: string, mime: string): string => {
  const src = `./assets/${name}`
  if (mime.startsWith('image/')) return `![${name}](${src})`
  if (mime.startsWith('video/'))
    return `<video controls><source src="${src}" type="${mime}" /></video>`
  if (mime.startsWith('audio/'))
    return `<audio controls><source src="${src}" type="${mime}" /></audio>`
  return `[${name}](${src})`
}
