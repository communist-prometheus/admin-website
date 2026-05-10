import { parse as yamlParse, stringify as yamlStringify } from 'yaml'

const FM_REGEX = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Parse frontmatter and body from markdown content via the `yaml`
 * lib so values containing `:`, `#`, leading reserved chars or
 * embedded newlines round-trip correctly. The previous self-rolled
 * splitter only honoured the first colon and dropped everything
 * after it, which silently corrupted any description with a
 * mid-sentence `:` — see the from-manchester-to-global regression.
 * @param raw - Raw markdown string with YAML frontmatter
 * @returns Parsed frontmatter record and body text
 */
export const parseFrontmatter = (
  raw: string
): { frontmatter: Record<string, unknown>; body: string } => {
  const match = raw.match(FM_REGEX)
  if (!match?.[1]) return { frontmatter: {}, body: raw }
  let parsed: unknown
  try {
    parsed = yamlParse(match[1])
  } catch {
    return { frontmatter: {}, body: (match[2] ?? '').trim() }
  }
  return {
    frontmatter: isRecord(parsed) ? parsed : {},
    body: (match[2] ?? '').trim(),
  }
}

/**
 * Parse the frontmatter fence strictly: throws on missing fence,
 * non-mapping root, or malformed YAML. Used by the stage-time
 * validator so editors see "your description has an unquoted colon"
 * instead of a downstream schema error pretending the title is
 * missing.
 * @param raw - Raw markdown string with YAML frontmatter
 * @returns Parsed frontmatter record
 * @throws Error with the parser's location + message
 */
export const parseFrontmatterStrict = (
  raw: string
): Record<string, unknown> => {
  const match = raw.match(FM_REGEX)
  if (!match?.[1]) throw new Error('frontmatter fence (--- … ---) missing')
  const parsed: unknown = yamlParse(match[1])
  if (!isRecord(parsed)) {
    throw new Error('frontmatter must be a mapping (key: value …)')
  }
  return parsed
}

/**
 * Serialize frontmatter and body to markdown. `yaml.stringify`
 * auto-quotes any value that would otherwise break the parser
 * (colon-in-text, leading reserved chars, embedded newlines, …).
 *
 * `blockQuote: false` disables block scalar (`|+`/`>`) output —
 * fast-check found that block scalars silently lose a leading
 * space when the value is `" \n"` (and similar whitespace-only
 * shapes), so the round-trip fails. Forcing flow-style strings
 * keeps the round-trip lossless while plain values still serialize
 * unquoted, so the content-repo diffs stay readable.
 *
 * `lineWidth: 0` keeps long prose values on one line.
 * @param fm - Frontmatter key-value pairs
 * @param body - Markdown body
 * @returns Complete markdown string with YAML frontmatter
 */
export const serializeFrontmatter = (
  fm: Record<string, unknown>,
  body: string
): string => {
  const filtered: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(fm)) {
    if (v !== undefined) filtered[k] = v
  }
  const yaml = yamlStringify(filtered, { lineWidth: 0, blockQuote: false })
  const trimmed = yaml.endsWith('\n') ? yaml.slice(0, -1) : yaml
  return `---\n${trimmed}\n---\n\n${body}`
}
