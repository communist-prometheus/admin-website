import { convertDocxToHtml } from '@/components/MarkdownEditor/ImportDocs/convert-docx'
import { htmlToFb2 } from '@/features/newspaper/html-to-fb2/html-to-fb2'

/** Issue metadata baked into the FB2 description block. */
export interface IssueMeta {
  readonly slug: string
  readonly issueTitle?: string
  readonly issueLang?: string
  readonly issueDescription?: string
}

const buildFb2Meta = (meta: IssueMeta) => ({
  title: meta.issueTitle ?? 'Newspaper issue',
  ...(meta.issueLang === undefined ? {} : { lang: meta.issueLang }),
  ...(meta.issueDescription === undefined
    ? {}
    : { description: meta.issueDescription }),
})

/**
 * Convert a `.docx` File client-side to an `.fb2` File. The docx
 * itself is never persisted — we only emit the converted FB2.
 *
 * @param file Original `.docx` File from the upload widget.
 * @param meta Issue metadata + slug used as the output filename.
 * @returns A `<slug>.fb2` File ready to feed the asset pipeline.
 */
export const docxFileToFb2 = async (
  file: File,
  meta: IssueMeta
): Promise<File> => {
  const buffer = await file.arrayBuffer()
  const html = await convertDocxToHtml(buffer)
  const fb2 = htmlToFb2(html, buildFb2Meta(meta))
  const blob = new Blob([fb2], { type: 'application/x-fictionbook+xml' })
  return new File([blob], `${meta.slug}.fb2`, { type: blob.type })
}
