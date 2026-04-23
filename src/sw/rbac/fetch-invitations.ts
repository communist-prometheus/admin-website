import { API, ghJson } from './github-api'
import {
  normaliseInvite,
  type RawInvite,
  type TeamRef,
  teamSlugById,
} from './invitation-map'
import type { OrgInvitation } from './org-members-types'

/**
 * Load pending org invitations and normalise the role attached to
 * each to the app's role vocabulary (`admin` / `chief-editor` /
 * `editor`). Requires `admin:org` on the token.
 *
 * @param owner org login
 * @param token OAuth bearer with admin:org
 * @returns pending invitations, empty list on failure
 */
export const loadInvitations = async (
  owner: string,
  token: string
): Promise<readonly OrgInvitation[]> => {
  const teams = await ghJson<readonly TeamRef[]>(
    `${API}/orgs/${owner}/teams?per_page=100`,
    token
  ).catch(() => [])
  const slugById = teamSlugById(teams)
  const invites = await ghJson<readonly RawInvite[]>(
    `${API}/orgs/${owner}/invitations?per_page=100`,
    token
  ).catch(() => [])
  return invites.map(i => normaliseInvite(i, slugById))
}
