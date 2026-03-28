import type { LineContext } from '../line-context'

/**
 * Preserve leading whitespace on Enter.
 * @param ctx - Current line context
 * @param _el - Textarea element (unused, required by strategy signature)
 * @returns true if indentation was preserved
 */
export const indentPreservation = (
  ctx: LineContext,
  _el: HTMLTextAreaElement
): boolean => {
  if (ctx.indent.length === 0) return false
  document.execCommand('insertText', false, `\n${ctx.indent}`)
  return true
}
