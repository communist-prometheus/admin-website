<script setup lang="ts">
import { provide, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useDeployStatus } from '@/composables/useDeployStatus'
import {
  DEPLOY_INFO_KEY,
  DEPLOY_TRACK_KEY,
} from '@/composables/useDeployStatus/deploy-context'
import { useAuthStore } from '@/stores/auth'
import { useContentStore } from '@/stores/content'

const route = useRoute()
const authStore = useAuthStore()
const contentStore = useContentStore()
const deploy = useDeployStatus()

provide(DEPLOY_TRACK_KEY, deploy.track)
provide(DEPLOY_INFO_KEY, deploy.info)

watch(
  () => authStore.user,
  (user) => { if (user) contentStore.loadAll() },
  { immediate: true },
)
</script>

<template>
  <RouterView :key="route.fullPath" />
  <SWDebugPanel />
</template>
