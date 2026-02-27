export interface ParsedContent<T = Record<string, unknown>> {
  readonly frontmatter: T
  readonly content: string
}

export const parseFrontmatter = <T = Record<string, unknown>>(
  markdown: string
): ParsedContent<T> => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

  if (!match) {
    return { frontmatter: {} as T, content: markdown }
  }

  const [, frontmatterText = '', content = ''] = match
  const frontmatter: Record<string, unknown> = {}

  for (const line of frontmatterText.split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

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
  }

  return { frontmatter: frontmatter as T, content: content.trim() }
}
