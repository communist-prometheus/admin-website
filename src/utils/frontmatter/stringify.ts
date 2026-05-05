import { stringify as yamlStringify } from 'yaml'

const yyyyMmDd = (d: Date): string => d.toISOString().slice(0, 10)

/*
 * Astro content collections accept ISO-8601 dates for `pubDate` /
 * `publishDate` either as `2026-04-30` (date-only) or full
 * timestamps. We've always shipped date-only so timestamps don't
 * leak the editor's local clock into prod content. Map Date → string
 * BEFORE handing the object to `yaml.stringify` so the lib doesn't
 * emit the timestamp form.
 */
const normaliseDates = (
  fm: Record<string, unknown>
): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(fm)) {
    out[k] = v instanceof Date ? yyyyMmDd(v) : v
  }
  return out
}

/**
 * Convert frontmatter and content to markdown string. The `yaml`
 * lib auto-quotes any value that needs it (colons inside strings,
 * leading `-`/`?`/`*`/`[`, embedded newlines, …) so the output
 * always re-parses to the same object. The previous self-rolled
 * `${key}: ${value}` writer broke the moment an editor pasted a
 * description with a colon — see the from-manchester-to-global
 * regression that took prod red for two days.
 *
 * `lineWidth: 0` disables auto-wrapping so prose paragraphs in
 * description / pageDescription stay on one line — easier diffs.
 *
 * @param frontmatter - Frontmatter object
 * @param content - Markdown content
 * @returns Formatted markdown with frontmatter
 */
export const stringifyFrontmatter = (
  frontmatter: Record<string, unknown>,
  content: string
): string => {
  const yaml = yamlStringify(normaliseDates(frontmatter), { lineWidth: 0 })
  /*
   * `yaml.stringify` already terminates with `\n`. Strip it so we
   * don't get a blank line before the closing `---` fence.
   */
  const trimmed = yaml.endsWith('\n') ? yaml.slice(0, -1) : yaml
  return `---\n${trimmed}\n---\n\n${content}`
}
