/** Parsed context of the line at cursor position. */
export interface LineContext {
  readonly fullLine: string
  readonly indent: string
  readonly listPrefix: string | undefined
  readonly isEmptyListItem: boolean
  readonly lineStart: number
}

const LIST_RE = /^(\s*)([-*]\s|(\d+)\.\s|>\s)/

/**
 * Build line context from textarea state.
 * @param value - Full textarea content
 * @param cursor - Cursor position (selectionStart)
 * @returns Parsed context for the current line
 */
export const buildLineContext = (
  value: string,
  cursor: number
): LineContext => {
  const lineStart = value.lastIndexOf('\n', cursor - 1) + 1
  const lineEnd = value.indexOf('\n', cursor)
  const fullLine = value.slice(lineStart, lineEnd < 0 ? undefined : lineEnd)
  const match = LIST_RE.exec(fullLine)
  const indent = match?.[1] ?? fullLine.match(/^(\s*)/)?.[1] ?? ''
  const listPrefix = match?.[2]
  const content = fullLine.slice(indent.length + (listPrefix?.length ?? 0))
  return {
    fullLine,
    indent,
    listPrefix,
    isEmptyListItem: !!listPrefix && content.length === 0,
    lineStart,
  }
}
