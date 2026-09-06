import {
  type ContentPathParts,
  parseContentPath,
} from '@/sw/handlers/file/path-parts'
import {
  langReason,
  schemaReason,
  tryParseFrontmatter,
} from './content-gate-rules'

/**
 * The content gate: the one set of rules every write of a
 * `<type>/<slug>/index.<lang>.md` must pass before it reaches git,
 * whichever transport carries it (the SW clone+push path or the
 * direct Contents-API single-file commit). Pure — no worker state,
 * no network — so both the Service Worker and the main thread can
 * run it.
 *
 *   1. the frontmatter is valid YAML,
 *   2. filename `<lang>` is in `supportedLangs` (when a set is given),
 *   3. `frontmatter.lang` equals filename `<lang>`,
 *   4. the per-type schema accepts the record.
 *
 * A rejected payload is exactly what breaks the public build: an
 * unquoted `: ` in a description (YAML), or a bare `articles:` the
 * collection schema reads as an empty value instead of a list.
 */

/**
 * Run the gate against an already-parsed path.
 * @param parts - parsed `<type>` + `<lang>` from the path
 * @param content - full file body, including YAML frontmatter
 * @param supportedLangs - allowed filename langs; omit to skip rule 2
 * @returns the first failing reason, or undefined when safe to write
 */
export const validateParsedContent = (
  parts: ContentPathParts,
  content: string,
  supportedLangs?: ReadonlySet<string>
): string | undefined => {
  const parsed = tryParseFrontmatter(content)
  return parsed.ok === false
    ? parsed.reason
    : (langReason(parts, parsed.data, supportedLangs) ??
        schemaReason(parts.type, parsed.data))
}

/**
 * Run the gate against a repo path. Non-content paths (assets,
 * settings/, README …) pass straight through.
 * @param path - repo-relative path being written
 * @param content - full file body, including YAML frontmatter
 * @param supportedLangs - allowed filename langs; omit to skip rule 2
 * @returns the first failing reason, or undefined when safe to write
 */
export const validateContentFile = (
  path: string,
  content: string,
  supportedLangs?: ReadonlySet<string>
): string | undefined => {
  const parts = parseContentPath(path)
  return parts === undefined
    ? undefined
    : validateParsedContent(parts, content, supportedLangs)
}
