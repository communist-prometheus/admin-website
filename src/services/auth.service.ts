/**
 * Authentication service
 */
export const AuthService = {
  logout: () => {
    if (typeof globalThis !== 'undefined') {
      globalThis.location.href = '/api/auth/logout'
    }
  },

  openDifferentAccountDialog: () => {
    if (typeof globalThis !== 'undefined') {
      globalThis.open('https://github.com/logout', '_blank')
    }
  },
}
