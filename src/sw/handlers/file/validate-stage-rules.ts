import { Either } from 'effect'
import { validateFrontmatter } from '@/validation/schemas/frontmatter'
import { workerState } from '../../state/state'
import { parseFrontmatterStrict } from '../shared/frontmatter'
import type { ContentPathParts } from './path-parts'

type ParseResult =
  | { readonly ok: true; readonly data: Record<string, unknown> }
  | { readonly ok: false; readonly reason: string }

const tryParseFrontmatter = (content: string): ParseResult => {
  try {
    return { ok: true, data: parseFrontmatterStrict(content) }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, reason: `frontmatter is not valid YAML — ${msg}` }
  }
}

const langReason = (
  parts: ContentPathParts,
  fm: Record<string, unknown>
): string | undefined => {
  const allowed = workerState.supportedLangs
  return allowed.has(parts.lang)
    ? fm['lang'] === parts.lang
      ? undefined
      : `frontmatter lang (${String(fm['lang'])}) must match filename lang (${parts.lang})`
    : `lang "${parts.lang}" not in supported set (${[...allowed].join(',')}) — ` +
        `update settings/languages.json or rename the file`
}

const schemaReason = (
  type: ContentPathParts['type'],
  data: Record<string, unknown>
): string | undefined => {
  const r = validateFrontmatter(type, data)
  return Either.isLeft(r) ? r.left : undefined
}

/**
 * Run the four-step content gate against an already-parsed path.
 * Returns the first failing reason or undefined when the payload
 * is safe to stage.
 * @param parts - parsed `<type>` + `<lang>` from the path
 * @param content - full file body, including YAML frontmatter
 * @returns error message or undefined
 */
export const validateContent = (
  parts: ContentPathParts,
  content: string
): string | undefined => {
  const parsed = tryParseFrontmatter(content)
  return parsed.ok === false
    ? parsed.reason
    : (langReason(parts, parsed.data) ??
        schemaReason(parts.type, parsed.data))
}
