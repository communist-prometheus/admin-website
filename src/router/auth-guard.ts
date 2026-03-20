import type { Router } from 'vue-router'
import { loadToken } from '@/composables/useAuth/token-storage'

const REDIRECT_KEY = 'auth_redirect'

/**
 * Save intended destination for post-login redirect.
 * @param path - The path user tried to access
 */
export const saveRedirect = (path: string): void => {
  localStorage.setItem(REDIRECT_KEY, path)
}

/**
 * Load and clear saved redirect path.
 * @returns Saved path or undefined
 */
export const loadRedirect = (): string | undefined => {
  const path = localStorage.getItem(REDIRECT_KEY) ?? undefined
  localStorage.removeItem(REDIRECT_KEY)
  return path
}

/**
 * Install navigation guard that protects auth routes.
 * Redirects to / with saved intended path.
 * @param router - Vue Router instance
 */
export const installAuthGuard = (router: Router): void => {
  router.beforeEach(to => {
    if (!to.meta.requiresAuth) return true
    if (loadToken()) return true
    saveRedirect(to.fullPath)
    return { name: 'home' }
  })
}
