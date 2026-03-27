<script setup lang="ts">
import { useOAuthPopup } from '@/composables/useOAuthPopup'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ navigate: [] }>()
const auth = useAuthStore()
const { openPopup } = useOAuthPopup(
  u => {
    auth.setUser(u)
    emit('navigate')
  },
  e => {
    auth.error = e
  }
)

const handleLogout = () => {
  auth.logout()
  emit('navigate')
}
</script>

<template>
  <li class="auth-action">
    <button
      v-if="!auth.user"
      type="button"
      class="login-btn"
      data-testid="mobile-login"
      @click="openPopup"
    >
      Login
    </button>
    <button
      v-else
      type="button"
      class="logout-btn"
      data-testid="mobile-logout"
      @click="handleLogout"
    >
      Logout ({{ auth.user.username }})
    </button>
  </li>
</template>

<style scoped>
.auth-action {
  list-style: none;
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.login-btn,
.logout-btn {
  width: 100%;
  min-height: 48px;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 1rem;
  text-align: left;
}

.login-btn {
  background: var(--color-accent);
  color: var(--color-on-accent, #fff);
  font-weight: 600;
}

.logout-btn {
  background: transparent;
  color: var(--color-text-secondary);
}
</style>
