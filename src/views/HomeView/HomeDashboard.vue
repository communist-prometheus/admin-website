<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import { pendingDeploy } from '@/composables/useDeployStatus/pending-deploy'
import DeployList from './DeployHistory/DeployList.vue'
import { fetchDeploys } from './DeployHistory/fetch-deploys'

const fetched = ref<readonly CommitBuild[]>([])
const loading = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

const pendingMatched = () => {
  const p = pendingDeploy.value
  if (!p) return true
  return fetched.value.some(d => d.message === p.message)
}

const deploys = computed(() => {
  const p = pendingDeploy.value
  if (!p || pendingMatched()) return fetched.value
  return [p, ...fetched.value]
})

const needsPoll = () =>
  !pendingMatched() ||
  fetched.value.some(d => d.check?.status !== 'completed')

const load = async () => {
  fetched.value = await fetchDeploys()
  loading.value = false
  if (pendingMatched()) pendingDeploy.value = undefined
  if (needsPoll() && !timer) timer = setInterval(load, 8000)
  if (!needsPoll() && timer) {
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
