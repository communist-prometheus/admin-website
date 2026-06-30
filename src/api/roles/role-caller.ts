import type { Role } from '../../types/role'
import { ghGet } from './gh-fetch'
import { type RoleMap, resolveFromMap } from './role-map'

const ORG = 'communist-prometheus'

/** Caller's resolved identity + effective app role. */
export interface Caller {
  readonly role: Role | undefined
  readonly username: string
}

const callerLogin = async (token: string): Promise<string | undefined> => {
  const res = await ghGet(token, '/user')
  const body = await res.json().catch(() => ({}))
  return res.ok ? (body?.login ?? undefined) : undefined
}

const callerIsOrgAdmin = async (token: string): Promise<boolean> => {
  const res = await ghGet(token, `/user/memberships/orgs/${ORG}`)
  const body = await res.json().catch(() => ({}))
  return res.ok && body?.state === 'active' && body?.role === 'admin'
}

/**
 * Resolve the caller's effective role. Identity comes from `GET /user`
 * — the caller's own, unforgeable login, which needs no `read:org`
 * scope — and the role is their KV grant. Only the "unlisted org admin"
 * fallback consults org membership, so an editor explicitly granted in
 * KV resolves even when their token can't read org membership.
 * @param map - The role grant map from KV.
 * @param token - Caller's GitHub OAuth token.
 * @returns Resolved caller, or undefined for an invalid token.
 */
export const resolveCaller = async (
  map: RoleMap,
  token: string
): Promise<Caller | undefined> => {
  const login = await callerLogin(token)
  return login === undefined
    ? undefined
    : {
        username: login,
        role:
          resolveFromMap(map, login) ??
          ((await callerIsOrgAdmin(token)) ? 'admin' : undefined),
      }
}
