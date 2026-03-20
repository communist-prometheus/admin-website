import { clearToken } from '@/composables/useAuth/token-storage'

/**
 * Authentication service
 */
export const AuthService = {
  logout: () => {
    clearToken()
  },

  openDifferentAccountDialog: () => {
    if (typeof globalThis !== 'undefined') {
      globalThis.open('https://github.com/logout', '_blank')
    }
  },
}
