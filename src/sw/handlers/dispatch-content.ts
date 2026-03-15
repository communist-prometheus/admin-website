import { handleContentDelete } from './content-delete'
import { handleContentDeleteAll } from './content-delete-all'
import { handleContentGet } from './content-get'
import { handleContentList } from './content-list'
import type {
  ContentItemMatch,
  ContentListMatch,
  ContentSlugMatch,
} from './match-content'

type Match = ContentListMatch | ContentItemMatch | ContentSlugMatch

/**
 * Dispatch a matched content route to its handler.
 * @param match - Matched route info
 * @param method - HTTP method
 * @param request - Original Request
 * @returns Response or undefined
 */
export const dispatchContent = (
  match: Match,
  method: string,
  request: Request
): Promise<Response> | undefined => {
  if (match.kind === 'list' && method === 'GET')
    return handleContentList(match.type)
  if (match.kind === 'item' && method === 'GET')
    return handleContentGet(match.type, match.slug, match.lang)
  if (match.kind === 'item' && method === 'DELETE')
    return handleContentDelete(match.type, match.slug, match.lang, request)
  if (match.kind === 'slug' && method === 'DELETE')
    return handleContentDeleteAll(match.type, match.slug)
  return undefined
}
