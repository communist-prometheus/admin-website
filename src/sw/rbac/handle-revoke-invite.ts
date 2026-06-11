import { Match } from 'effect'
import { errorResponse, jsonResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import { API, ghHeaders } from './github-api'
import { requireAdmin } from './require-admin'

const remote = async (
  owner: string,
  token: string,
  id: string
): Promise<Response> => {
  const r = await fetch(`${API}/orgs/${owner}/invitations/${id}`, {
    method: 'DELETE',
    headers: ghHeaders(token),
  })
  return r.ok
    ? jsonResponse({ success: true })
    : errorResponse(`github ${r.status}`, r.status)
}

/**
 * Handle DELETE /api/github/org-invite/:id — revoke a pending
 * invitation by id.
 *
 * @param id invitation id in the URL path
 * @returns 200 success, error otherwise
 */
export const handleRevokeInvite = async (id: string): Promise<Response> =>
  Match.value(workerState.config).pipe(
    Match.when(undefined, () =>
      Promise.resolve(errorResponse('SW not initialised', 503))
    ),
    Match.orElse(async cfg =>
      __MOCK_MODE__ || cfg.mock
        ? jsonResponse({ success: true })
        : (requireAdmin() ?? remote(cfg.owner, cfg.token, id))
    )
  )
