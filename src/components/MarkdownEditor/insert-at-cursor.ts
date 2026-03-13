/**
 * Insert text into a string at a given cursor position.
 * @param content - Current text content
 * @param position - Cursor position (character index)
 * @param insertion - Text to insert
 * @returns Updated content string
 */
export const insertAtCursor = (
  content: string,
  position: number,
  insertion: string
): string => content.slice(0, position) + insertion + content.slice(position)
