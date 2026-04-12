<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppTokenAuth } from '@/composables/useAppTokenAuth'
import { useAuth } from '@/composables/useAuth'
import { useDropdown } from '@/composables/useDropdown'
import { loadRedirect } from '@/router/auth-guard'
import { useAuthStore } from '@/stores/auth'
import LoginButton from './AuthButton/LoginButton.vue'
import UserMenu from './AuthButton/UserMenu.vue'

const router = useRouter()
const { loading: authLoading } = useAuth()
const authStore = useAuthStore()
const { show: showDropdown, toggle: toggleDropdown } = useDropdown()

// Password → installation-token login replaces the OAuth popup flow.
// Rationale: the GitHub App's callback URLs don't cover our production
// hostnames, and that registration can only be changed via the web UI —
// there is no REST API for GitHub App settings. The installation-token
// flow sidesteps OAuth entirely: the worker signs a JWT with the private
// key and mints an installation access token from a password-gated
// endpoint. See `src/api/app-token-handler.ts` and
// `src/composables/useAppTokenAuth.ts`.
const { loading: loginLoading, login: loginWithPassword } = useAppTokenAuth(
  u => {
    authStore.setUser(u)
    const redirect = loadRedirect()
    if (redirect) router.push(redirect)
  },
  e => {
    authStore.error = e
  }
)

const loading = computed(
  () => authLoading.value || Boolean(loginLoading.value)
)

const handleLogin = async (): Promise<void> => {
  const password =
    typeof globalThis.prompt === 'function'
      ? (globalThis.prompt('Admin password:') ?? '')
      : ''
  if (!password) return
  await loginWithPassword(password)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const handleDifferentAccount = () => {
  if (typeof globalThis !== 'undefined') {
    globalThis.open('https://github.com/logout', '_blank')
  }
  showDropdown.value = false
}
</script>

<template>
  <span class="auth-slot">
    <LoginButton
      v-if="!authStore.user"
      :loading="loading"
      @click="handleLogin"
    />
    <UserMenu
      v-else
      :user="authStore.user"
      :show="showDropdown"
      @toggle="toggleDropdown"
      @logout="handleLogout"
      @different-account="handleDifferentAccount"
    />
  </span>
</template>

<style scoped>
.auth-slot {
  display: flex;
  justify-content: flex-end;
  min-width: 120px;
}

@media (width < 768px) {
  .auth-slot {
    display: none;
  }
}
</style>
