<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import type { CheckRun } from '@/composables/useDeployStatus/check-runs'
import { fetchCheckRun } from '@/composables/useDeployStatus/check-runs'
import type { CommitDetail } from '@/composables/useDeployStatus/fetch-commit-detail'
import { fetchCommitDetail } from '@/composables/useDeployStatus/fetch-commit-detail'
import DeployFilesSection from './DeployFilesSection.vue'
import DeployStatusSection from './DeployStatusSection.vue'

const props = defineProps<{ readonly sha: string }>()

const detail = ref<CommitDetail | undefined>()
const check = ref<CheckRun | undefined>()
const loading = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

const pollCheck = async () => {
  check.value = await fetchCheckRun(props.sha)
  if (check.value?.status === 'completed' && timer) {
    clearInterval(timer)
    timer = undefined
  }
}

onMounted(async () => {
  const [d, c] = await Promise.all([
    fetchCommitDetail(props.sha),
    fetchCheckRun(props.sha),
  ])
  detail.value = d
  check.value = c
  loading.value = false
  if (c?.status !== 'completed') timer = setInterval(pollCheck, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <AppLayout>
    <h1 class="deploy-title">
      {{ detail?.message?.split('\n')[0] ?? sha }}
    </h1>
    <p v-if="loading">Loading...</p>
    <DeployStatusSection v-if="check" :check="check" :sha="sha" />
    <DeployFilesSection v-if="detail" :files="detail.files" />
  </AppLayout>
</template>

<style scoped>
.deploy-title {
  font-size: 1.25rem;
  color: var(--color-heading);
  margin-bottom: 1rem;
  padding: 0 clamp(1rem, 3vw, 2rem);
}
</style>
