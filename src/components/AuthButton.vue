<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useDropdown } from '@/composables/useDropdown'
import { useOAuthPopup } from '@/composables/useOAuthPopup'

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

const loading = authLoading.value || oauthLoading.value
const handleLogout = () => {
  if (typeof window !== 'undefined') window.location.href = '/api/auth/logout'
}
const handleDifferentAccount = () => {
  if (typeof window !== 'undefined')
    window.open('https://github.com/logout', '_blank')
  showDropdown.value = false
}
</script>

<template>
  <div
    class="auth-dropdown"
    :style="{ position: 'relative' }"
  >
    <!-- Not logged in: Login button -->
    <button
      v-if="!user"
      type="button"
      :disabled="loading"
      :style="{
        padding: '0.5rem 1.5rem',
        borderRadius: '4px',
        border: 'none',
        background: loading ? '#999' : '#24292e',
        color: 'white',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
      }"
      @click="openPopup"
    >
      {{ loading ? 'Loading...' : 'Login' }}
    </button>

    <!-- Logged in: User button with dropdown -->
    <div v-else>
      <button
        type="button"
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-background)',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }"
        @click.stop="toggleDropdown"
      >
        <img 
          :src="user.avatar" 
          :alt="user.username"
          :style="{
            width: '24px',
            height: '24px',
            borderRadius: '50%'
          }"
        />
        <span :style="{ fontWeight: '500' }">{{ user.name || user.username }}</span>
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="showDropdown"
        :style="{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'var(--color-background)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '200px',
          zIndex: 1000
        }"
      >
        <button
          type="button"
          :style="{
            width: '100%',
            padding: '0.75rem 1rem',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '0.875rem',
            borderBottom: '1px solid var(--color-border)'
          }"
          @click="handleDifferentAccount"
        >
          Login with different account
        </button>
        <button
          type="button"
          :style="{
            width: '100%',
            padding: '0.75rem 1rem',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#d73a49'
          }"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>
