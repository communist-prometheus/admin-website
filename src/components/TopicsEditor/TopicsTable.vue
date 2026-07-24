<script setup lang="ts">
import type { LanguageEntry } from '@/stores/settings'
import type { TopicEntry } from '@/stores/topics'
import TopicRow from './TopicRow.vue'
import TopicsHeaderRow from './TopicsHeaderRow.vue'

defineProps<{
  readonly topics: readonly TopicEntry[]
  readonly languages: readonly LanguageEntry[]
}>()

defineEmits<{
  'update-key': [index: number, value: string]
  'update-color': [index: number, value: string]
  'update-name': [index: number, lang: string, value: string]
  'update-subtitle': [index: number, lang: string, value: string]
  'update-description': [index: number, lang: string, value: string]
  remove: [index: number]
}>()
</script>

<template>
  <table class="topics-table" data-testid="topics-table">
    <TopicsHeaderRow :languages="languages" />
    <TopicRow
      v-for="(entry, index) in topics"
      :key="index"
      :entry="entry"
      :languages="languages"
      @update-key="$emit('update-key', index, $event)"
      @update-color="$emit('update-color', index, $event)"
      @update-name="(lang, val) => $emit('update-name', index, lang, val)"
      @update-subtitle="
        (lang, val) => $emit('update-subtitle', index, lang, val)
      "
      @update-description="
        (lang, val) => $emit('update-description', index, lang, val)
      "
      @remove="$emit('remove', index)"
    />
  </table>
</template>

<style scoped>
.topics-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

@media (width < 768px) {
  .topics-table,
  .topics-table :deep(tbody),
  .topics-table :deep(tr),
  .topics-table :deep(td) {
    display: block;
    width: 100%;
    max-width: 100%;
  }

  .topics-table :deep(tr.topic-header-row) {
    display: none;
  }

  .topics-table :deep(tr:not(.topic-header-row)) {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    background: var(--color-surface, var(--color-background-mute));
    position: relative;
  }

  .topics-table :deep(td) {
    display: grid;
    grid-template-columns: minmax(5rem, auto) 1fr;
    align-items: center;
    gap: 0.5rem 0.75rem;
    padding: 0.25rem 0;
    box-sizing: border-box;
  }

  .topics-table :deep(td::before) {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .topics-table :deep(td.remove-cell) {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.5rem;
    margin-top: 0.25rem;
    border-top: 1px solid var(--color-border);
  }

  .topics-table :deep(td.remove-cell::before) {
    content: none;
  }

  .topics-table :deep(.key-input),
  .topics-table :deep(.lang-input) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}
</style>
