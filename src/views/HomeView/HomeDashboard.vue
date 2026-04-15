<script setup lang="ts">
import { inject, ref } from 'vue'
import {
  DEPLOY_ENTRIES_KEY,
  DEPLOY_LOADING_KEY,
} from '@/composables/useDeployStatus/deploy-context'
import type { DeployBuild } from '@/composables/useDeployStatus/workflow-types'
import DeployList from './DeployHistory/DeployList.vue'

// Source of truth lives in App.vue via `useDeployPolling`, shared
// through provide/inject. HomeDashboard never creates its own poll
// loop, so mounting/unmounting the home page doesn't start or kill
// polling — avoids the previous mount-thrash.
const entries = inject(
  DEPLOY_ENTRIES_KEY,
  ref<ReadonlyArray<DeployBuild>>([])
)
const loading = inject(DEPLOY_LOADING_KEY, ref(false))
</script>

<template>
  <DeployList :deploys="entries" :loading="loading" />
</template>
