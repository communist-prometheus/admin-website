<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import DeployList from './DeployHistory/DeployList.vue'
import { fetchDeploys } from './DeployHistory/fetch-deploys'

const deploys = ref<readonly CommitBuild[]>([])
const loading = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

const hasActive = (ds: readonly CommitBuild[]) =>
  ds.some(d => d.check?.status !== 'completed')

const load = async () => {
  deploys.value = await fetchDeploys()
  loading.value = false
  if (hasActive(deploys.value) && !timer) {
    timer = setInterval(load, 8000)
  }
  if (!hasActive(deploys.value) && timer) {
    clearInterval(timer)
    timer = undefined
  }
}

onMounted(load)
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <DeployList :deploys="deploys" :loading="loading" />
</template>
