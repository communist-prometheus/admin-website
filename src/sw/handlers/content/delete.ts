import { Effect, pipe } from 'effect'
import type { ContentType } from '@/types/content'
import { isContentType } from '@/types/content'
import { NotFoundError } from '../../errors'
import { deleteAndUnstage } from '../../git/io/delete-git-file'
import { assertPermission } from '../../rbac/permission-check'
import { errorResponse, jsonResponse } from '../shared/json-response'
import { resolveContentPath } from './resolve-path'

const toContentType = (t: string): ContentType =>
  isContentType(t) ? t : 'blog'

const deleteFile = (type: string, slug: string, lang: string) =>
  pipe(
    assertPermission('delete', toContentType(type)),
    Effect.flatMap(() =>
      Effect.promise(() => resolveContentPath(type, slug, lang))
    ),
    Effect.filterOrFail(
      (p): p is string => p !== undefined,
      () => new NotFoundError({ resource: `${slug}.${lang}.md` })
    ),
    Effect.tap(p => Effect.tryPromise(() => deleteAndUnstage(p))),
    Effect.map(path => jsonResponse({ success: true, staged: true, path }))
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
    Effect.catchTag('ForbiddenError', e =>
      Effect.succeed(errorResponse(e.message, 403))
    ),
    Effect.catchTag('NotFoundError', e =>
      Effect.succeed(errorResponse(`File not found: ${e.resource}`, 404))
    ),
    Effect.catchAll(e => Effect.succeed(errorResponse(String(e), 500))),
    Effect.runPromise
  )
