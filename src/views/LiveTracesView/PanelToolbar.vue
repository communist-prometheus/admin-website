<script setup lang="ts">
import type { TraceStreamStatus } from '@/composables/useTracing/remote-span'
import { statusLabel } from './status-label'

defineProps<{
  readonly status: TraceStreamStatus
  readonly paused: boolean
  readonly count: number
}>()

defineEmits<{
  readonly pause: []
  readonly resume: []
  readonly clear: []
}>()
</script>

<template>
  <header class="toolbar">
    <span class="status" :data-status="status">
      {{ statusLabel(status) }}
    </span>
    <span class="count">{{ count }} spans</span>
    <span class="spacer" />
    <button
      v-if="paused"
      type="button"
      data-testid="resume-button"
      @click="$emit('resume')"
    >
      Resume
    </button>
    <button
      v-else
      type="button"
      data-testid="pause-button"
      @click="$emit('pause')"
    >
      Pause
    </button>
    <button type="button" data-testid="clear-button" @click="$emit('clear')">
      Clear
    </button>
  </header>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
}

.status {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-background-soft);
}

.status[data-status='open'] {
  background: hsl(140deg 50% 30% / 25%);
}

.status[data-status='reconnecting'] {
  background: hsl(40deg 70% 30% / 25%);
}

.status[data-status='closed'] {
  background: hsl(0deg 50% 30% / 25%);
}

.count {
  color: var(--color-text-secondary);
}

.spacer {
  flex: 1;
}

button {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  cursor: pointer;
}

button:hover {
  background: var(--color-background-soft);
}
</style>
