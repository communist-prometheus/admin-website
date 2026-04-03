<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import { pendingDeploy } from '@/composables/useDeployStatus/pending-deploy'
import DeployList from './DeployHistory/DeployList.vue'
import { fetchDeploys } from './DeployHistory/fetch-deploys'
import { isPendingReplaced } from './DeployHistory/pending-match'

const fetched = ref<readonly CommitBuild[]>([])
const loading = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

const pendingReplaced = () =>
  isPendingReplaced(pendingDeploy.value, fetched.value)

const deploys = computed(() => {
  const p = pendingDeploy.value
  if (!p || pendingReplaced()) return fetched.value
  return [p, ...fetched.value]
})

const needsPoll = () =>
  !pendingReplaced() ||
  fetched.value.some(d => d.check?.status !== 'completed')

const load = async () => {
  fetched.value = await fetchDeploys()
  loading.value = false
  if (pendingReplaced()) pendingDeploy.value = undefined
  if (needsPoll() && !timer) timer = setInterval(load, 8000)
  if (!needsPoll() && timer) {
    clearInterval(timer)
    timer = undefined
  }
}

onMounted(load)
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <DeployList :deploys="deploys" :loading="loading" />
</template>
