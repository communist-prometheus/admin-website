<script setup lang="ts">
import type { WorkflowStep } from '@/composables/useDeployStatus/workflow-types'

const props = defineProps<{
  readonly step: WorkflowStep
}>()

const icon = (s: WorkflowStep): string => {
  if (s.status !== 'completed') return s.status === 'in_progress' ? '' : '·'
  return s.conclusion === 'success' ? '✓' : '✗'
}

const formatSeconds = (sec: number): string => {
  if (sec < 1) return '<1s'
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  const rem = sec % 60
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`
}

const dur = (s: WorkflowStep): string => {
  if (!s.started_at) return ''
  const start = new Date(s.started_at).getTime()
  const end = s.completed_at ? new Date(s.completed_at).getTime() : Date.now()
  return formatSeconds(Math.round((end - start) / 1000))
}

const iconText = () => icon(props.step)
const durText = () => dur(props.step)
</script>

<template>
  <li
    class="step"
    :class="{
      active: step.status === 'in_progress',
      done: step.status === 'completed' && step.conclusion === 'success',
      failed: step.status === 'completed' && step.conclusion === 'failure',
    }"
  >
    <span v-if="step.status === 'in_progress'" class="spinner" />
    <span v-else class="icon">{{ iconText() }}</span>
    <span class="name">{{ step.name }}</span>
    <span v-if="step.started_at" class="dur">{{ durText() }}</span>
  </li>
</template>

<style scoped>
.step {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.step.active {
  color: var(--color-primary);
  font-weight: 500;
}

.step.done { color: hsl(140deg 60% 45%); }
.step.failed { color: hsl(0deg 70% 55%); }

.icon {
  width: 1rem;
  text-align: center;
  flex-shrink: 0;
}

.spinner {
  display: inline-block;
  width: 0.625rem;
  height: 0.625rem;
  border: 1.5px solid currentcolor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.name { flex: 1; }

.dur {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
</style>
