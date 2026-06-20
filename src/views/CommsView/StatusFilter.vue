<script setup lang="ts">
import { STATUS_ORDER, type StatusFilterValue } from './status-counts'
import type { SubscriberStatus } from './status-meta'
import { STATUS_META } from './status-meta'

const props = defineProps<{
  readonly modelValue: StatusFilterValue
  readonly counts: Readonly<Record<SubscriberStatus, number>>
  readonly total: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StatusFilterValue]
}>()

const select = (value: StatusFilterValue): void => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div
    class="status-filter"
    role="group"
    aria-label="Filter subscribers by status"
    data-testid="status-filter"
  >
    <button
      type="button"
      class="chip"
      :class="{ 'chip-on': props.modelValue === 'all' }"
      :aria-pressed="props.modelValue === 'all'"
      data-testid="status-filter-all"
      @click="select('all')"
    >
      All ({{ props.total }})
    </button>
    <button
      v-for="status in STATUS_ORDER"
      :key="status"
      type="button"
      class="chip"
      :class="[`chip-${status}`, { 'chip-on': props.modelValue === status }]"
      :aria-pressed="props.modelValue === status"
      :data-testid="`status-filter-${status}`"
      @click="select(status)"
    >
      {{ STATUS_META[status].label }} ({{ props.counts[status] }})
    </button>
  </div>
</template>

<style scoped>
.status-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.chip {
  padding: 0.35rem 0.7rem;
  border-radius: var(--radius-pill, 999px);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font: 600 0.8125rem/1 var(--font-sans);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.chip:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.chip:hover:not(:disabled) {
  color: var(--color-text-primary);
  border-color: var(--color-text-secondary);
}

.chip-on {
  background: var(--color-accent);
  color: var(--color-background);
  border-color: var(--color-accent);
}
</style>
