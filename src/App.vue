<script setup lang="ts">
import { provide, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import {
  DEPLOY_ENTRIES_KEY,
  DEPLOY_LOADING_KEY,
  DEPLOY_TRACK_KEY,
} from '@/composables/useDeployStatus/deploy-context'
import { useDeployPolling } from '@/composables/useDeployStatus/use-deploy-polling'
import { useMergedEntries } from '@/composables/useDeployStatus/use-merged-entries'
import { useNotificationsPersistence } from '@/composables/useNotifications/use-notification-persistence'
import { usePushErrorBridge } from '@/composables/useNotifications/use-push-error-bridge'
import { useAuthStore } from '@/stores/auth'
import { useContentStore } from '@/stores/content'

const route = useRoute()
const authStore = useAuthStore()
const contentStore = useContentStore()
useNotificationsPersistence()
usePushErrorBridge()

const poll = useDeployPolling()
const mergedEntries = useMergedEntries(poll.entries)

provide(DEPLOY_TRACK_KEY, poll.requestPoll)
provide(DEPLOY_ENTRIES_KEY, mergedEntries)
provide(DEPLOY_LOADING_KEY, poll.loading)

watch(
  () => authStore.user,
  user => {
    if (user) contentStore.loadAll()
  },
  { immediate: true }
)
</script>

<template>
  <RouterView :key="route.fullPath" />
  <NotificationToastStack />
  <NotificationDrawer />
  <NotificationDevTrigger />
  <SWDebugPanel />
</template>
