<script setup lang="ts">
import { ref } from 'vue'
import type { RunLog } from '@/stores/runs'
import {
  isFailedRun,
  shortTickAt,
  statusBadgeClass,
} from './run-history-ops'

const props = defineProps<{ readonly run: RunLog }>()

const expanded = ref(false)

const onToggle = (): void => {
  if (isFailedRun(props.run.status)) expanded.value = !expanded.value
}
</script>

<template>
  <li
    class="row"
    :class="{ 'row-failed': isFailedRun(props.run.status) }"
    :data-testid="
      isFailedRun(props.run.status) ? 'send-log-failed' : 'send-log-row'
    "
    @click="onToggle"
  >
    <span class="tick">{{ shortTickAt(props.run.tickAt) }}</span>
    <span class="email">{{ props.run.email ?? '—' }}</span>
    <span class="badge" :class="statusBadgeClass(props.run.status)">
      {{ props.run.status }}
    </span>
    <span class="count">{{ props.run.articleCount }}</span>
    <span
      v-if="expanded && props.run.error"
      class="error"
      data-testid="send-log-error"
    >{{ props.run.error }}</span>
  </li>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 8.5rem 1fr 5rem 3rem;
  gap: 0.6rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.8125rem;
  cursor: default;
}

.row-failed {
  cursor: pointer;
  background: rgb(192 57 43 / 8%);
}

.tick {
  color: var(--color-text-secondary);
  font-family: var(--font-mono, monospace);
}

.email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  text-align: center;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  font-size: 0.6875rem;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.badge-sent {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.badge-failed,
.badge-bounced,
.badge-complained {
  color: var(--color-danger, #c0392b);
  border-color: var(--color-danger, #c0392b);
}

.count {
  text-align: right;
  color: var(--color-text-secondary);
}

.error {
  grid-column: 1 / -1;
  color: var(--color-danger, #c0392b);
  font-size: 0.75rem;
}
</style>
