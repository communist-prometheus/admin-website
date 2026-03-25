import { Effect, pipe } from 'effect'
import { NotFoundError, ValidationError } from '../../errors'
import { commitAndPush } from '../../git/remote/commit-and-push'
import { errorResponse, jsonResponse } from '../shared/json-response'
import { parseBody } from '../shared/parse-body'
import { isValidRename, type RenameBody } from './rename-body'
import { renameFiles } from './rename-files'

const executeRename = (b: RenameBody) =>
  pipe(
    renameFiles(b.type, b.oldSlug, b.newSlug),
    Effect.filterOrFail(
      count => count > 0,
      () => new NotFoundError({ resource: `${b.type}/${b.oldSlug}` })
    ),
    Effect.tap(() =>
      Effect.tryPromise(() =>
        commitAndPush(`Rename ${b.type}/${b.oldSlug} to ${b.newSlug}`)
      )
    ),
    Effect.map(count => jsonResponse({ success: true, count }))
  )

/**
 * Handle POST /api/github/content/rename
 * @param request - Request with type, oldSlug, newSlug
 * @returns JSON response with success and count
 */
export const handleContentRename = (request: Request): Promise<Response> =>
  pipe(
    parseBody(request),
    Effect.filterOrFail(
      isValidRename,
      () =>
        new ValidationError({
          message: 'type, oldSlug, newSlug required',
        })
    ),
    Effect.flatMap(executeRename),
    Effect.catchTags({
      ValidationError: e => Effect.succeed(errorResponse(e.message, 400)),
      NotFoundError: e =>
        Effect.succeed(
          errorResponse(`No files found for ${e.resource}`, 404)
        ),
      ParseError: e => Effect.succeed(errorResponse(String(e.cause), 500)),
    }),
    Effect.runPromise
  )
