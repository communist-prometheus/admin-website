import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { beforeEach, describe, expect, it } from 'vitest'
import { execFootnote } from './exec-footnote'

/**
 * Astro/public-website remark chain. Same plugins, same defaults
 * (clobberPrefix = "user-content-" comes from remark-rehype). The
 * goal of this test is to verify that markdown emitted by the admin
 * editor toolbar is byte-compatible with this chain.
 *
 * @param md - Markdown source
 * @returns Rendered HTML string
 */
const renderMarkdown = async (md: string): Promise<string> => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md)
  return String(file)
}

/**
 * jsdom 28 does not implement document.execCommand at all. We
 * install a textarea-aware shim that performs an insertText against
 * the active element so execFootnote runs against a faithful
 * browser-like environment. The shim mirrors how Chromium applies
 * insertText: it replaces the current selection with the given
 * value and moves the caret to the end of the inserted text.
 *
 * @returns void
 */
const installExecCommandShim = (): void => {
  Reflect.set(
    document,
    'execCommand',
    (cmd: string, _ui?: boolean, value?: string): boolean => {
      if (cmd !== 'insertText') return false
      const el = document.activeElement
      if (!(el instanceof HTMLTextAreaElement)) return false
      const start = el.selectionStart ?? el.value.length
      const end = el.selectionEnd ?? el.value.length
      const insertion = value ?? ''
      el.value = el.value.slice(0, start) + insertion + el.value.slice(end)
      const caret = start + insertion.length
      el.setSelectionRange(caret, caret)
      return true
    }
  )
}

/**
 * Build a textarea attached to the document with given content,
 * caret at the end. Returns the element so the test can drive it.
 *
 * @param initial - Initial textarea value
 * @returns HTMLTextAreaElement attached to document.body
 */
const makeTextarea = (initial = ''): HTMLTextAreaElement => {
  const el = document.createElement('textarea')
  el.value = initial
  document.body.appendChild(el)
  el.focus()
  el.setSelectionRange(initial.length, initial.length)
  return el
}

describe('footnote markdown round-trip (admin → public site)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    installExecCommandShim()
  })

  it('single static footnote renders matching ref + def IDs', async () => {
    const md = 'See the manifesto[^1] for details.\n\n[^1]: Reference text.\n'
    const html = await renderMarkdown(md)
    expect(html).toContain('id="user-content-fn-1"')
    expect(html).toContain('id="user-content-fnref-1"')
    expect(html).toContain('href="#user-content-fn-1"')
    expect(html).toContain('href="#user-content-fnref-1"')
  })

  it('three footnotes in body order all round-trip with matching IDs', async () => {
    const md = [
      'Alpha[^1] beta[^2] gamma[^3].',
      '',
      '[^1]: First note.',
      '[^2]: Second note.',
      '[^3]: Third note.',
      '',
    ].join('\n')
    const html = await renderMarkdown(md)
    for (const n of [1, 2, 3]) {
      expect(html).toContain(`id="user-content-fn-${n}"`)
      expect(html).toContain(`id="user-content-fnref-${n}"`)
      expect(html).toContain(`href="#user-content-fn-${n}"`)
      expect(html).toContain(`href="#user-content-fnref-${n}"`)
    }
  })

  it('drives execFootnote on a textarea then renders working anchors', async () => {
    const el = makeTextarea('Read the introduction')
    const caret = el.value.length
    el.setSelectionRange(caret, caret)

    execFootnote(el)

    /*
     * The editor only inserts a placeholder definition `[^1]: ` —
     * GFM requires the definition to have content for the back-ref
     * link to be emitted. Mirror what a real editor does: type the
     * footnote body. The caret is already on the definition line.
     */
    document.execCommand('insertText', false, 'Source citation.')

    const md = `${el.value}\n`
    expect(md).toContain('[^1]')
    expect(md).toContain('[^1]: Source citation.')

    const html = await renderMarkdown(md)
    expect(html).toContain('id="user-content-fn-1"')
    expect(html).toContain('id="user-content-fnref-1"')
    expect(html).toContain('href="#user-content-fn-1"')
    expect(html).toContain('href="#user-content-fnref-1"')
  })

  it('drives execFootnote three times — sequential ids, all anchors valid', async () => {
    const el = makeTextarea('First sentence. ')

    execFootnote(el)
    document.execCommand('insertText', false, 'Note one.')

    /* Move caret back into the body to insert the next ref. */
    const insertionPoint =
      el.value.indexOf('First sentence. ') + 'First sentence. '.length
    /*
     * After execFootnote ran, body became:
     *   "First sentence. [^1]\n\n[^1]: Note one."
     * The first ref already lives at position 16. We append a
     * second sentence in the body before the blank-line-separated
     * defs, then run execFootnote again.
     */
    const before = el.value.slice(0, insertionPoint + '[^1]'.length)
    const after = el.value.slice(insertionPoint + '[^1]'.length)
    el.value = `${before} Second sentence.${after}`
    const newCaret = `${before} Second sentence.`.length
    el.setSelectionRange(newCaret, newCaret)

    execFootnote(el)
    document.execCommand('insertText', false, 'Note two.')

    /* Same again for a third footnote. */
    const ref2End = el.value.indexOf('[^2]') + '[^2]'.length
    const before3 = el.value.slice(0, ref2End)
    const after3 = el.value.slice(ref2End)
    el.value = `${before3} Third sentence.${after3}`
    const caret3 = `${before3} Third sentence.`.length
    el.setSelectionRange(caret3, caret3)

    execFootnote(el)
    document.execCommand('insertText', false, 'Note three.')

    const md = `${el.value}\n`
    /* All three markers are present in the body. */
    expect(md).toMatch(/\[\^1\][\s\S]*\[\^2\][\s\S]*\[\^3\]/)
    /* All three definitions appended at the end. */
    expect(md).toContain('[^1]: Note one.')
    expect(md).toContain('[^2]: Note two.')
    expect(md).toContain('[^3]: Note three.')

    const html = await renderMarkdown(md)
    for (const n of [1, 2, 3]) {
      expect(html).toContain(`id="user-content-fn-${n}"`)
      expect(html).toContain(`id="user-content-fnref-${n}"`)
      expect(html).toContain(`href="#user-content-fn-${n}"`)
      expect(html).toContain(`href="#user-content-fnref-${n}"`)
    }
  })

  it('blank line before definitions is preserved (GFM detection)', async () => {
    /*
     * GFM only treats `[^N]: …` as a footnote definition when the
     * line is at block boundary. execFootnote guarantees this by
     * appending `\n\n` before the def when the body does not end
     * in a blank line.
     */
    const el = makeTextarea('Body without trailing newline')
    execFootnote(el)
    document.execCommand('insertText', false, 'Definition.')

    expect(el.value).toMatch(/\n\n\[\^1\]: Definition\.$/)

    const html = await renderMarkdown(`${el.value}\n`)
    expect(html).toContain('id="user-content-fn-1"')
    expect(html).toContain('href="#user-content-fnref-1"')
  })

  it('appending after body that ends with single \\n does not double-blank', async () => {
    const el = makeTextarea('Body with one newline\n')
    execFootnote(el)
    document.execCommand('insertText', false, 'Definition.')

    /* Should normalize to exactly one blank line before def. */
    expect(el.value).toMatch(/\n\n\[\^1\]: Definition\.$/)
    expect(el.value).not.toMatch(/\n\n\n\[\^1\]/)

    const html = await renderMarkdown(`${el.value}\n`)
    expect(html).toContain('id="user-content-fn-1"')
  })

  it('appending after body that already ends \\n\\n inserts no extra newlines', async () => {
    const el = makeTextarea('Body already terminated\n\n')
    execFootnote(el)
    document.execCommand('insertText', false, 'Definition.')

    /* Exactly one blank line before def — no triple newline. */
    expect(el.value).toMatch(/\n\n\[\^1\]: Definition\.$/)
    expect(el.value).not.toMatch(/\n\n\n\[\^1\]/)

    const html = await renderMarkdown(`${el.value}\n`)
    expect(html).toContain('id="user-content-fn-1"')
  })
})
