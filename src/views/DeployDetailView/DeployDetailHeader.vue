<script setup lang="ts">
import type { WorkflowRun } from '@/composables/useDeployStatus/workflow-types'
import DeployHeaderMeta from './DeployHeaderMeta.vue'

const props = defineProps<{ readonly run: WorkflowRun }>()

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

const conclusion = (): string => {
  const { status, conclusion: c } = props.run
  return status === 'completed'
    ? (c ?? 'unknown')
    : status === 'in_progress'
      ? 'building'
      : 'queued'
}

const isFailed = (): boolean => {
  const c = conclusion()
  return c === 'failure' || c === 'cancelled' || c === 'timed_out'
}

const messageLine = (): string =>
  props.run.head_commit?.message?.split('\n')[0] ?? ''
</script>

<template>
  <header class="deploy-detail-header" :class="{ failed: isFailed() }">
    <p class="message">{{ messageLine() }}</p>
    <DeployHeaderMeta
      :status="conclusion()"
      :author="run.head_commit?.author?.name ?? 'unknown'"
      :sha="run.head_sha.slice(0, 7)"
      :time="formatTime(run.created_at)"
    />
  </header>
</template>

<style scoped>
.deploy-detail-header {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.deploy-detail-header.failed {
  border-color: var(--color-accent);
}

.message {
  margin: 0 0 var(--spacing-xs);
  font-weight: var(--font-weight-bold);
  font-size: clamp(1rem, 2.5vw, 1.125rem);
}
</style>
