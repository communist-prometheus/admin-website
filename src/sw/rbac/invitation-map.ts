import type { OrgInvitation } from './org-members-types'
import { TEAM_SLUGS, type TeamRole } from './team-slugs'

/** Raw GitHub invitation payload shape (subset we consume). */
export interface RawInvite {
  readonly id: number
  readonly login?: string | null
  readonly email?: string | null
  readonly role: string
  readonly inviter?: { readonly login?: string } | null
  readonly team_ids?: readonly number[]
}

/** Raw GitHub team reference. */
export interface TeamRef {
  readonly id: number
  readonly slug: string
}

/**
 * Build a lookup from team id to team slug.
 *
 * @param teams raw team refs from GitHub
 * @returns id → slug map
 */
export const teamSlugById = (
  teams: readonly TeamRef[]
): ReadonlyMap<number, string> => new Map(teams.map(t => [t.id, t.slug]))

const appRole = (
  invite: RawInvite,
  slugById: ReadonlyMap<number, string>
): OrgInvitation['role'] => {
  const teamSlugs = (invite.team_ids ?? []).map(id => slugById.get(id))
  const role = (Object.keys(TEAM_SLUGS) as readonly TeamRole[]).find(r =>
    teamSlugs.includes(TEAM_SLUGS[r])
  )
  return invite.role === 'admin' ? 'admin' : (role ?? 'editor')
}

/**
 * Convert a raw GitHub invitation payload into the app's
 * `OrgInvitation` shape, mapping the team membership back to the
 * application's role vocabulary.
 *
 * @param raw invitation as returned by GitHub
 * @param slugById lookup from team id to slug
 * @returns normalised invitation
 */
export const normaliseInvite = (
  raw: RawInvite,
  slugById: ReadonlyMap<number, string>
): OrgInvitation => ({
  id: raw.id,
  login: raw.login ?? undefined,
  email: raw.email ?? undefined,
  role: appRole(raw, slugById),
  inviter: raw.inviter?.login ?? undefined,
})
