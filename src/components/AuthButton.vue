<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useDropdown } from '@/composables/useDropdown'
import { useOAuthPopup } from '@/composables/useOAuthPopup'
import LoginButton from './AuthButton/LoginButton.vue'
import UserMenu from './AuthButton/UserMenu.vue'

const { user, loading: authLoading, error } = useAuth()
const { show: showDropdown, toggle: toggleDropdown } = useDropdown()
const { loading: oauthLoading, openPopup } = useOAuthPopup(
  u => {
    user.value = u
  },
  e => {
    error.value = e
  }
)

const loading = computed(() => authLoading.value || oauthLoading.value)

const handleLogout = () => {
  if (typeof globalThis !== 'undefined') {
    globalThis.location.href = '/api/auth/logout'
  }
}

const handleDifferentAccount = () => {
  if (typeof globalThis !== 'undefined') {
    globalThis.open('https://github.com/logout', '_blank')
  }
  showDropdown.value = false
}
</script>

<template>
  <LoginButton
    v-if="!user"
    :loading="loading"
    @click="openPopup"
  />
  <UserMenu
    v-else
    :user="user"
    :show="showDropdown"
    @toggle="toggleDropdown"
    @logout="handleLogout"
    @different-account="handleDifferentAccount"
  />
</template>
