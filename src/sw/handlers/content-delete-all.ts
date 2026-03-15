import { commitAndPush } from '../git/commit-and-push'
import { deleteAndUnstage } from '../git/delete-git-file'
import { listFilesUnder } from '../git/list-files'
import { workerState } from '../state'
import { errorResponse, jsonResponse } from './json-response'

/**
 * Delete ALL language versions of a content slug.
 * @param type - Content type
 * @param slug - Content slug
 * @returns JSON response
 */
export const handleContentDeleteAll = async (
  type: string,
  slug: string
): Promise<Response> => {
  const base = workerState.config?.contentPath ?? 'src/content'
  const prefix = `${base}/${type}`
  const all = await listFilesUnder(prefix)
  const matching = findSlugFiles(all, type, slug)

  if (matching.length === 0)
    return errorResponse(`No files for ${type}/${slug}`, 404)

  for (const f of matching) await deleteAndUnstage(f)
  await commitAndPush(`Delete all versions of ${type}/${slug}`)
  return jsonResponse({ success: true, deleted: matching.length })
}

/**
 * Find files belonging to a slug regardless of layout.
 * @param files - All files under the type dir
 * @param type - Content type
 * @param slug - Slug to match
 * @returns Matching file paths
 */
const findSlugFiles = (
  files: readonly string[],
  type: string,
  slug: string
): readonly string[] =>
  type === 'blog'
    ? files.filter(f => f.includes(`/${slug}/`))
    : files.filter(f => {
        const name = f.split('/').pop() ?? ''
        return name.startsWith(`${slug}.`) && name.endsWith('.md')
      })
