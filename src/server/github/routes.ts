import { Effect } from 'effect'
import type { FastifyInstance } from 'fastify'
import type {
  ContentType,
  ContentUpdateRequest,
} from '@/types/github-content'
import type { GitHubClient } from './client'
import { createContentService } from './content-service'
import { MockContentService } from './mock-service'

/**
 * Register GitHub content API routes
 * @param fastify - Fastify instance
 */
export const registerGitHubContentRoutes = (fastify: FastifyInstance) => {
  const mockGithub = new MockContentService()
  const contentService = createContentService(
    mockGithub as unknown as GitHubClient,
    'src/content'
  )
  /**
   * GET /api/github/content/:type
   * List all content of a specific type
   */
  fastify.get<{
    Params: { type: ContentType }
  }>('/api/github/content/:type', async (request, reply) => {
    const { type } = request.params

    return Effect.runPromise(contentService.listContent(type))
      .then(items => reply.send({ items }))
      .catch(error => {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to list content' })
      })
  })

  /**
   * GET /api/github/content/:type/:slug/:lang
   * Get specific content item
   */
  fastify.get<{
    Params: { type: ContentType; slug: string; lang: string }
  }>('/api/github/content/:type/:slug/:lang', async (request, reply) => {
    const { type, slug, lang } = request.params

    return Effect.runPromise(contentService.getContent(type, slug, lang))
      .then(item => reply.send(item))
      .catch(error => {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to get content' })
      })
  })

  /**
   * POST /api/github/content
   * Create or update content
   */
  fastify.post<{
    Body: ContentUpdateRequest
  }>('/api/github/content', async (request, reply) => {
    const updateRequest = request.body

    return Effect.runPromise(contentService.updateContent(updateRequest))
      .then(result => reply.send(result))
      .catch(error => {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to update content' })
      })
  })

  /**
   * DELETE /api/github/content/:type/:slug/:lang
   * Delete content item
   */
  fastify.delete<{
    Params: { type: ContentType; slug: string; lang: string }
    Body: { sha: string }
  }>('/api/github/content/:type/:slug/:lang', async (request, reply) => {
    const { type, slug, lang } = request.params
    const { sha } = request.body

    return Effect.runPromise(
      contentService.deleteContent(type, slug, lang, sha)
    )
      .then(result => reply.send(result))
      .catch(error => {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to delete content' })
      })
  })
}
