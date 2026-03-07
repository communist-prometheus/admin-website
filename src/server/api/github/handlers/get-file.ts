import { Effect } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getSessionUser } from '../../../auth/session'
import { createGitHubService } from '../../../services/github/index'

interface FileParams {
  path: string
}

/**
 * Get file content
 * @param request - Fastify request with path query
 * @param reply - Fastify reply
 * @returns Promise with file content
 */
export const handleGetFile = async (
  request: FastifyRequest<{ Querystring: FileParams }>,
  reply: FastifyReply
) => {
  const user = getSessionUser(request)
  const token = user?.accessToken

  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const { path } = request.query

  if (!path) {
    return reply.status(400).send({ error: 'Path is required' })
  }

  const program = Effect.gen(function* () {
    const service = yield* createGitHubService(token)
    return yield* service.getFileContent(path)
  })

  return Effect.runPromise(program)
    .then(file => reply.send(file))
    .catch(error =>
      reply.status(500).send({ error: (error as Error).message })
    )
}
