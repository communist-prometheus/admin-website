import { listFilesUnder } from '../../git/io/list-files'
import { writeAndStage } from '../../git/io/write-file'
import { errorResponse, jsonResponse } from '../shared/json-response'

const FLAT_RE = /^(src\/content\/)([^/]+)\/([^/]+)\.(en|ru|it|es)\.md$/

/**
 * Resolve flat blog path to nested index path.
 * @param path - Flat path from client
 * @returns Resolved path (nested if blog) or original
 */
const resolveStage = async (path: string): Promise<string> => {
  const m = path.match(FLAT_RE)
  if (!m) return path
  const [, base, type, slug, lang] = m
  const nested = `${base}${type}/${slug}/index.${lang}.md`
  const files = await listFilesUnder(`${base}${type}`)
  return files.includes(nested) ? nested : path
}

/**
 * Handle PUT /api/github/file/stage — write + stage.
 * Resolves flat blog paths to nested location.
 * @param request - Incoming Request with { path, content }
 * @returns JSON response with { success, path }
 */
export const handleFileStage = async (
  request: Request
): Promise<Response> => {
  const { path, content } = await request.json()
  if (!path || content === undefined) {
    return errorResponse('Path and content are required', 400)
  }

  const resolved = await resolveStage(path)
  await writeAndStage(resolved, content)
  return jsonResponse({ success: true, path: resolved })
}
