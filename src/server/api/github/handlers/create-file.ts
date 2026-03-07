import { Effect } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getSessionUser } from '../../../auth/session'
import { createGitHubService } from '../../../services/github/index'

interface CreateFileBody {
  path: string
  content: string
  message: string
}

/**
 * Create new file
 * @param request - Fastify request with file creation body
 * @param reply - Fastify reply
 * @returns Promise with creation result
 */
export const handleCreateFile = async (
  request: FastifyRequest<{
    Body: CreateFileBody
  }>,
  reply: FastifyReply
) => {
  const user = getSessionUser(request)
  const token = user?.accessToken

  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const { path, content, message } = request.body

  if (!path || !content || !message) {
    return reply.status(400).send({ error: 'Missing required fields' })
  }

  const program = Effect.gen(function* () {
    const service = yield* createGitHubService(token)
    return yield* service.createFile(path, content, message)
  })

  return Effect.runPromise(program)
    .then(result => reply.send(result))
    .catch(error =>
      reply.status(500).send({ error: (error as Error).message })
    )
}
