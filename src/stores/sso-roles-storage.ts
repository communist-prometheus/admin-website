const KEY = 'sso_roles'

const isStringArray = (x: unknown): x is readonly string[] =>
  Array.isArray(x) && x.every(item => typeof item === 'string')

/**
 * Read the persisted SSO roles list from localStorage. Returns an
 * empty array on first run, on a cleared cache, or on any parse
 * failure (corrupt value, wrong shape).
 * @returns Roles array previously written by {@link saveSsoRoles}.
 */
export const loadSsoRoles = (): readonly string[] => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw === null ? [] : parseRoles(raw)
  } catch {
    return []
  }
}

const parseRoles = (raw: string): readonly string[] => {
  try {
    const value: unknown = JSON.parse(raw)
    return isStringArray(value) ? value : []
  } catch {
    return []
  }
}

/**
 * Persist the SSO roles so the next app boot can resolve the
 * owner-gated nav synchronously, before `mintSession()` returns.
 * @param roles Roles to persist.
 */
export const saveSsoRoles = (roles: readonly string[]): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(roles))
  } catch {
    // Storage quota or disabled — degrade silently; next mint refills.
  }
}

/**
 * Remove the persisted SSO roles. Called from logout / clearSession.
 */
export const clearSsoRolesStorage = (): void => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Storage disabled — nothing to do.
  }
}
