import { describe, expect, it } from 'vitest'
import { sanitizeFb2 } from './sanitize-fb2'

/*
 * Calibre (and other ebook converters) stamp the uploader's OS / library
 * account name into the FB2 <document-info><author> block. That FB2 is
 * served verbatim from the public site, so the name leaks. sanitizeFb2
 * neutralises <document-info> (and drops <custom-info>) while leaving the
 * book's <title-info> and the article body byte-for-byte intact —
 * including bibliographic citations that legitimately mention the same
 * surname. (Placeholder name "Jane Roe" stands in for the real one.)
 */
const LEAKING_FB2 = `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
<description>
    <title-info>
        <book-title>primo numero della rivista</book-title>
        <author><first-name>prometeo</first-name><last-name>comunista</last-name></author>
        <genre>rivista</genre>
        <lang>ru</lang>
        </title-info>
    <document-info>
        <author><first-name>Jane</first-name><last-name>Roe</last-name></author>
        <program-used>calibre 4.99.5</program-used>
        <date>8.5.2026</date>
        <id>ec5f6add-ca4a-45c6-9e60-33be0385347e</id>
        <version>1.0</version>
    </document-info>
    <custom-info info-type="calibre_library_path">/home/jane.roe/Calibre Library</custom-info>
    <publish-info>
    <year>2026</year></publish-info>
</description>
<body>
<section>
<p><strong>PROMETEO COMUNISTA N 1, Maggio 2026</strong></p>
<p> - Roe, J. "Una visita alla fabbrica" // Bollettino n. 1(49). 2000. Febbraio.</p>
<p>Текст на русском языке: пролетарии всех стран, соединяйтесь.</p>
</section>
</body>
</FictionBook>
`

describe('sanitizeFb2', () => {
  it('strips the uploader name and tool metadata from <document-info>', () => {
    const out = sanitizeFb2(LEAKING_FB2)
    expect(out).not.toContain('Jane')
    expect(out).not.toContain('<first-name>Jane</first-name>')
    expect(out).not.toContain('calibre')
    expect(out).not.toContain('ec5f6add-ca4a-45c6-9e60-33be0385347e')
    expect(out).toContain('<document-info>')
    expect(out).toContain('<nickname>Communist Prometheus</nickname>')
  })

  it('drops <custom-info> blocks entirely', () => {
    const out = sanitizeFb2(LEAKING_FB2)
    expect(out).not.toContain('custom-info')
    expect(out).not.toContain('jane.roe')
  })

  it('keeps <title-info>, the body, and bibliographic citations intact', () => {
    const out = sanitizeFb2(LEAKING_FB2)
    expect(out).toContain(
      '<book-title>primo numero della rivista</book-title>'
    )
    expect(out).toContain('PROMETEO COMUNISTA N 1, Maggio 2026')
    expect(out).toContain('Roe, J. "Una visita alla fabbrica"')
    expect(out).toContain('пролетарии всех стран, соединяйтесь')
  })

  it('is a no-op for an FB2 that has no <document-info>', () => {
    const minimal =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<FictionBook><description><title-info>' +
      '<book-title>x</book-title></title-info></description>' +
      '<body><section><p>hi</p></section></body></FictionBook>'
    expect(sanitizeFb2(minimal)).toBe(minimal)
  })
})
