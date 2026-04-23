import { Match } from 'effect'
import { errorResponse, jsonResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import { mockOrgMembers } from './org-members-mock'
import { resolveOrEmpty } from './org-members-resolve'

/**
 * Handle GET /api/github/org-members — return every org member
 * enriched with their app role (admin / chief-editor / editor /
 * none) plus every pending invitation.
 *
 * @returns JSON payload { members, invitations }
 */
export const handleGetOrgMembers = async (): Promise<Response> =>
  Match.value(workerState.config).pipe(
    Match.when(undefined, () =>
      Promise.resolve(errorResponse('SW not initialised', 503))
    ),
    Match.orElse(async cfg =>
      jsonResponse(
        __MOCK_MODE__ || cfg.mock
          ? mockOrgMembers()
          : await resolveOrEmpty(cfg.owner, cfg.token)
      )
    )
  )
