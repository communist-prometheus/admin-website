import type { TextOp } from './text-operation'

/**
 * Insert a prefix at the start of the current line.
 * @param content - Full text content
 * @param position - Current cursor position
 * @param prefix - Text to insert at line start
 * @returns Updated text with adjusted cursor
 */
export const insertLinePrefix = (
  content: string,
  position: number,
  prefix: string
): TextOp => {
  const lineStart = content.lastIndexOf('\n', position - 1) + 1
  return {
    text: content.slice(0, lineStart) + prefix + content.slice(lineStart),
    cursorStart: position + prefix.length,
    cursorEnd: position + prefix.length,
  }
}
