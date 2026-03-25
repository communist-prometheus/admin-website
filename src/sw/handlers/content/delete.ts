import { Effect, pipe } from 'effect'
import { NotFoundError } from '../../errors'
import { deleteAndUnstage } from '../../git/io/delete-git-file'
import { commitAndPush } from '../../git/remote/commit-and-push'
import { errorResponse, jsonResponse } from '../shared/json-response'
import { resolveContentPath } from './resolve-path'

const deleteFile = (type: string, slug: string, lang: string) =>
  pipe(
    Effect.promise(() => resolveContentPath(type, slug, lang)),
    Effect.filterOrFail(
      (p): p is string => p !== undefined,
      () => new NotFoundError({ resource: `${slug}.${lang}.md` })
    ),
    Effect.tap(p => Effect.tryPromise(() => deleteAndUnstage(p))),
    Effect.tap(() =>
      Effect.tryPromise(() =>
        commitAndPush(`Delete ${type}/${slug}.${lang}.md`)
      )
    ),
    Effect.map(path => jsonResponse({ success: true, path }))
  )

/**
 * Handle DELETE /api/github/content/:type/:slug/:lang
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 * @param _request - Incoming Request (unused)
 * @returns JSON response with success and path
 */
export const handleContentDelete = (
  type: string,
  slug: string,
  lang: string,
  _request: Request
): Promise<Response> =>
  pipe(
    deleteFile(type, slug, lang),
    Effect.catchTag('NotFoundError', e =>
      Effect.succeed(errorResponse(`File not found: ${e.resource}`, 404))
    ),
    Effect.catchAll(e => Effect.succeed(errorResponse(String(e), 500))),
    Effect.runPromise
  )
