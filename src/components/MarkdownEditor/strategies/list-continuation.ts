import type { LineContext } from '../line-context'

/**
 * Compute the next ordered list number prefix.
 * @param prefix - Current list prefix (e.g. "1. ")
 * @returns Next prefix with incremented number
 */
const nextPrefix = (prefix: string): string => {
  const m = prefix.match(/^(\d+)\.\s$/)
  return m?.[1] ? `${Number(m[1]) + 1}. ` : prefix
}

/**
 * Continue list pattern on Enter.
 * Auto-increments ordered list numbers.
 * @param ctx - Current line context
 * @param _el - Textarea element (unused, required by strategy signature)
 * @returns true if handled
 */
export const listContinuation = (
  ctx: LineContext,
  _el: HTMLTextAreaElement
): boolean => {
  if (!ctx.listPrefix) return false
  const next = ctx.indent + nextPrefix(ctx.listPrefix)
  document.execCommand('insertText', false, `\n${next}`)
  return true
}
