<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue'

// Get initial state from SSR (provide/inject) or client (window.__INITIAL_STATE__)
const getInitialUser = (): { username: string; name: string; avatar: string } | null => {
  // First try to get from SSR provide/inject
  const ssrState = inject<{ user?: any }>('initialState', null)
  if (ssrState?.user) {
    return ssrState.user
  }

  // Fallback to client-side window.__INITIAL_STATE__
  if (typeof window !== 'undefined') {
    const initialState = (window as any).__INITIAL_STATE__
    return initialState?.user || null
  }

  return null
}

const user = ref<{ username: string; name: string; avatar: string } | null>(getInitialUser())
const loading = ref(false)
const showDropdown = ref(false)
const error = ref<string | null>(null)

const checkAuth = async () => {
  if (typeof window === 'undefined') return

  // Skip fetch if we already have user from SSR
  if (user.value) {
    console.log('[AuthButton] User already loaded from SSR:', user.value)
    return
  }

  try {
    console.log('[AuthButton] Checking auth...')
    const response = await fetch('/api/auth/user')
    console.log('[AuthButton] Auth response status:', response.status)
    if (response.ok) {
      const data = await response.json()
      console.log('[AuthButton] Auth data:', data)
      if (data.authenticated) {
        user.value = data.user
        console.log('[AuthButton] User authenticated:', user.value)
      } else {
        console.log('[AuthButton] User not authenticated')
      }
    }
  } catch (err) {
    console.error('[AuthButton] Failed to check auth:', err)
  }
}

const _handleGitHubLogin = () => {
  if (typeof window === 'undefined') return

  loading.value = true
  error.value = null

  // Open OAuth in popup window
  const width = 600
  const height = 700
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2

  const popup = window.open(
    '/api/auth/github',
    'github-oauth',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
  )

  // Listen for message from popup
  const handleMessage = (event: MessageEvent) => {
    console.log('[AuthButton] Received message:', event.data)
    if (event.origin !== window.location.origin) {
      console.log('[AuthButton] Message from different origin, ignoring')
      return
    }

    if (event.data.type === 'github-oauth-success') {
      console.log('[AuthButton] OAuth success from popup:', event.data.user)
      user.value = event.data.user
      console.log('[AuthButton] User value set to:', user.value)
      loading.value = false
      window.removeEventListener('message', handleMessage)
      popup?.close()
    } else if (event.data.type === 'github-oauth-error') {
      console.error('[AuthButton] OAuth error from popup:', event.data.error)
      error.value = event.data.error || 'Authentication failed'
      loading.value = false
      window.removeEventListener('message', handleMessage)
      popup?.close()
    }
  }

  window.addEventListener('message', handleMessage)

  // Cleanup if popup is closed manually
  const checkPopup = setInterval(() => {
    if (popup?.closed) {
      clearInterval(checkPopup)
      loading.value = false
      window.removeEventListener('message', handleMessage)
    }
  }, 500)
}

const _handleLogout = () => {
  if (typeof window === 'undefined') return
  window.location.href = '/api/auth/logout'
}

const _handleDifferentAccount = () => {
  if (typeof window === 'undefined') return
  window.open('https://github.com/logout', '_blank')
  showDropdown.value = false
}

const _toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Close dropdown when clicking outside
const closeDropdown = (event: MouseEvent) => {
  if (typeof window === 'undefined') return
  const target = event.target as HTMLElement
  if (!target.closest('.auth-dropdown')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  checkAuth()
  if (typeof document !== 'undefined') {
    document.addEventListener('click', closeDropdown)
  }
})

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', closeDropdown)
  }
})
</script>

<template>
  <div class="auth-dropdown" :style="{ position: 'relative' }">
    <!-- Not logged in: Login button -->
    <button
      v-if="!user"
      type="button"
      @click="handleGitHubLogin"
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
    >
      {{ loading ? 'Loading...' : 'Login' }}
    </button>

    <!-- Logged in: User button with dropdown -->
    <div v-else>
      <button
        type="button"
        @click.stop="toggleDropdown"
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
          @click="handleDifferentAccount"
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
        >
          Login with different account
        </button>
        <button
          type="button"
          @click="handleLogout"
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
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>
