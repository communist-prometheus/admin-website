import { Effect } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getSessionUser } from '../../../auth/session'
import { createGitHubService } from '../../../services/github/index'

interface TreeParams {
  path?: string
}

/**
 * Get file tree
 * @param request - Fastify request with path query
 * @param reply - Fastify reply
 * @returns Promise with tree data
 */
export const handleGetTree = async (
  request: FastifyRequest<{ Querystring: TreeParams }>,
  reply: FastifyReply
) => {
  const user = getSessionUser(request)
  const token = user?.accessToken

  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const path = request.query.path || 'src/content'

  const program = Effect.gen(function* () {
    const service = yield* createGitHubService(token)
    return yield* service.getTree(path)
  })

  return Effect.runPromise(program)
    .then(tree => reply.send(tree))
    .catch(error =>
      reply.status(500).send({ error: (error as Error).message })
    )
}
