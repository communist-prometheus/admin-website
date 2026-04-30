/** Frontmatter shape per content kind. */
export type Frontmatter = Readonly<
  Record<string, string | boolean | undefined>
>

const FOOTNOTE_PLACEHOLDER_RE = /@@FOOTNOTE_REF_\d+@@/g

const quote = (value: string): string =>
  value.includes(':') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`
    : value

/**
 * Strip footnote placeholders inserted by `extractFootnotes` from
 * a string — titles and descriptions should not carry footnote
 * references even if the source paragraph did.
 * @param value Raw extracted text.
 * @returns Cleaned text with placeholder markers removed.
 */
export const stripFootnoteRefs = (value: string): string =>
  value.replace(FOOTNOTE_PLACEHOLDER_RE, '').replace(/\s+/g, ' ').trim()

const formatValue = (value: string | boolean): string =>
  typeof value === 'boolean' ? String(value) : quote(value)

/**
 * Render a frontmatter object as a YAML block bracketed by `---`.
 * Skips undefined keys; quotes values that contain reserved chars.
 * @param fm Frontmatter object.
 * @returns YAML block including the trailing blank line.
 */
export const renderFrontmatter = (fm: Frontmatter): string => {
  const lines = Object.entries(fm)
    .filter(
      (entry): entry is [string, string | boolean] => entry[1] !== undefined
    )
    .map(([k, v]) => `${k}: ${formatValue(v)}`)
  return `---\n${lines.join('\n')}\n---\n\n`
}
