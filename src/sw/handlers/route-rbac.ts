import { Option } from 'effect'
import { handleRevokeInvite } from '../rbac/handle-invite'
import { namedRbacRoute } from './route-rbac-named'

const INVITE_RE = /^\/api\/github\/org-invite\/(\d+)$/

const revokeFrom = (path: string, method: string): Option.Option<string> =>
  Option.fromNullable(
    method === 'DELETE' ? (path.match(INVITE_RE)?.[1] ?? null) : null
  )

/**
 * Match an incoming RBAC-namespace request to its handler. Tries
 * static routes first; falls through to the dynamic
 * `DELETE /org-invite/:id` revoke pattern.
 *
 * @param path URL pathname
 * @param method HTTP method
 * @param request original request
 * @returns optional promise of a response
 */
export const matchRbacRoute = (
  path: string,
  method: string,
  request: Request
): Option.Option<Promise<Response>> => {
  const hit = namedRbacRoute(`${method} ${path}`, request)
  return Option.match(hit, {
    onSome: p => Option.some(p),
    onNone: () => Option.map(revokeFrom(path, method), handleRevokeInvite),
  })
}
