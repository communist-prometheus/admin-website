import { parseContentPath } from './path-parts'
import { validateContent } from './validate-stage-rules'

/**
 * Stage-time gate that protects the content repo from unbuildable
 * commits. Runs for every `<type>/<slug>/index.<lang>.md` write:
 *
 *   1. frontmatter parses as YAML,
 *   2. filename `<lang>` is in `workerState.supportedLangs` (loaded
 *      from `settings/languages.json` after every sync),
 *   3. `frontmatter.lang` equals filename `<lang>`,
 *   4. per-type schema accepts the record.
 *
 * Non-content paths (assets, settings/, .admin/, README) pass
 * straight through. The regex now matches the real flat layout —
 * the previous `^src/content/...` regex never fired in practice and
 * is what let prod commit `pages/about/index.uk.md` with a `lang`
 * value astro's collection schema rejected.
 *
 * @param path - resolved path being staged
 * @param content - full file body, including YAML frontmatter
 * @returns error message or undefined when safe to stage
 */
export const guardStagePayload = (
  path: string,
  content: string
): string | undefined => {
  const parts = parseContentPath(path)
  return parts === undefined ? undefined : validateContent(parts, content)
}
