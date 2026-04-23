import { Match, Option } from 'effect'
import { handleInvite } from '../rbac/handle-invite'
import { handleGetOrgMembers } from '../rbac/handle-org-members'
import { handleGetRole } from '../rbac/handle-role'
import {
  handleGetRoles,
  handleUpdateRoles,
} from '../rbac/handle-roles-config'
import { handleSetRole } from '../rbac/handle-set-role'

/**
 * Match an HTTP method+path pair against the static RBAC routes.
 * Non-matches fall through to the caller (which handles the
 * `/org-invite/:id` revoke route separately).
 *
 * @param key string in the shape "METHOD /path"
 * @param request original request
 * @returns promise of response on a match, none otherwise
 */
export const namedRbacRoute = (
  key: string,
  request: Request
): Option.Option<Promise<Response>> =>
  Match.value(key).pipe(
    Match.when('GET /api/github/role', () =>
      Option.some(Promise.resolve(handleGetRole()))
    ),
    Match.when('GET /api/github/org-members', () =>
      Option.some(handleGetOrgMembers())
    ),
    Match.when('POST /api/github/org-role', () =>
      Option.some(handleSetRole(request))
    ),
    Match.when('POST /api/github/org-invite', () =>
      Option.some(handleInvite(request))
    ),
    Match.when('GET /api/github/roles', () =>
      Option.some(Promise.resolve(handleGetRoles()))
    ),
    Match.when('POST /api/github/roles', () =>
      Option.some(handleUpdateRoles(request))
    ),
    Match.orElse(() => Option.none<Promise<Response>>())
  )
