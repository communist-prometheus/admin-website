import { parse as yamlParse } from 'yaml'

/**
 * Parsed markdown content with frontmatter
 */
export interface ParsedContent {
  readonly frontmatter: Record<string, unknown>
  readonly content: string
}

const FM_REGEX = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Parse frontmatter from markdown content via the `yaml` lib.
 * Normalises CRLF/CR to LF before matching so Windows-authored or
 * round-tripped files parse identically. Returns an empty
 * frontmatter on either no fence or malformed YAML rather than
 * throwing — the caller may surface a banner without taking down
 * the editor.
 * @param markdown - Markdown content with frontmatter
 * @returns Parsed content with frontmatter and body
 */
export const parseFrontmatter = (markdown: string): ParsedContent => {
  const normalized = markdown.replace(/\r\n?/g, '\n')
  const match = normalized.match(FM_REGEX)
  if (!match) return { frontmatter: {}, content: normalized }

  const [, frontmatterText = '', content = ''] = match
  let parsed: unknown
  try {
    parsed = yamlParse(frontmatterText)
  } catch {
    return { frontmatter: {}, content: content.trim() }
  }
  return {
    frontmatter: isRecord(parsed) ? parsed : {},
    content: content.trim(),
  }
}
