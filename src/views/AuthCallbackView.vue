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
 *
 * Uses `'*'` as targetOrigin so the token delivers across origins — the
 * popup may run at a different origin (e.g. workers.dev) than the opener
 * (e.g. admin.comprom.org) when VITE_OAUTH_REDIRECT_URI is set to a
 * centralized callback URL. The opener validates the sender origin via
 * the TRUSTED_ORIGINS allowlist in useOAuthPopup/handlers.ts, so the
 * wildcard target is safe — only admin hostnames we control can produce
 * a message that the opener will accept.
 * @param token - GitHub access token
 */
const notifyOpener = (token: string) => {
  globalThis.opener?.postMessage(
    { type: 'github-oauth-success', token },
    '*'
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
