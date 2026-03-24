import { Effect, pipe } from 'effect'
import { listFilesUnder } from '../../git/io/list-files'
import { jsonResponse } from '../shared/json-response'
import { contentBase } from './base'
import { buildItem } from './build-item'

/**
 * Check if a filename has a markdown extension.
 * @param f - Filename to check
 * @returns Whether the file is markdown
 */
const isMd = (f: string): boolean => f.endsWith('.md')

/**
 * Handle GET /api/github/content/:type
 * @param type - Content type from URL
 * @returns JSON response with items array
 */
export const handleContentList = (type: string): Promise<Response> =>
  pipe(
    Effect.tryPromise(() => listFilesUnder(contentBase(type))),
    Effect.map(files => files.filter(isMd)),
    Effect.flatMap(mdFiles =>
      Effect.forEach(mdFiles, f => buildItem(type, f))
    ),
    Effect.map(items => jsonResponse({ items })),
    Effect.runPromise
  )
