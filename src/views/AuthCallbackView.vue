<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { completeCallback } from '@/composables/useAuth/complete-callback'
import { fetchGitHubUser } from '@/composables/useAuth/fetch-github-user'
import { TRUSTED_ORIGINS } from '@/composables/useOAuthPopup/trusted-origins'
import { loadRedirect } from '@/router/auth-guard'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const status = ref('Completing authentication…')

/**
 * Post token to opener window and close popup.
 *
 * Never posts with `'*'` — a wildcard would hand the token to ANY
 * window that opened this callback URL, including an attacker's
 * page. Instead the message is posted once per trusted origin (plus
 * our own, for the same-origin popup case): postMessage silently
 * drops deliveries whose targetOrigin does not match the opener, so
 * exactly one copy arrives and only if the opener is one of ours.
 * @param token - GitHub access token
 */
const notifyOpener = (token: string) => {
  const msg = { type: 'github-oauth-success', token }
  const targets = new Set([...TRUSTED_ORIGINS, globalThis.location.origin])
  for (const target of targets) globalThis.opener?.postMessage(msg, target)
  globalThis.close()
}

onMounted(async () => {
  try {
    const token = await completeCallback(route.query.code, route.query.state)
    if (globalThis.opener) {
      notifyOpener(token)
      return
    }
    const user = await fetchGitHubUser(token)
    authStore.setUser(user)
    router.push(loadRedirect() ?? '/')
  } catch (e) {
    status.value = e instanceof Error ? e.message : 'Auth failed'
  }
})
</script>

<template>
  <p>{{ status }}</p>
</template>
