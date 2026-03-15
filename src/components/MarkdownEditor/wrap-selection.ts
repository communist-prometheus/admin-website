import type { TextOp } from './text-operation'

/**
 * Wrap selected text with prefix and suffix markers.
 * @param content - Full text content
 * @param start - Selection start index
 * @param end - Selection end index
 * @param pre - Opening marker (e.g. `**`)
 * @param suf - Closing marker (e.g. `**`)
 * @returns Updated text with adjusted cursor
 */
export const wrapSelection = (
  content: string,
  start: number,
  end: number,
  pre: string,
  suf: string
): TextOp => ({
  text:
    content.slice(0, start) +
    pre +
    content.slice(start, end) +
    suf +
    content.slice(end),
  cursorStart: start + pre.length,
  cursorEnd: end + pre.length,
})
