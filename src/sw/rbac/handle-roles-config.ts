import { Schema } from 'effect'
import { RolesConfigSchema } from '@/validation/schemas/roles'
import { readRepoFile } from '../git/io/read-file'
import { writeAndStage } from '../git/io/write-file'
import { commitAndPush } from '../git/remote/commit-and-push'
import { errorResponse, jsonResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import { loadRoles, resolveRole } from './resolve-role'

const ROLES_PATH = '.admin/roles.json'

/**
 * Handle GET /api/github/roles — return full roles config.
 * @returns JSON response with roles config
 */
export const handleGetRoles = async (): Promise<Response> => {
  const username = workerState.config?.username
  const role = username ? resolveRole(username) : undefined
  if (role !== 'admin') return errorResponse('Admin only', 403)
  try {
    const raw = await readRepoFile(ROLES_PATH)
    return jsonResponse(JSON.parse(raw))
  } catch {
    return jsonResponse({
      roles: { editor: [], 'chief-editor': [], admin: [] },
    })
  }
}

/**
 * Handle POST /api/github/roles — update roles config.
 * @param request - Incoming Request with roles JSON
 * @returns JSON response with success
 */
export const handleUpdateRoles = async (
  request: Request
): Promise<Response> => {
  const username = workerState.config?.username
  const role = username ? resolveRole(username) : undefined
  if (role !== 'admin') return errorResponse('Admin only', 403)
  try {
    const body: unknown = await request.json()
    Schema.decodeUnknownSync(RolesConfigSchema)(body)
    const content = `${JSON.stringify(body, undefined, 2)}\n`
    await writeAndStage(ROLES_PATH, content)
    await commitAndPush('admin: update roles')
    await loadRoles()
    return jsonResponse({ success: true })
  } catch {
    return errorResponse('Invalid roles config', 400)
  }
}
