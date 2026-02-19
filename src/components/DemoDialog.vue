<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

const handleGitHubLogin = () => {
  loading.value = true
  error.value = null
  window.location.href = '/api/auth/github'
}

const handleLogout = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  } catch (err) {
    error.value = 'Failed to logout'
    console.error('Logout failed:', err)
  }
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
      <p :style="{ marginBottom: '0.5rem' }">
        Sign in with your GitHub account to continue.
      </p>
      <p :style="{ fontSize: '0.875rem', color: '#6e7781', marginBottom: '1.5rem' }">
        To login with a different account, <a href="https://github.com/logout" target="_blank" :style="{ color: '#0969da', textDecoration: 'none' }">logout from GitHub</a> first.
      </p>
      
      <div :style="{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }">
        <button
          type="button"
          @click="close"
          :style="{
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
