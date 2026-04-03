<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import { pendingDeploy } from '@/composables/useDeployStatus/pending-deploy'
import DeployList from './DeployHistory/DeployList.vue'
import { fetchDeploys } from './DeployHistory/fetch-deploys'

const fetched = ref<readonly CommitBuild[]>([])
const loading = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

const deploys = computed(() => {
  const p = pendingDeploy.value
  if (!p) return fetched.value
  const exists = fetched.value.some(d => d.message === p.message)
  return exists ? fetched.value : [p, ...fetched.value]
})

const hasActive = (ds: readonly CommitBuild[]) =>
  ds.some(d => d.check?.status !== 'completed')

const load = async () => {
  fetched.value = await fetchDeploys()
  loading.value = false
  if (pendingDeploy.value) pendingDeploy.value = undefined
  if ((hasActive(fetched.value) || pendingDeploy.value) && !timer)
    timer = setInterval(load, 8000)
  if (!hasActive(fetched.value) && !pendingDeploy.value && timer) {
    clearInterval(timer)
    timer = undefined
  }
}

onMounted(() => {
  load()
  if (pendingDeploy.value) timer = setInterval(load, 8000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <DeployList :deploys="deploys" :loading="loading" />
</template>
