import { Effect } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createGitHubService } from '@/server/services/github'

interface FileParams {
  path: string
}

/**
 * Get file content
 */
export const handleGetFile = async (
  request: FastifyRequest<{ Querystring: FileParams }>,
  reply: FastifyReply
) => {
  // @ts-expect-error - fastify-session typing issue
  const token = request.session.github_token

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
