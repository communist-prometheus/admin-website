const formatValue = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0] ?? ''
  }
  return String(value)
}

/**
 * Convert frontmatter and content to markdown string
 * @param frontmatter - Frontmatter object
 * @param content - Markdown content
 * @returns Formatted markdown with frontmatter
 */
export const stringifyFrontmatter = (
  frontmatter: Record<string, unknown>,
  content: string
): string => {
  const lines = Object.entries(frontmatter).map(
    ([key, value]) => `${key}: ${formatValue(value)}`
  )

  return `---\n${lines.join('\n')}\n---\n\n${content}`
}
