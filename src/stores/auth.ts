import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { loadToken } from '@/composables/useAuth/token-storage'
import type { User } from '@/types/user'
import { createLogout, createSetUser } from './auth-actions'
import { createCheckAuth } from './auth-check'
import { syncTokenToSW } from './auth-sync-sw'
import {
  clearSsoRolesStorage,
  loadSsoRoles,
  saveSsoRoles,
} from './sso-roles-storage'

const buildSsoActions = (ssoRoles: Ref<readonly string[]>) => ({
  setSsoRoles: (roles: readonly string[]): void => {
    ssoRoles.value = roles
    saveSsoRoles(roles)
  },
  clearSsoRoles: (): void => {
    ssoRoles.value = []
    clearSsoRolesStorage()
  },
})

/**
 * Pinia store for authentication state management.
 * Uses cached profile for instant rendering on refresh.
 * @returns Reactive user state and auth methods
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(!!loadToken())
  const error = ref<string | null>(null)
  const ssoRoles = ref<readonly string[]>(loadSsoRoles())

  watch(user, syncTokenToSW, { immediate: true })

  const logout = createLogout(user, loading)
  const checkAuth = createCheckAuth(user, loading, logout)
  const setUser = createSetUser(user)
  const ssoActions = buildSsoActions(ssoRoles)

  return {
    user,
    loading,
    error,
    ssoRoles,
    checkAuth,
    setUser,
    logout,
    ...ssoActions,
  }
})
