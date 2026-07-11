import { escapeXml } from './escape-xml'
import { renderSections } from './render-sections'
import { splitIntoSections } from './split-sections'

/** Required + optional metadata baked into the FB2 description block. */
export interface FB2Meta {
  readonly title: string
  readonly author?: string
  readonly lang?: string
  readonly description?: string
}

const parseFragment = (html: string): Element => {
  const doc = new DOMParser().parseFromString(
    `<div>${html}</div>`,
    'text/html'
  )
  return doc.querySelector('div') ?? doc.body
}

const titleInfo = (meta: FB2Meta): string => {
  const lang = meta.lang ?? 'ru'
  const author = meta.author ?? 'Communist Prometheus'
  const description = meta.description ?? ''
  const annotation = description
    ? `<annotation><p>${escapeXml(description)}</p></annotation>`
    : ''
  return `      <book-title>${escapeXml(meta.title)}</book-title>
      <author><nickname>${escapeXml(author)}</nickname></author>
      <lang>${escapeXml(lang)}</lang>
      ${annotation}`
}

/**
 * Convert mammoth HTML output to a complete FB2 XML document.
 * Browser-side: uses native DOMParser so the bundle stays small.
 *
 * @param html Mammoth HTML.
 * @param meta Required title plus optional author/lang/description.
 * @returns FB2 XML document (UTF-8 declared).
 */
export const htmlToFb2 = (html: string, meta: FB2Meta): string => {
  const sections = splitIntoSections(parseFragment(html))
  const body = renderSections(sections, meta.title)
  return `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
  <description>
    <title-info>
${titleInfo(meta)}
    </title-info>
  </description>
  <body>
${body}
  </body>
</FictionBook>
`
}
