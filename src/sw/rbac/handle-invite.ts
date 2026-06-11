import { Match } from 'effect'
import { errorResponse, jsonResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import type { InviteBody } from './invite-build'
import { runInviteFromBody } from './invite-post'
import { requireAdmin } from './require-admin'

const MOCK_OK = { id: 1, role: 'direct_member', email: 'mock@example.com' }

/**
 * Handle POST /api/github/org-invite — create a pending invitation
 * with the requested app role. Accepts email OR GitHub login.
 *
 * @param request incoming request with { email? | login?, role }
 * @returns invitation JSON or error
 */
export const handleInvite = async (request: Request): Promise<Response> =>
  Match.value(workerState.config).pipe(
    Match.when(undefined, () =>
      Promise.resolve(errorResponse('SW not initialised', 503))
    ),
    Match.orElse(async cfg =>
      __MOCK_MODE__ || cfg.mock
        ? jsonResponse(MOCK_OK)
        : (requireAdmin() ??
          runInviteFromBody(
            cfg.owner,
            cfg.token,
            (await request.json()) as Partial<InviteBody>
          ))
    )
  )

export { handleRevokeInvite } from './handle-revoke-invite'
