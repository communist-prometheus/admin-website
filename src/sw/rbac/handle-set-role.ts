import { Match, Option } from 'effect'
import { errorResponse, jsonResponse } from '../handlers/shared/json-response'
import { workerState } from '../state/state'
import { applyRole, type SetRoleBody } from './org-role-ops'

const validate = (body: Partial<SetRoleBody>): Option.Option<SetRoleBody> =>
  body.login && body.role
    ? Option.some(body as SetRoleBody)
    : Option.none<SetRoleBody>()

const runChange = async (
  owner: string,
  token: string,
  body: SetRoleBody
): Promise<Response> =>
  applyRole(owner, token, body)
    .then(() => jsonResponse({ success: true }))
    .catch(e => errorResponse(`Role change failed: ${String(e)}`, 500))

const handleBody = async (
  owner: string,
  token: string,
  raw: Partial<SetRoleBody>
): Promise<Response> =>
  Option.match(validate(raw), {
    onNone: () => errorResponse('login and role required', 400),
    onSome: b => runChange(owner, token, b),
  })

/**
 * Handle POST /api/github/org-role — change the app role for a
 * user by moving them between reserved GitHub teams and, when
 * needed, promoting/demoting their org role.
 *
 * @param request incoming request with { login, role }
 * @returns 200 success, 400 bad payload, 503 when SW not initialised
 */
export const handleSetRole = async (request: Request): Promise<Response> =>
  Match.value(workerState.config).pipe(
    Match.when(undefined, () =>
      Promise.resolve(errorResponse('SW not initialised', 503))
    ),
    Match.orElse(async c =>
      __MOCK_MODE__ || c.mock
        ? jsonResponse({ success: true })
        : handleBody(
            c.owner,
            c.token,
            (await request.json()) as Partial<SetRoleBody>
          )
    )
  )
