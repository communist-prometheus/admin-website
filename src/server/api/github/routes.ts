import { handleCreateFile } from './handlers/create-file'
import { handleGetFile } from './handlers/get-file'
import { handleGetTree } from './handlers/tree'
import { handleUpdateFile } from './handlers/update-file'

const API_GITHUB_FILE_PATH = '/api/github/file'

/**
 * Register GitHub API routes
 * @param fastify - Fastify instance
 * @param fastify.get - GET route handler
 * @param fastify.post - POST route handler
 * @param fastify.put - PUT route handler
 */
export const registerGitHubApiRoutes = (fastify: {
  get: (path: string, handler: unknown) => void
  post: (path: string, handler: unknown) => void
  put: (path: string, handler: unknown) => void
}) => {
  fastify.get('/api/github/tree', handleGetTree)
  fastify.get(API_GITHUB_FILE_PATH, handleGetFile)
  fastify.put(API_GITHUB_FILE_PATH, handleUpdateFile)
  fastify.post(API_GITHUB_FILE_PATH, handleCreateFile)
}
