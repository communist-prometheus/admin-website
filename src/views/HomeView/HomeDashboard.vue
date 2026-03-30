<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import DeployList from './DeployHistory/DeployList.vue'
import { fetchDeploys } from './DeployHistory/fetch-deploys'

const deploys = ref<readonly CommitBuild[]>([])
const loading = ref(true)

onMounted(async () => {
  deploys.value = await fetchDeploys()
  loading.value = false
})
</script>

<template>
  <DeployList :deploys="deploys" :loading="loading" />
</template>
