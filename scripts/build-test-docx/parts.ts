/*
 * Minimal OOXML parts for a `.docx` carrying three paragraphs with
 * inline footnote references. Hand-written instead of using a
 * heavy `docx` library — the structure is small and stable.
 *
 * Inline footnote references use the schema's <w:footnoteReference>
 * element; bodies live in `word/footnotes.xml` and reference back
 * via <w:footnoteRef/>. mammoth + the admin's extract-footnotes
 * step rewrites this scaffolding into GFM `[^N]` markdown.
 */

const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
const W =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
const R =
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'

export const contentTypesXml = `${XML_DECL}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>
</Types>`

export const rootRelsXml = `${XML_DECL}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

export const documentRelsXml = `${XML_DECL}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes" Target="footnotes.xml"/>
</Relationships>`

const para = (runs: string): string => `<w:p>${runs}</w:p>`
const run = (text: string): string =>
  `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>`
/*
 * Mammoth already wraps every <w:footnoteReference/> in a <sup>; if
 * the run carries `<w:vertAlign w:val="superscript"/>` too mammoth
 * adds another <sup>, producing nested <sup><sup><a>…</a></sup></sup>
 * that the extractor's single-sup regex doesn't match. Skip the run
 * property and let mammoth own the superscript.
 */
const fnRef = (id: number): string =>
  `<w:r><w:footnoteReference w:id="${id}"/></w:r>`

const body = [
  para(
    `${run('Marx')}${fnRef(1)}${run(' and Engels')}${fnRef(2)}${run(
      ' wrote a manifesto. It is short'
    )}${fnRef(3)}${run('.')}`
  ),
].join('')

export const documentXml = `${XML_DECL}
<w:document ${W} ${R}>
  <w:body>${body}</w:body>
</w:document>`

const fnBody = (id: number, text: string): string =>
  `<w:footnote w:id="${id}"><w:p><w:r><w:footnoteRef/></w:r>${run(` ${text}`)}</w:p></w:footnote>`

/*
 * The two reserved footnote ids (-1 separator, 0 continuationSeparator)
 * render to mammoth's `<hr>` ahead of the footnotes list. Without
 * them mammoth emits a bare `<ol>` and the extractor's trailing
 * `<hr><ol>…</ol>` regex never matches.
 */
const separators = `
  <w:footnote w:id="-1" w:type="separator">
    <w:p><w:r><w:separator/></w:r></w:p>
  </w:footnote>
  <w:footnote w:id="0" w:type="continuationSeparator">
    <w:p><w:r><w:continuationSeparator/></w:r></w:p>
  </w:footnote>`

export const footnotesXml = `${XML_DECL}
<w:footnotes ${W}>
  ${separators}
  ${fnBody(1, 'Karl Marx, German philosopher and economist.')}
  ${fnBody(2, 'Friedrich Engels, German philosopher, the other author.')}
  ${fnBody(3, 'Roughly twenty thousand words.')}
</w:footnotes>`
