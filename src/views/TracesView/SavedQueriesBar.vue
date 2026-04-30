<script setup lang="ts">
import type { SavedQuery } from '@/composables/useTraceSearch/saved-queries-store'

defineProps<{
  readonly queries: ReadonlyArray<SavedQuery>
}>()

defineEmits<{
  readonly save: []
  readonly load: [name: string]
  readonly rename: [name: string]
  readonly remove: [name: string]
}>()
</script>

<template>
  <nav class="saved-queries">
    <button
      type="button"
      data-testid="saved-save-button"
      @click="$emit('save')"
    >
      Save current
    </button>
    <select
      v-if="queries.length > 0"
      data-testid="saved-load-select"
      @change="$emit('load', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">Load saved…</option>
      <option v-for="q in queries" :key="q.name" :value="q.name">
        {{ q.name }}
      </option>
    </select>
    <select
      v-if="queries.length > 0"
      data-testid="saved-manage-select"
      @change="$emit('rename', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">Rename…</option>
      <option v-for="q in queries" :key="q.name" :value="q.name">
        {{ q.name }}
      </option>
    </select>
    <select
      v-if="queries.length > 0"
      data-testid="saved-remove-select"
      @change="$emit('remove', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">Delete…</option>
      <option v-for="q in queries" :key="q.name" :value="q.name">
        {{ q.name }}
      </option>
    </select>
  </nav>
</template>

<style scoped>
.saved-queries {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
  flex-wrap: wrap;
}

button,
select {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}
</style>
