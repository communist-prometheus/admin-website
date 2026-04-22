import { Effect, Either, pipe } from 'effect'
import type { ContentType } from '@/types/content'
import { isContentType } from '@/types/content'
import { validateFrontmatter } from '@/validation/schemas/frontmatter'
import { ValidationError } from '../../errors'
import { writeAndStage } from '../../git/io/write-file'
import { commitAndPush } from '../../git/remote/commit-and-push'
import { assertPermission } from '../../rbac/permission-check'
import { serializeFrontmatter } from '../shared/frontmatter'
import { errorResponse, jsonResponse } from '../shared/json-response'
import { parseBody } from '../shared/parse-body'
import { newFilePath } from './base'
import { resolveContentPath } from './resolve-path'
import type { UpdateBody } from './update-body'
import { isValidUpdate } from './update-body'

const validate = (
  b: UpdateBody
): Effect.Effect<void, ValidationError> => {
  if (!isContentType(b.type)) return Effect.succeed(undefined)
  const result = validateFrontmatter(b.type as ContentType, b.frontmatter)
  if (Either.isLeft(result)) {
    return Effect.fail(new ValidationError({ message: result.left }))
  }
  return Effect.succeed(undefined)
}

const checkAndWrite = (b: UpdateBody) =>
  pipe(
    validate(b),
    Effect.flatMap(() =>
      assertPermission(
        'update',
        isContentType(b.type) ? (b.type as ContentType) : 'blog',
        String(b.frontmatter['author'] ?? '')
      )
    ),
    Effect.flatMap(() =>
      Effect.promise(() => resolveContentPath(b.type, b.slug, b.lang))
    ),
    Effect.map(p => p ?? newFilePath(b.type, b.slug, b.lang)),
    Effect.tap(path =>
      Effect.tryPromise(() =>
        writeAndStage(path, serializeFrontmatter(b.frontmatter, b.body))
      )
    ),
    Effect.tap(() => Effect.tryPromise(() => commitAndPush(b.message))),
    Effect.map(path => jsonResponse({ success: true, path }))
  )

/**
 * Handle POST /api/github/content — create or update.
 * @param request - Incoming Request
 * @returns JSON response with success and path
 */
export const handleContentUpdate = (request: Request): Promise<Response> =>
  pipe(
    parseBody(request),
    Effect.filterOrFail(
      isValidUpdate,
      () => new ValidationError({ message: 'Missing required fields' })
    ),
    Effect.flatMap(checkAndWrite),
    Effect.catchTag('ForbiddenError', e =>
      Effect.succeed(errorResponse(e.message, 403))
    ),
    Effect.catchTag('ValidationError', e =>
      Effect.succeed(errorResponse(e.message, 400))
    ),
    Effect.catchAll(e => Effect.succeed(errorResponse(String(e), 500))),
    Effect.runPromise
  )
