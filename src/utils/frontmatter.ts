/**
 * Parsed markdown content with frontmatter
 */
export interface ParsedContent<T = Record<string, unknown>> {
  readonly frontmatter: T
  readonly content: string
}

/**
 * Parse frontmatter from markdown content
 * @param markdown - Markdown content with frontmatter
 * @returns Parsed content with frontmatter and body
 */
export const parseFrontmatter = <T = Record<string, unknown>>(
  markdown: string
): ParsedContent<T> => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

  if (!match) {
    return {
      frontmatter: {} as T,
      content: markdown,
    }
  }

  const [, frontmatterText = '', content = ''] = match
  const frontmatter: Record<string, unknown> = {}

  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) return

    const key = line.slice(0, colonIndex).trim()
    const value = line.slice(colonIndex + 1).trim()

    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      frontmatter[key] = new Date(value)
    } else if (value === 'true') {
      frontmatter[key] = true
    } else if (value === 'false') {
      frontmatter[key] = false
    } else if (!Number.isNaN(Number(value)) && value !== '') {
      frontmatter[key] = Number(value)
    } else {
      frontmatter[key] = value
    }
  })

  return {
    frontmatter: frontmatter as T,
    content: content.trim(),
  }
}

/**
 * Format a frontmatter value for stringification
 * @param value - Value to format
 * @returns Formatted string
 */
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
export const stringifyFrontmatter = <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  frontmatter: T,
  content: string
): string => {
  const lines = Object.entries(frontmatter as Record<string, unknown>).map(
    ([key, value]) => `${key}: ${formatValue(value)}`
  )

  return `---\n${lines.join('\n')}\n---\n\n${content}`
}
