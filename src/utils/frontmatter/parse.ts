/**
 * Parsed markdown content with frontmatter
 */
export interface ParsedContent {
  readonly frontmatter: Record<string, unknown>
  readonly content: string
}

const parseValue = (value: string): unknown => {
  if (value.match(/^\d{4}-\d{2}-\d{2}$/)) return new Date(value)
  if (value === 'true') return true
  if (value === 'false') return false
  if (!Number.isNaN(Number(value)) && value !== '') return Number(value)
  return value
}

const parseFrontmatterLines = (text: string): Record<string, unknown> => {
  const frontmatter: Record<string, unknown> = {}

  for (const line of text.split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    const value = line.slice(colonIndex + 1).trim()
    frontmatter[key] = parseValue(value)
  }

  return frontmatter
}

/**
 * Parse frontmatter from markdown content.
 * Normalizes CRLF/CR line endings to LF before matching so files authored
 * on Windows or round-tripped through CRLF-normalizing tooling parse correctly.
 * @param markdown - Markdown content with frontmatter
 * @returns Parsed content with frontmatter and body
 */
export const parseFrontmatter = (markdown: string): ParsedContent => {
  const normalized = markdown.replace(/\r\n?/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)

  if (!match) {
    return { frontmatter: {}, content: normalized }
  }

  const [, frontmatterText = '', content = ''] = match
  const frontmatter = parseFrontmatterLines(frontmatterText)

  return { frontmatter, content: content.trim() }
}
