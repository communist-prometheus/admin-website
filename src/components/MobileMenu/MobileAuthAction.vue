<script setup lang="ts">
import { useAppTokenAuth } from '@/composables/useAppTokenAuth'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ navigate: [] }>()
const auth = useAuthStore()

// Password → installation-token login (same as AuthButton).
const { login } = useAppTokenAuth(
  u => {
    auth.setUser(u)
    emit('navigate')
  },
  e => {
    auth.error = e
  }
)

const handleLogin = async (): Promise<void> => {
  const password =
    typeof globalThis.prompt === 'function'
      ? (globalThis.prompt('Admin password:') ?? '')
      : ''
  if (!password) return
  await login(password)
}

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
      @click="handleLogin"
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
