import { Effect } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getSessionUser } from '../../../auth/session'
import { createGitHubService } from '../../../services/github/index'

interface UpdateFileBody {
  path: string
  content: string
  sha: string
  message: string
}

/**
 * Update file content
 * @param request - Fastify request with file update body
 * @param reply - Fastify reply
 * @returns Promise with update result
 */
export const handleUpdateFile = async (
  request: FastifyRequest<{
    Body: UpdateFileBody
  }>,
  reply: FastifyReply
) => {
  const user = getSessionUser(request)
  const token = user?.accessToken

  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const { path, content, sha, message } = request.body

  if (!path || !content || !sha || !message) {
    return reply.status(400).send({ error: 'Missing required fields' })
  }

  const program = Effect.gen(function* () {
    const service = yield* createGitHubService(token)
    return yield* service.updateFile(path, content, sha, message)
  })

  return Effect.runPromise(program)
    .then(result => reply.send(result))
    .catch(error =>
      reply.status(500).send({ error: (error as Error).message })
    )
}
