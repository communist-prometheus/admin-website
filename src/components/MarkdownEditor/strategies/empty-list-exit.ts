import type { LineContext } from '../line-context'

/**
 * Exit list mode when Enter is pressed on an empty list item.
 * Removes the list prefix, leaving a blank line.
 * @param ctx - Current line context
 * @param el - Textarea element
 * @returns true if handled
 */
export const emptyListExit = (
  ctx: LineContext,
  el: HTMLTextAreaElement
): boolean => {
  if (!ctx.isEmptyListItem) return false
  const end = ctx.lineStart + ctx.fullLine.length
  el.setSelectionRange(ctx.lineStart, end)
  document.execCommand('insertText', false, '')
  return true
}
