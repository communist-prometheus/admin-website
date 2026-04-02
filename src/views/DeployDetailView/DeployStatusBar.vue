<script setup lang="ts">
import type { CheckRun } from '@/composables/useDeployStatus/check-runs'
import { calcProgress, formatElapsed } from '@/views/HomeView/DeployHistory/build-progress'

const props = defineProps<{ readonly check: CheckRun }>()

const label = () =>
  props.check.status === 'completed'
    ? (props.check.conclusion ?? 'done')
    : props.check.status

const barColor = () => {
  if (props.check.status !== 'completed') return 'var(--color-primary)'
  return props.check.conclusion === 'success'
    ? 'hsl(140deg 60% 45%)'
    : 'hsl(0deg 60% 50%)'
}

const progress = () =>
  props.check.status === 'completed' ? 100 : calcProgress(props.check.started_at)
</script>

<template>
  <p class="bar-row">
    <span class="lbl" :class="check.conclusion ?? check.status">{{ label() }}</span>
    <span v-if="check.started_at" class="time">{{ formatElapsed(check.started_at) }}</span>
  </p>
  <aside class="track">
    <span class="fill" :style="{ width: `${progress()}%`, background: barColor() }" />
  </aside>
</template>

<style scoped>
.bar-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.lbl {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.lbl.success { color: hsl(140deg 60% 50%); }
.lbl.failure { color: hsl(0deg 70% 55%); }

.time {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  font-family: 'Courier New', monospace;
}

.track {
  height: 6px;
  border-radius: 3px;
  background: var(--color-border);
  overflow: hidden;
  margin-bottom: 1rem;
}

.fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 1s linear;
}
</style>
