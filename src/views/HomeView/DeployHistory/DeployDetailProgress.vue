<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { CheckRun } from '@/composables/useDeployStatus/check-runs'
import { fetchCheckRun } from '@/composables/useDeployStatus/check-runs'

const props = defineProps<{
  readonly sha: string
  readonly check: CheckRun | undefined
}>()

const status = ref(props.check?.status ?? 'pending')
const conclusion = ref(props.check?.conclusion)
let timer: ReturnType<typeof setInterval> | undefined

const poll = async () => {
  const run = await fetchCheckRun(props.sha)
  if (!run) return
  status.value = run.status
  conclusion.value = run.conclusion
  if (run.status === 'completed' && timer) {
    clearInterval(timer)
    timer = undefined
  }
}

const label = () => {
  if (status.value === 'completed') return conclusion.value ?? 'done'
  return status.value
}

const barClass = () => {
  if (status.value === 'in_progress') return 'building'
  if (status.value === 'completed') return 'done'
  return 'waiting'
}

onMounted(() => {
  if (status.value !== 'completed') {
    timer = setInterval(poll, 5000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <aside class="progress-wrap">
    <span class="lbl">{{ label() }}</span>
    <span class="bar" :class="barClass()" />
  </aside>
</template>

<style scoped>
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
}

.lbl {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 5rem;
}

.bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
}

.bar.building {
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-primary-light, hsl(14deg 90% 65%)),
    var(--color-primary)
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.bar.done {
  background: hsl(140deg 60% 45%);
}

.bar.waiting {
  background: hsl(40deg 50% 40%);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
