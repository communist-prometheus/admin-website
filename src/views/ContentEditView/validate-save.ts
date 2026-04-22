import { Either } from 'effect'
import type { ComputedRef } from 'vue'
import type { ContentType } from '@/types/content'
import { validateFrontmatter } from '@/validation/schemas/frontmatter'

interface GuardDeps {
  readonly contentType: ComputedRef<ContentType>
  readonly frontmatter: () => Record<string, unknown>
}

/**
 * Return a human-readable error message when the current frontmatter
 * does not match its per-type schema, or undefined if it is valid.
 *
 * @param deps accessors for content type and live frontmatter
 * @returns error string or undefined
 */
export const guardFrontmatter = (deps: GuardDeps): string | undefined => {
  const result = validateFrontmatter(
    deps.contentType.value,
    deps.frontmatter()
  )
  return Either.isLeft(result) ? result.left : undefined
}
