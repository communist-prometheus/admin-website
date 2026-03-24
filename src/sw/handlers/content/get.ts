import { Effect, pipe } from 'effect'
import { NotFoundError } from '../../errors'
import { errorResponse, jsonResponse } from '../shared/json-response'
import { buildItem } from './build-item'
import { resolveContentPath } from './resolve-path'

/**
 * Handle GET /api/github/content/:type/:slug/:lang
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 * @returns JSON response with ContentItem
 */
export const handleContentGet = (
  type: string,
  slug: string,
  lang: string
): Promise<Response> =>
  pipe(
    Effect.promise(() => resolveContentPath(type, slug, lang)),
    Effect.filterOrFail(
      (path): path is string => path !== undefined,
      () => new NotFoundError({ resource: `${slug}.${lang}.md` })
    ),
    Effect.flatMap(path => buildItem(type, path)),
    Effect.map(jsonResponse),
    Effect.catchTag('NotFoundError', e =>
      Effect.succeed(errorResponse(`File not found: ${e.resource}`, 404))
    ),
    Effect.runPromise
  )
