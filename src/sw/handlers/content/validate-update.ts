import { Effect, Either } from 'effect'
import type { ContentType } from '@/types/content'
import { isContentType } from '@/types/content'
import { validateFrontmatter } from '@/validation/schemas/frontmatter'
import { ValidationError } from '../../errors'
import type { UpdateBody } from './update-body'

/**
 * Validate the frontmatter inside an UpdateBody against its per-type
 * schema. Returns a failing Effect when invalid so the rest of the
 * pipeline short-circuits before any git operation.
 *
 * @param b parsed update body
 * @returns Effect.void on success, ValidationError on failure
 */
export const validateUpdateBody = (
  b: UpdateBody
): Effect.Effect<void, ValidationError> => {
  if (!isContentType(b.type)) return Effect.succeed(undefined)
  const result = validateFrontmatter(b.type as ContentType, b.frontmatter)
  if (Either.isLeft(result)) {
    return Effect.fail(new ValidationError({ message: result.left }))
  }
  return Effect.succeed(undefined)
}
