let cachedAdmins: ReadonlySet<string> = new Set()

/**
 * Replace the cached set of GitHub-org admin logins.
 *
 * @param admins case-insensitive admin usernames
 */
export const setOrgAdmins = (admins: readonly string[]): void => {
  cachedAdmins = new Set(admins.map(a => a.toLowerCase()))
}

/**
 * Check whether the current GitHub session user is a GitHub org
 * admin. Case-insensitive.
 *
 * @param username GitHub login to check
 * @returns true when the username is in the cached org-admin set
 */
export const isOrgAdmin = (username: string): boolean =>
  cachedAdmins.has(username.toLowerCase())
