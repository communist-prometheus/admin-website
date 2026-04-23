import { appRoleFor } from './app-role-for'
import { loadInvitations } from './fetch-invitations'
import { loadOrgMembers } from './fetch-org-members'
import { loadTeamMembers } from './fetch-team-members'
import { setOrgAdmins } from './org-admin-cache'
import type {
  OrgInvitation,
  OrgMember,
  OrgMembersPayload,
} from './org-members-types'

/**
 * Hit GitHub in parallel for org members, team rosters, and
 * invitations, then tag each member with their app role.
 *
 * @param owner org login
 * @param token OAuth bearer
 * @returns enriched payload
 */
export const resolveFromGitHub = async (
  owner: string,
  token: string
): Promise<OrgMembersPayload> => {
  const [members, teams, invitations] = await Promise.all([
    loadOrgMembers(owner, token),
    loadTeamMembers(owner, token),
    loadInvitations(owner, token),
  ])
  return {
    members: members.map(m => ({
      ...m,
      appRole: appRoleFor(m.login, m.orgRole, teams),
    })),
    invitations,
  }
}

/**
 * Wrap `resolveFromGitHub` with a catch that clears the admin
 * cache and returns an empty payload so the API never 500s.
 *
 * @param owner org login
 * @param token OAuth bearer
 * @returns payload, empty on failure
 */
export const resolveOrEmpty = async (
  owner: string,
  token: string
): Promise<OrgMembersPayload> =>
  resolveFromGitHub(owner, token).catch(() => {
    setOrgAdmins([])
    return {
      members: [] as readonly OrgMember[],
      invitations: [] as readonly OrgInvitation[],
    }
  })
