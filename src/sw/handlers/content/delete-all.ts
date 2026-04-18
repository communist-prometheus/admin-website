import { Effect, pipe } from 'effect'
import { NotFoundError } from '../../errors'
import { deleteAndUnstage } from '../../git/io/delete-git-file'
import { listFilesUnder } from '../../git/io/list-files'
import { errorResponse, jsonResponse } from '../shared/json-response'
import { contentBase } from './base'
import { findSlugFiles } from './find-slug-files'

const deleteAllFiles = (type: string, slug: string) =>
  pipe(
    Effect.tryPromise(() => listFilesUnder(contentBase(type))),
    Effect.map(all => findSlugFiles(all, type, slug)),
    Effect.filterOrFail(
      files => files.length > 0,
      () => new NotFoundError({ resource: `${type}/${slug}` })
    ),
    Effect.tap(files =>
      Effect.forEach(files, f => Effect.tryPromise(() => deleteAndUnstage(f)))
    ),
    Effect.map(files =>
      jsonResponse({ success: true, staged: true, deleted: files.length })
    )
  )

/**
 * Delete ALL language versions of a content slug.
 * Stages deletions but does NOT commit or push.
 * Client calls /api/github/commit separately.
 * @param type - Content type
 * @param slug - Content slug
 * @returns JSON response with deleted count
 */
export const handleContentDeleteAll = (
  type: string,
  slug: string
): Promise<Response> =>
  pipe(
    deleteAllFiles(type, slug),
    Effect.catchTag('NotFoundError', e =>
      Effect.succeed(errorResponse(`No files for ${e.resource}`, 404))
    ),
    Effect.catchAll(e => Effect.succeed(errorResponse(String(e), 500))),
    Effect.runPromise
  )
