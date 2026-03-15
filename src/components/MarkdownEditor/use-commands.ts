/**
 * Wrap selected text with markers using native insert.
 * Supports undo via Ctrl+Z.
 * @param el - Textarea element
 * @param pre - Opening marker
 * @param suf - Closing marker
 */
export const execWrap = (
  el: HTMLTextAreaElement,
  pre: string,
  suf: string
) => {
  const sel = el.value.slice(el.selectionStart, el.selectionEnd)
  const empty = el.selectionStart === el.selectionEnd
  el.focus()
  document.execCommand('insertText', false, pre + sel + suf)
  if (empty) {
    const p = el.selectionStart - suf.length
    el.setSelectionRange(p, p)
  }
}

/**
 * Insert prefix at current line start using native insert.
 * @param el - Textarea element
 * @param prefix - Text to prepend to line
 */
export const execBlock = (el: HTMLTextAreaElement, prefix: string) => {
  const ls = el.value.lastIndexOf('\n', el.selectionStart - 1) + 1
  el.focus()
  el.setSelectionRange(ls, ls)
  document.execCommand('insertText', false, prefix)
}

/**
 * Insert media tag at cursor using native insert.
 * @param el - Textarea element
 * @param tag - Media tag string
 */
export const execMedia = (el: HTMLTextAreaElement, tag: string) => {
  el.focus()
  document.execCommand('insertText', false, `\n${tag}\n`)
}
