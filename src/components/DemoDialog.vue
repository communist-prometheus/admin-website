<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useOAuthPopup } from '@/composables/useOAuthPopup'

const dialogRef = ref<HTMLDialogElement | null>(null)
const { user, loading: authLoading, error, checkAuth } = useAuth()
const { loading: oauthLoading, openPopup } = useOAuthPopup(
  u => {
    user.value = u
  },
  e => {
    error.value = e
  }
)

const loading = authLoading.value || oauthLoading.value
const open = () => {
  dialogRef.value?.showModal()
  checkAuth()
}
const close = () => {
  dialogRef.value?.close()
}
const handleLogout = () => {
  window.location.href = '/api/auth/logout'
}
const handleDifferentAccount = () => {
  window.open('https://github.com/logout', '_blank')
}

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
            @click="openPopup"
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
