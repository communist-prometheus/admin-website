<script setup lang="ts">
import { computed, provide, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import {
  DEPLOY_ENTRIES_KEY,
  DEPLOY_LOADING_KEY,
  DEPLOY_TRACK_KEY,
} from '@/composables/useDeployStatus/deploy-context'
import {
  clearPendingDeploy,
  isPendingMatched,
  pendingDeploy,
  pendingToDeployBuild,
} from '@/composables/useDeployStatus/pending-deploy'
import { useDeployPolling } from '@/composables/useDeployStatus/use-deploy-polling'
import type { DeployBuild } from '@/composables/useDeployStatus/workflow-types'
import { useAuthStore } from '@/stores/auth'
import { useContentStore } from '@/stores/content'

const route = useRoute()
const authStore = useAuthStore()
const contentStore = useContentStore()

// Single app-wide poller. Pauses automatically once every visible
// run is terminal; resumes when a save hits `requestPoll` via
// DEPLOY_TRACK_KEY or when the tab regains focus with an active
// deploy still in flight.
const poll = useDeployPolling()

// Merge the optimistic pending entry (set by the save flow) into the
// real entries so the home list shows the user's action instantly.
// The pending entry is dropped automatically once a real run with a
// matching commit message lands.
const mergedEntries = computed<ReadonlyArray<DeployBuild>>(() => {
  const real = poll.entries.value
  const pending = pendingDeploy.value
  if (!pending) return real
  if (isPendingMatched(pending, real)) {
    clearPendingDeploy()
    return real
  }
  return [pendingToDeployBuild(pending), ...real]
})

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
  <SWDebugPanel />
</template>
