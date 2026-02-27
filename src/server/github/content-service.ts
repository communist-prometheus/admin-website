import { Effect } from 'effect'
import type {
  ContentFrontmatter,
  ContentItem,
  ContentType,
  ContentUpdateRequest,
} from '@/types/github-content'
import type { GitHubClient } from './client'

/**
 * Parse frontmatter and body from markdown content
 */
export const parseFrontmatter = (
  content: string
): { frontmatter: Record<string, unknown>; body: string } => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const [, frontmatterStr, body] = match

  if (!frontmatterStr || !body) {
    return { frontmatter: {}, body: content }
  }

  const frontmatter: Record<string, unknown> = {}

  for (const line of frontmatterStr.split('\n')) {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim()
      frontmatter[key.trim()] = value
    }
  }

  return { frontmatter, body: body.trim() }
}

/**
 * Serialize frontmatter and body to markdown
 */
export const serializeFrontmatter = (
  frontmatter: ContentFrontmatter,
  body: string
): string => {
  const lines = ['---']

  for (const [key, value] of Object.entries(frontmatter)) {
    if (value !== undefined) {
      lines.push(`${key}: ${value}`)
    }
  }

  lines.push('---', '', body)
  return lines.join('\n')
}

/**
 * Create content service
 */
export const createContentService = (
  github: GitHubClient,
  contentPath: string
) => ({
  /**
   * List all content items of a specific type
   */
  listContent: (type: ContentType) =>
    Effect.gen(function* () {
      const files = yield* github.listContent(type)

      const items: ContentItem[] = []

      for (const file of files) {
        const fileData = yield* github.getFile(file.path)
        const { frontmatter, body } = parseFrontmatter(fileData.content)

        const slug = file.name.replace(/\.(en|ru|it|es)\.md$/, '')

        items.push({
          type,
          slug,
          path: file.path,
          frontmatter: frontmatter as unknown as ContentFrontmatter,
          body,
          sha: fileData.sha,
        })
      }

      return items
    }),

  /**
   * Get a specific content item
   * @param type - Content type
   * @param slug - Content slug
   * @param lang - Content language
   * @returns Effect with content item
   */
  getContent: (type: ContentType, slug: string, lang: string) =>
    Effect.gen(function* () {
      const path = `${contentPath}/${type}/${slug}.${lang}.md`
      const fileData = yield* github.getFile(path)
      const { frontmatter, body } = parseFrontmatter(fileData.content)

      return {
        type,
        slug,
        path,
        frontmatter: frontmatter as unknown as ContentFrontmatter,
        body,
        sha: fileData.sha,
      } satisfies ContentItem
    }),

  /**
   * Create or update content
   * @param request - Content update request
   * @returns Effect with update result
   */
  updateContent: (request: ContentUpdateRequest) =>
    Effect.gen(function* () {
      const path = `${contentPath}/${request.type}/${request.slug}.${request.lang}.md`
      const content = serializeFrontmatter(request.frontmatter, request.body)

      yield* github.updateFile(path, content, request.message, request.sha)

      return { success: true, path }
    }),

  /**
   * Delete content
   */
  deleteContent: (
    type: ContentType,
    slug: string,
    lang: string,
    sha: string
  ) =>
    Effect.gen(function* () {
      const path = `${contentPath}/${type}/${slug}.${lang}.md`
      yield* github.deleteFile(path, `Delete ${type}/${slug}.${lang}.md`, sha)

      return { success: true, path }
    }),
})
