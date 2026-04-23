import { Either } from 'effect'
import type { ComputedRef } from 'vue'
import type { ContentType } from '@/types/content'
import { validateFrontmatter } from '@/validation/schemas/frontmatter'
import { validateImageAsset } from './validate-image-asset'

interface GuardDeps {
  readonly contentType: ComputedRef<ContentType>
  readonly frontmatter: () => Record<string, unknown>
  readonly assetNames?: () => readonly string[]
}

const schema = (deps: GuardDeps): string | undefined => {
  const r = validateFrontmatter(deps.contentType.value, deps.frontmatter())
  return Either.isLeft(r) ? r.left : undefined
}

const image = (deps: GuardDeps): string | undefined =>
  validateImageAsset(deps.frontmatter()['image'], deps.assetNames?.() ?? [])

/**
 * Return a human-readable error message when the current frontmatter
 * does not match its per-type schema or when the `image` reference
 * points at an asset that is not present. Returns undefined when the
 * save is safe to proceed.
 *
 * @param deps accessors for content type, frontmatter, asset list
 * @returns error string or undefined
 */
export const guardFrontmatter = (deps: GuardDeps): string | undefined =>
  schema(deps) ?? image(deps)
