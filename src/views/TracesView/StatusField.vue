<script setup lang="ts">
import type { SearchFilters } from '@/composables/useTraceSearch/search-types'

defineProps<{
  readonly value: SearchFilters['status']
}>()

defineEmits<{
  readonly update: [next: SearchFilters['status']]
}>()

const isStatus = (v: string): v is SearchFilters['status'] =>
  v === '' || v === 'ok' || v === 'error' || v === 'unset'

const onChange = (
  emit: (e: 'update', next: SearchFilters['status']) => void,
  event: Event
): void => {
  const raw = (event.target as HTMLSelectElement).value
  const next = isStatus(raw) ? raw : ''
  emit('update', next)
}
</script>

<template>
  <label class="status-field">
    <span class="status-field-label">Status</span>
    <select
      :value="value"
      data-testid="filter-status"
      @change="event => onChange($emit, event)"
    >
      <option value="">Any</option>
      <option value="ok">ok</option>
      <option value="error">error</option>
      <option value="unset">unset</option>
    </select>
  </label>
</template>

<style scoped>
.status-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.status-field-label {
  color: var(--color-text-secondary);
}

select {
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
}
</style>
