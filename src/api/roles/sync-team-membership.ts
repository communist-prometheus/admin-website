/*
 * KV role assignment → GitHub team membership sync.
 *
 * The KV role map controls what the app allows the user to do in the
 * admin UI. It does NOT grant push access to the content repo — that
 * comes from GitHub team membership, because content edits are pushed
 * with the caller's own OAuth token via isomorphic-git.
 *
 * When an admin changes a login's role we mirror it into GitHub team
 * membership so the caller can actually push:
 *   editor       → member of `editors`, removed from `chief-editors`
 *   chief-editor → member of `chief-editors`, removed from `editors`
 *   admin        → removed from both (admins are org-level)
 *   none         → removed from both
 */

import type { RoleAssignment } from './role-map'
import {
  deleteTeamMembership,
  putTeamMembership,
} from './team-membership-api'
import { requireDelete, requirePut } from './team-response-guards'

const TEAM_SLUGS = {
  editor: 'editors',
  'chief-editor': 'chief-editors',
} as const

type TeamKey = keyof typeof TEAM_SLUGS
const ALL_TEAM_SLUGS = Object.values(TEAM_SLUGS)

const targetTeam = (role: RoleAssignment): TeamKey | undefined =>
  role === 'editor' || role === 'chief-editor' ? role : undefined

const applyKeep = async (
  token: string,
  login: string,
  keepSlug: string | undefined
): Promise<void> =>
  keepSlug === undefined
    ? undefined
    : requirePut(await putTeamMembership(token, keepSlug, login), keepSlug)

const removeFromOthers = async (
  token: string,
  login: string,
  keepSlug: string | undefined
): Promise<void> => {
  const toDrop = ALL_TEAM_SLUGS.filter(slug => slug !== keepSlug)
  await Promise.all(
    toDrop.map(slug =>
      deleteTeamMembership(token, slug, login).then(res =>
        requireDelete(res, slug)
      )
    )
  )
}

/**
 * Sync GitHub team membership to match a KV role assignment.
 *
 * @param token Admin caller's OAuth token; admin:org scope required.
 * @param login GitHub login whose membership is being aligned.
 * @param role The role now written to KV.
 * @returns Resolves once every membership PUT/DELETE settles OK.
 * @throws Error with a `status ...` prefix when GitHub rejects a call.
 */
export const syncTeamMembership = async (
  token: string,
  login: string,
  role: RoleAssignment
): Promise<void> => {
  const target = targetTeam(role)
  const keepSlug = target ? TEAM_SLUGS[target] : undefined
  await applyKeep(token, login, keepSlug)
  await removeFromOthers(token, login, keepSlug)
}
