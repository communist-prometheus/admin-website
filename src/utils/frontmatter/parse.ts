export interface ParsedContent<T = Record<string, unknown>> {
  readonly frontmatter: T
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

export const parseFrontmatter = <T = Record<string, unknown>>(
  markdown: string
): ParsedContent<T> => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

  if (!match) {
    return { frontmatter: {} as T, content: markdown }
  }

  const [, frontmatterText = '', content = ''] = match
  const frontmatter = parseFrontmatterLines(frontmatterText)

  return { frontmatter: frontmatter as T, content: content.trim() }
}
