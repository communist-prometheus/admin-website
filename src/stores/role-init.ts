import { useRoleStore } from './role'

/**
 * Load the user's role from the SW after init completes.
 * Called from syncTokenToSW after SW is ready.
 */
export const loadRoleAfterInit = (): void => {
  try {
    const store = useRoleStore()
    store.loadRole().catch(() => {})
  } catch {
    // Pinia not yet initialized — skip
  }
}
