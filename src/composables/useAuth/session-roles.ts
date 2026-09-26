/**
 * The seam between minting an SSO session and whatever UI layer cares about
 * the roles it returned.
 *
 * `mintSession` used to call `useAuthStore().setSsoRoles(...)` directly.
 * That single line put `pinia` and `vue` on the import graph of every caller
 * — including the rebuilt admin, a Lit app with no store, which therefore
 * shipped a framework it does not use. The mint announces; the layer that
 * wants the roles subscribes.
 */

/** Notified with the roles a successful mint returned. */
export type SsoRolesListener = (roles: readonly string[]) => void

let listener: SsoRolesListener | undefined

/**
 * Register the single listener for freshly minted roles, replacing any
 * previous one. Registering twice is a re-registration, not a second
 * subscriber: there is exactly one UI layer to inform.
 * @param next Callback to receive the roles.
 */
export const onSsoRoles = (next: SsoRolesListener): void => {
  listener = next
}

/** Drop the listener (logout, teardown, tests). */
export const resetSsoRolesListener = (): void => {
  listener = undefined
}

/**
 * Announce the roles a mint returned. A listener that throws must never
 * fail the mint — the session is already valid by the time this runs.
 * @param roles Roles carried by the minted session.
 */
export const notifySsoRoles = (roles: readonly string[]): void => {
  try {
    listener?.(roles)
  } catch {
    // UI not ready (early boot) — the next mint refills, and the roles are
    // persisted independently for the next start.
  }
}
