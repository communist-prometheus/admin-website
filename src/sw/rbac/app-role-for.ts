import { Match } from 'effect'
import type { OrgMember } from './org-members-types'
import type { TeamRole } from './team-slugs'

/**
 * Compute the app-role for one member from their GitHub org role
 * and team memberships. Admins in GitHub become `admin`;
 * reserved team memberships promote to `chief-editor` / `editor`;
 * otherwise undefined (no app role).
 *
 * @param login GitHub login (case-insensitive)
 * @param orgRole role on the GitHub organisation
 * @param teams team-member sets indexed by TeamRole
 * @returns app role or undefined
 */
export const appRoleFor = (
  login: string,
  orgRole: OrgMember['orgRole'],
  teams: Readonly<Record<TeamRole, ReadonlySet<string>>>
): OrgMember['appRole'] =>
  Match.value({
    orgRole,
    chief: teams['chief-editor'].has(login.toLowerCase()),
    editor: teams.editor.has(login.toLowerCase()),
  }).pipe(
    Match.when({ orgRole: 'admin' }, () => 'admin' as const),
    Match.when({ chief: true }, () => 'chief-editor' as const),
    Match.when({ editor: true }, () => 'editor' as const),
    Match.orElse(() => undefined)
  )
