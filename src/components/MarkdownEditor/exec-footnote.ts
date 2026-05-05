const MARKER_RE = /\[\^(\d+)\]/g

/**
 * Find the next free numeric footnote id by scanning the body for
 * existing `[^N]` markers and definitions and returning max + 1.
 *
 * @param body Current textarea content.
 * @returns Next free integer footnote id (1 when none exist yet).
 */
export const nextFootnoteId = (body: string): number => {
  const ids = [...body.matchAll(MARKER_RE)]
    .map(m => Number(m[1]))
    .filter(n => Number.isFinite(n))
  return (ids.length === 0 ? 0 : Math.max(...ids)) + 1
}

/**
 * Insert a GFM footnote at the cursor. The marker `[^N]` lands at
 * the caret position; the empty definition `[^N]: ` is appended to
 * the very end of the body so editors find it where it'll be
 * rendered. After insertion the caret moves to the definition line
 * so the editor can type the footnote text immediately.
 *
 * @param el Textarea element.
 * @returns void
 */
export const execFootnote = (el: HTMLTextAreaElement): void => {
  const id = nextFootnoteId(el.value)
  const marker = `[^${id}]`
  const def = `[^${id}]: `

  el.focus()
  document.execCommand('insertText', false, marker)

  /*
   * Append the empty definition at the end of the body. We move the
   * caret there, write `\n\n[^N]: `, and leave the caret at the end
   * of that line so the editor types the footnote text right away.
   */
  const end = el.value.length
  const trailingNewlines = el.value.endsWith('\n\n')
    ? ''
    : el.value.endsWith('\n')
      ? '\n'
      : '\n\n'
  el.setSelectionRange(end, end)
  document.execCommand('insertText', false, `${trailingNewlines}${def}`)
}
