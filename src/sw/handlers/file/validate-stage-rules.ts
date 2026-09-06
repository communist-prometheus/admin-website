import { validateParsedContent } from '@/validation/content-gate'
import { workerState } from '../../state/state'
import type { ContentPathParts } from './path-parts'

/**
 * Run the content gate against an already-parsed path with the
 * worker's live language whitelist (refreshed from
 * `settings/languages.json` after every sync). The rules themselves
 * live in `@/validation/content-gate` so the Contents-API publish
 * path on the main thread applies the very same ones.
 * @param parts - parsed `<type>` + `<lang>` from the path
 * @param content - full file body, including YAML frontmatter
 * @returns error message or undefined
 */
export const validateContent = (
  parts: ContentPathParts,
  content: string
): string | undefined =>
  validateParsedContent(parts, content, workerState.supportedLangs)
