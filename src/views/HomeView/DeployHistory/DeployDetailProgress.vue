<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { CheckRun } from '@/composables/useDeployStatus/check-runs'
import { fetchCheckRun } from '@/composables/useDeployStatus/check-runs'
import { calcProgress, formatElapsed } from './build-progress'
import DeployProgressBar from './DeployProgressBar.vue'

const props = defineProps<{
  readonly sha: string
  readonly check: CheckRun | undefined
}>()

const status = ref(props.check?.status ?? 'pending')
const startedAt = ref(props.check?.started_at)
const conclusion = ref(props.check?.conclusion)
const progress = ref(calcProgress(startedAt.value))
const elapsed = ref(formatElapsed(startedAt.value))
let pollTimer: ReturnType<typeof setInterval> | undefined
let tickTimer: ReturnType<typeof setInterval> | undefined

const stopAll = () => {
  clearInterval(pollTimer)
  clearInterval(tickTimer)
  pollTimer = undefined
  tickTimer = undefined
}

const tick = () => {
  progress.value = calcProgress(startedAt.value)
  elapsed.value = formatElapsed(startedAt.value)
}

const poll = async () => {
  const run = await fetchCheckRun(props.sha)
  if (!run) return
  status.value = run.status
  startedAt.value = run.started_at
  conclusion.value = run.conclusion
  if (run.status === 'completed') {
    progress.value = 100
    stopAll()
  }
}

onMounted(() => {
  if (status.value === 'completed') {
    progress.value = 100
    return
  }
  pollTimer = setInterval(poll, 5000)
  tickTimer = setInterval(tick, 1000)
})

onUnmounted(stopAll)
</script>

<template>
  <DeployProgressBar
    :status="status.replace('_', '-')"
    :conclusion="conclusion"
    :progress="progress"
    :elapsed="elapsed"
  />
</template>
