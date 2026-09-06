import { Either } from 'effect'
import type { ContentPathParts } from '@/sw/handlers/file/path-parts'
import { parseFrontmatterStrict } from '@/sw/handlers/shared/frontmatter'
import { validateFrontmatter } from '@/validation/schemas/frontmatter'

/**
 * The individual rules of the content gate (see `content-gate.ts`).
 * Each returns the reason a payload fails, or undefined when it passes.
 */

type ParseResult =
  | { readonly ok: true; readonly data: Record<string, unknown> }
  | { readonly ok: false; readonly reason: string }

/**
 * Rule 1: the frontmatter fence is valid YAML with a mapping root.
 * @param content - full file body, including YAML frontmatter
 * @returns the parsed record, or the parser's reason
 */
export const tryParseFrontmatter = (content: string): ParseResult => {
  try {
    return { ok: true, data: parseFrontmatterStrict(content) }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, reason: `frontmatter is not valid YAML — ${msg}` }
  }
}

/**
 * Rules 2 + 3: the filename lang is allowed (when a set is given) and
 * the frontmatter `lang` agrees with it.
 * @param parts - parsed `<type>` + `<lang>` from the path
 * @param fm - parsed frontmatter record
 * @param allowed - allowed filename langs; undefined skips rule 2
 * @returns the failing reason or undefined
 */
export const langReason = (
  parts: ContentPathParts,
  fm: Record<string, unknown>,
  allowed: ReadonlySet<string> | undefined
): string | undefined =>
  allowed !== undefined && !allowed.has(parts.lang)
    ? `lang "${parts.lang}" not in supported set (${[...allowed].join(',')}) — ` +
      `update settings/languages.json or rename the file`
    : fm['lang'] === parts.lang
      ? undefined
      : `frontmatter lang (${String(fm['lang'])}) must match filename lang (${parts.lang})`

/**
 * Rule 4: the per-type schema accepts the record.
 * @param type - content type from the path
 * @param data - parsed frontmatter record
 * @returns the schema's reason or undefined
 */
export const schemaReason = (
  type: ContentPathParts['type'],
  data: Record<string, unknown>
): string | undefined => {
  const r = validateFrontmatter(type, data)
  return Either.isLeft(r) ? r.left : undefined
}
