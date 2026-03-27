<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { exchangeCodeForToken } from '@/composables/useAuth/exchange-token'
import { fetchGitHubUser } from '@/composables/useAuth/fetch-github-user'
import { loadAndClearVerifier } from '@/composables/useAuth/pkce-storage'
import { saveToken } from '@/composables/useAuth/token-storage'
import { loadRedirect } from '@/router/auth-guard'
import { useAuthStore } from '@/stores/auth'
import { extractString } from '@/validation/extract-string'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const status = ref('Completing authentication…')

/**
 * Post token to opener window and close popup.
 * @param token - GitHub access token
 */
const notifyOpener = (token: string) => {
  globalThis.opener?.postMessage(
    { type: 'github-oauth-success', token },
    globalThis.location.origin
  )
  globalThis.close()
}

onMounted(async () => {
  try {
    const code = extractString(route.query.code)
    const verifier = loadAndClearVerifier()

    if (!code || !verifier) {
      status.value = 'Missing code or verifier'
      return
    }

    const token = await exchangeCodeForToken(code, verifier)
    saveToken(token)

    if (globalThis.opener) {
      notifyOpener(token)
      return
    }

    const user = await fetchGitHubUser(token)
    authStore.setUser(user)
    router.push(loadRedirect() ?? '/')
  } catch (e) {
    status.value =
      e instanceof Error ? e.message : 'Auth failed'
  }
})
</script>

<template>
  <p>{{ status }}</p>
</template>
