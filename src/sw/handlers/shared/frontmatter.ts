const FM_REGEX = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/

/**
 * Parse frontmatter and body from markdown content.
 * @param raw - Raw markdown string with YAML frontmatter
 * @returns Parsed frontmatter record and body text
 */
export const parseFrontmatter = (
  raw: string
): { frontmatter: Record<string, unknown>; body: string } => {
  const match = raw.match(FM_REGEX)
  if (!match?.[1]) return { frontmatter: {}, body: raw }

  const frontmatter: Record<string, unknown> = {}

  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx < 1) continue
    const key = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim()
    frontmatter[key] = value
  }

  return { frontmatter, body: (match[2] ?? '').trim() }
}

/**
 * Serialize frontmatter and body to markdown.
 * @param fm - Frontmatter key-value pairs
 * @param body - Markdown body
 * @returns Complete markdown string with YAML frontmatter
 */
export const serializeFrontmatter = (
  fm: Record<string, unknown>,
  body: string
): string => {
  const lines = ['---']
  for (const [key, value] of Object.entries(fm)) {
    if (value !== undefined) lines.push(`${key}: ${value}`)
  }
  lines.push('---', '', body)
  return lines.join('\n')
}
