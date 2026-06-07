<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RunLog } from '@/stores/runs'
import { isFailedRun, shortTickAt, statusBadgeClass } from './run-history-ops'

const props = defineProps<{ readonly run: RunLog }>()

const expanded = ref(false)

const expandable = computed(
  () => isFailedRun(props.run.status) && props.run.error !== undefined
)
const errorId = computed(() => `run-error-${props.run.id}`)

const onActivate = (): void => {
  if (expandable.value) expanded.value = !expanded.value
}

const onKey = (e: KeyboardEvent): void => {
  if (!expandable.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    expanded.value = !expanded.value
  }
}

const ICON: Readonly<Record<RunLog['status'], string>> = {
  sent: '✓',
  failed: '✕',
  bounced: '✕',
  complained: '✕',
  skipped: '·',
}
</script>

<template>
  <tr
    class="row"
    :class="{ 'row-failed': isFailedRun(run.status), 'is-expanded': expanded }"
    :data-testid="
      isFailedRun(run.status) ? 'send-log-failed' : 'send-log-row'
    "
    :role="expandable ? 'button' : undefined"
    :tabindex="expandable ? 0 : undefined"
    :aria-expanded="expandable ? expanded : undefined"
    :aria-controls="expandable ? errorId : undefined"
    @click="onActivate"
    @keydown="onKey"
  >
    <td class="tick">{{ shortTickAt(run.tickAt) }}</td>
    <td class="email">{{ run.email ?? '—' }}</td>
    <td>
      <span
        class="badge"
        :class="statusBadgeClass(run.status)"
        :aria-label="`Run status: ${run.status}`"
      >
        <span class="badge-icon" aria-hidden="true">{{ ICON[run.status] }}</span>
        <span>{{ run.status }}</span>
      </span>
    </td>
    <td class="count">{{ run.articleCount }}</td>
  </tr>
  <tr
    v-if="expanded && run.error"
    :id="errorId"
    class="error-row"
    data-testid="send-log-error"
  >
    <td colspan="4">{{ run.error }}</td>
  </tr>
</template>

<style scoped>
.row {
  border-top: 1px solid var(--color-border);
  font-size: 0.8125rem;
  color: var(--color-text-primary);
}

.row td {
  padding: var(--spacing-xs);
  vertical-align: middle;
}

.row:hover {
  background: var(--color-surface-hover);
}

.row-failed {
  cursor: pointer;
  background: var(--color-danger-subtle);
}

.row-failed:hover {
  background: var(--color-danger-subtle);
}

.row[tabindex='0']:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: -2px;
}

.tick {
  font-family: var(--font-mono);
  color: var(--color-text-secondary);
}

.email {
  font-family: var(--font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count {
  text-align: right;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid currentcolor;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.06em;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.badge-icon {
  font-size: 0.65rem;
  line-height: 1;
}

.badge-sent {
  color: var(--color-success);
}

.badge-failed,
.badge-bounced,
.badge-complained {
  color: var(--color-danger);
}

.badge-skipped {
  color: var(--color-warning);
}

.error-row {
  background: var(--color-danger-subtle);
}

.error-row td {
  padding: var(--spacing-xs) var(--spacing-md);
  color: var(--color-danger);
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

@media (width < 640px) {
  .error-row {
    display: block;
  }

  .error-row td {
    padding: var(--spacing-xs);
  }

  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'email status'
      'tick count';
    gap: 0.25rem var(--spacing-xs);
    padding: var(--spacing-sm) 0;
  }

  .row td {
    padding: 0;
  }

  .row .email {
    grid-area: email;
    white-space: normal;
    word-break: break-all;
    font-size: 0.9375rem;
  }

  .row td:nth-of-type(3) {
    grid-area: status;
    text-align: right;
  }

  .row .tick {
    grid-area: tick;
    font-size: 0.75rem;
  }

  .row .count {
    grid-area: count;
    font-size: 0.75rem;
  }

  .row .count::before {
    content: 'Articles: ';
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.65rem;
    margin-right: 0.25rem;
  }
}
</style>
