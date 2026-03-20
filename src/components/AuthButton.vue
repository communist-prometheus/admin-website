<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useDropdown } from '@/composables/useDropdown'
import { useOAuthPopup } from '@/composables/useOAuthPopup'
import { loadRedirect } from '@/router/auth-guard'
import { useAuthStore } from '@/stores/auth'
import LoginButton from './AuthButton/LoginButton.vue'
import UserMenu from './AuthButton/UserMenu.vue'

const router = useRouter()
const { loading: authLoading } = useAuth()
const authStore = useAuthStore()
const {
  show: showDropdown,
  toggle: toggleDropdown,
} = useDropdown()
const { loading: oauthLoading, openPopup } =
  useOAuthPopup(
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
  () => authLoading.value || oauthLoading.value
)

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
  <div class="auth-slot">
    <LoginButton
      v-if="!authStore.user"
      :loading="loading"
      @click="openPopup"
    />
    <UserMenu
      v-else
      :user="authStore.user"
      :show="showDropdown"
      @toggle="toggleDropdown"
      @logout="handleLogout"
      @different-account="handleDifferentAccount"
    />
  </div>
</template>

<style scoped>
.auth-slot {
  display: flex;
  justify-content: flex-end;
  min-width: 120px;
}
</style>
