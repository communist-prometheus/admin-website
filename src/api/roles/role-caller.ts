import type { Role } from '../../types/role'
import { type RoleMap, resolveFromMap } from './role-map'

const GH = 'https://api.github.com'
const ORG = 'communist-prometheus'

interface Membership {
  readonly orgAdmin: boolean
  readonly login: string
}

/** Caller's resolved identity + effective app role. */
export interface Caller {
  readonly role: Role | undefined
  readonly username: string
}

/**
 * Read the caller's org membership with THEIR OWN token (state they
 * cannot forge) — the confused-deputy source of truth.
 * @param token - Caller's GitHub OAuth token.
 * @returns Membership facts, or undefined when not an active member.
 */
const callerMembership = async (
  token: string
): Promise<Membership | undefined> => {
  const res = await fetch(`${GH}/user/memberships/orgs/${ORG}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      // GitHub's API rejects requests without a User-Agent (403). CF
      // Workers' fetch does not set one, so it must be explicit here.
      'User-Agent': 'prometheus-admin',
    },
  })
  const body = await res.json().catch(() => ({}))
  return res.ok && body?.state === 'active'
    ? { orgAdmin: body.role === 'admin', login: body.user?.login ?? '' }
    : undefined
}

/**
 * Resolve the caller's effective role: org admins are always `admin`;
 * otherwise the highest grant in the KV map. Undefined when the caller
 * is not an active org member.
 * @param map - The role grant map from KV.
 * @param token - Caller's GitHub OAuth token.
 * @returns Resolved caller, or undefined for non-members.
 */
export const resolveCaller = async (
  map: RoleMap,
  token: string
): Promise<Caller | undefined> => {
  const m = await callerMembership(token)
  return m === undefined
    ? undefined
    : {
        username: m.login,
        role: m.orgAdmin ? 'admin' : resolveFromMap(map, m.login),
      }
}
