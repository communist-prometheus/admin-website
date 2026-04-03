<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import { pendingDeploy } from '@/composables/useDeployStatus/pending-deploy'
import DeployList from './DeployHistory/DeployList.vue'
import { fetchDeploys } from './DeployHistory/fetch-deploys'
import { isPendingReplaced } from './DeployHistory/pending-match'

const fetched = ref<readonly CommitBuild[]>([])
const loading = ref(true)
const countAtPending = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const replaced = () =>
  isPendingReplaced(pendingDeploy.value, fetched.value, countAtPending.value)

const deploys = computed(() => {
  const p = pendingDeploy.value
  if (!p || replaced()) return fetched.value
  return [p, ...fetched.value]
})

const needsPoll = () =>
  !replaced() || fetched.value.some(d => d.check?.status !== 'completed')

const load = async () => {
  fetched.value = await fetchDeploys()
  loading.value = false
  if (replaced()) pendingDeploy.value = undefined
  if (needsPoll() && !timer) timer = setInterval(load, 8000)
  if (!needsPoll() && timer) {
    clearInterval(timer)
    timer = undefined
  }
}

onMounted(() => {
  countAtPending.value = fetched.value.length
  load()
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <DeployList :deploys="deploys" :loading="loading" />
</template>
