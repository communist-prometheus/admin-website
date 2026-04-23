/** Reserved GitHub team slugs used as the mapping for app roles. */
export const TEAM_SLUGS = {
  'chief-editor': 'chief-editors',
  editor: 'editors',
} as const

/** App roles that map to a GitHub team (admin maps to org level). */
export type TeamRole = keyof typeof TEAM_SLUGS

/**
 * Resolve the team slug on the GitHub org that maps to a given app
 * role. Returns undefined for `admin` (org-level, not a team) and
 * for unknown roles.
 *
 * @param role app role name
 * @returns team slug or undefined
 */
export const teamSlugFor = (role: string): string | undefined =>
  role in TEAM_SLUGS ? TEAM_SLUGS[role as TeamRole] : undefined
