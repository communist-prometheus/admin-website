/*
 * FB2 carries two metadata blocks: <title-info> (the book — author,
 * title, language; editor-controlled and user-facing) and
 * <document-info> (the *file* — who/what produced it). Ebook
 * converters such as Calibre auto-fill <document-info><author> with the
 * uploader's OS / library account name, and the FB2 is served verbatim
 * from the public site — so that name leaks. This replaces
 * <document-info> with a neutral block and removes any <custom-info>
 * (Calibre also stashes local library paths there), leaving <title-info>
 * and the article body byte-for-byte unchanged.
 */
const NEUTRAL_DOCUMENT_INFO =
  '<document-info><author><nickname>Communist Prometheus</nickname>' +
  '</author><date>2026</date>' +
  '<id>00000000-0000-0000-0000-000000000000</id>' +
  '<version>1.0</version></document-info>'

const replaceBlock = (xml: string, tag: string, to: string): string =>
  xml.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, 'gi'), to)

/**
 * Neutralise file-level FB2 metadata that could expose the uploader.
 * No-op when the input carries no <document-info> / <custom-info>.
 *
 * @param xml - Raw FB2 XML as a UTF-8 string.
 * @returns FB2 XML with a neutral <document-info> and no <custom-info>.
 */
export const sanitizeFb2 = (xml: string): string =>
  replaceBlock(
    replaceBlock(xml, 'custom-info', ''),
    'document-info',
    NEUTRAL_DOCUMENT_INFO
  )
