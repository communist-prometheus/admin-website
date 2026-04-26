<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadRedirect } from '@/router/auth-guard'
import { useAuthStore } from '@/stores/auth'
import { extractString } from '@/validation/extract-string'
import {
  completeSameTab,
  notifyOpenerCode,
} from './AuthCallbackView/complete-callback'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const status = ref('Completing authentication…')

const SAME_TAB_STATUS = {
  ok: '',
  'missing-verifier': 'Missing verifier',
  error: 'Auth failed',
} as const

const finishSameTab = async (code: string): Promise<void> => {
  const r = await completeSameTab(code)
  if (r.status === 'ok' && r.user) {
    authStore.setUser(r.user)
    router.push(loadRedirect() ?? '/')
    return
  }
  status.value = r.message ?? SAME_TAB_STATUS[r.status]
}

onMounted(() => {
  const code = extractString(route.query.code)
  if (!code) {
    status.value = 'Missing code'
    return
  }
  if (globalThis.opener) {
    notifyOpenerCode(code)
    return
  }
  finishSameTab(code).catch(e => {
    status.value = e instanceof Error ? e.message : 'Auth failed'
  })
})
</script>

<template>
  <p>{{ status }}</p>
</template>
