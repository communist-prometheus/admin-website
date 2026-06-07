import type { Router } from 'vue-router'
import { loadToken } from '@/composables/useAuth/token-storage'
import { useAuthStore } from '@/stores/auth'

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

const isOwner = (): boolean => {
  try {
    return useAuthStore().ssoRoles.includes('owner')
  } catch {
    return false
  }
}

/**
 * Install navigation guard that protects auth routes.
 * Redirects unauthenticated visitors to / with the intended path
 * saved for post-login restore. Routes flagged `requiresOwner` are
 * additionally gated on the SSO `owner` role — non-owners get a
 * silent redirect to / instead of an in-page 401.
 * @param router - Vue Router instance
 */
export const installAuthGuard = (router: Router): void => {
  router.beforeEach(to => {
    if (!to.meta.requiresAuth) return true
    if (!loadToken()) {
      saveRedirect(to.fullPath)
      return { name: 'home' }
    }
    return to.meta.requiresOwner && !isOwner() ? { name: 'home' } : true
  })
}
