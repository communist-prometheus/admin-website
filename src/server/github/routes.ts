import { Effect } from 'effect'
import type { FastifyInstance } from 'fastify'
import type {
  ContentType,
  ContentUpdateRequest,
} from '@/types/github-content'
import { getSessionUser } from '../auth/session'
import type { GitHubClient } from './client'
import { createGitHubClient } from './client'
import { loadGitHubConfig } from './config'
import { createContentService } from './content-service'
import { MockContentService } from './mock-service'

/**
 * Register GitHub content API routes
 * @param fastify - Fastify instance
 */
export const registerGitHubContentRoutes = (fastify: FastifyInstance) => {
  const baseConfig = loadGitHubConfig()

  const getContentService = (accessToken?: string) => {
    const useMock = process.env.NODE_ENV === 'test' || !accessToken

    const githubClient: GitHubClient = useMock
      ? (new MockContentService() as unknown as GitHubClient)
      : createGitHubClient({ ...baseConfig, token: accessToken || '' })

    return createContentService(githubClient, baseConfig.contentPath)
  }
  /**
   * GET /api/github/content/:type
   * List all content of a specific type
   */
  fastify.get<{
    Params: { type: ContentType }
  }>('/api/github/content/:type', async (request, reply) => {
    const { type } = request.params
    const user = getSessionUser(request)
    const contentService = getContentService(user?.accessToken)

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
    const user = getSessionUser(request)
    const contentService = getContentService(user?.accessToken)

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
    const user = getSessionUser(request)
    const contentService = getContentService(user?.accessToken)

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
    const user = getSessionUser(request)
    const contentService = getContentService(user?.accessToken)

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
