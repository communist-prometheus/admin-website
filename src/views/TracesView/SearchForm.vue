<script setup lang="ts">
import type { SearchFilters } from '@/composables/useTraceSearch/search-types'
import StatusField from './StatusField.vue'
import TextField from './TextField.vue'

const props = defineProps<{
  readonly filters: SearchFilters
  readonly loading: boolean
}>()

const emit = defineEmits<{
  readonly submit: []
  readonly reset: []
  readonly update: [next: SearchFilters]
}>()

const set = <K extends keyof SearchFilters>(
  key: K,
  value: SearchFilters[K]
): void => {
  emit('update', { ...props.filters, [key]: value })
}
</script>

<template>
  <form
    class="search-form"
    data-testid="trace-search-form"
    @submit.prevent="emit('submit')"
  >
    <TextField
      label="Free text"
      :value="filters.q"
      testid="filter-q"
      @update="v => set('q', v)"
    />
    <TextField
      label="Org"
      :value="filters.org"
      testid="filter-org"
      @update="v => set('org', v)"
    />
    <TextField
      label="Repo"
      :value="filters.repo"
      testid="filter-repo"
      @update="v => set('repo', v)"
    />
    <StatusField
      :value="filters.status"
      @update="v => set('status', v)"
    />
    <button type="submit" data-testid="search-button" :disabled="loading">
      Search
    </button>
    <button
      type="button"
      data-testid="reset-button"
      :disabled="loading"
      @click="emit('reset')"
    >
      Reset
    </button>
  </form>
</template>

<style scoped>
.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  align-items: end;
}

button {
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  cursor: pointer;
}

button:disabled {
  opacity: 50%;
  cursor: not-allowed;
}
</style>
