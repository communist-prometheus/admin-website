<script setup lang="ts">
import { onMounted, ref } from 'vue'

const dialogRef = ref<HTMLDialogElement | null>(null)
const user = ref<{ username: string; name: string; avatar: string } | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const open = () => {
  dialogRef.value?.showModal()
  checkAuth()
}

const close = () => {
  dialogRef.value?.close()
}

const checkAuth = async () => {
  try {
    console.log('[DemoDialog] Checking auth...')
    const response = await fetch('/api/auth/user')
    console.log('[DemoDialog] Auth response status:', response.status)
    if (response.ok) {
      const data = await response.json()
      console.log('[DemoDialog] Auth data:', data)
      if (data.authenticated) {
        user.value = data.user
        console.log('[DemoDialog] User authenticated:', user.value)
      } else {
        console.log('[DemoDialog] User not authenticated')
      }
    }
  } catch (err) {
    console.error('[DemoDialog] Failed to check auth:', err)
  }
}

const _handleGitHubLogin = () => {
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
    console.log('[DemoDialog] Received message:', event.data)
    if (event.origin !== window.location.origin) {
      console.log('[DemoDialog] Message from different origin, ignoring')
      return
    }

    if (event.data.type === 'github-oauth-success') {
      console.log('[DemoDialog] OAuth success from popup:', event.data.user)
      user.value = event.data.user
      console.log('[DemoDialog] User value set to:', user.value)
      loading.value = false
      window.removeEventListener('message', handleMessage)
      popup?.close()
    } else if (event.data.type === 'github-oauth-error') {
      console.error('[DemoDialog] OAuth error from popup:', event.data.error)
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
  // Redirect to logout endpoint which will clear session
  window.location.href = '/api/auth/logout'
}

const _handleDifferentAccount = () => {
  // Open GitHub logout in new tab
  window.open('https://github.com/logout', '_blank')
  // Show instruction to user
  console.log(
    '[DemoDialog] GitHub logout opened in new tab. After logging out, click "Sign in with GitHub" again.'
  )
}

onMounted(() => {
  checkAuth()
})

defineExpose({ open, close })
</script>

<template>
  <dialog ref="dialogRef" :style="{ 
    padding: '2rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    maxWidth: '500px',
    width: '90vw'
  }">
    <h2 :style="{ marginTop: 0 }">GitHub Authentication</h2>
    
    <div v-if="error" :style="{ 
      padding: '1rem',
      marginBottom: '1rem',
      background: '#fee',
      border: '1px solid #fcc',
      borderRadius: '4px',
      color: '#c00'
    }">
      {{ error }}
    </div>

    <div v-if="!user">
      <p :style="{ marginBottom: '1.5rem' }">
        Sign in with your GitHub account to continue.
      </p>
      
      <div :style="{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }">
        <div :style="{ display: 'flex', gap: '1rem' }">
          <button
            type="button"
            @click="close"
            :style="{
              flex: '1',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1rem'
            }"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleGitHubLogin"
            :disabled="loading"
            :style="{
              flex: '1',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: 'none',
              background: loading ? '#999' : '#24292e',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }"
          >
            {{ loading ? 'Loading...' : 'Sign in with GitHub' }}
          </button>
        </div>
        <button
          type="button"
          @click="handleDifferentAccount"
          :disabled="loading"
          :style="{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid #0969da',
            background: 'transparent',
            color: '#0969da',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: loading ? 0.5 : 1
          }"
        >
          Login with different account
        </button>
      </div>
    </div>

    <div v-else>
      <div :style="{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#f6f8fa',
        borderRadius: '8px'
      }">
        <img 
          :src="user.avatar" 
          :alt="user.username"
          :style="{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '2px solid #42b883'
          }"
        />
        <div>
          <div :style="{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }">
            {{ user.name || user.username }}
          </div>
          <div :style="{ color: '#666', fontSize: '0.9rem' }">
            @{{ user.username }}
          </div>
        </div>
      </div>

      <div :style="{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }">
        <button
          type="button"
          @click="handleLogout"
          :style="{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid #dc3545',
            background: 'transparent',
            color: '#dc3545',
            cursor: 'pointer'
          }"
        >
          Logout
        </button>
        <button
          type="button"
          @click="close"
          :style="{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            background: '#42b883',
            color: 'white',
            cursor: 'pointer'
          }"
        >
          Close
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
</style>
