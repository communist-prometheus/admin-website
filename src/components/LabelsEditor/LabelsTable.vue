<script setup lang="ts">
import type { LabelEntry } from '@/stores/labels'
import type { LanguageEntry } from '@/stores/settings'
import LabelRow from './LabelRow.vue'
import LabelsHeaderRow from './LabelsHeaderRow.vue'

defineProps<{
  readonly labels: readonly LabelEntry[]
  readonly languages: readonly LanguageEntry[]
}>()

defineEmits<{
  'update-key': [index: number, value: string]
  'update-translation': [
    index: number,
    lang: string,
    value: string,
  ]
  remove: [index: number]
}>()
</script>

<template>
  <table class="labels-table" data-testid="labels-table">
    <LabelsHeaderRow :languages="languages" />
    <LabelRow
      v-for="(entry, index) in labels"
      :key="index"
      :entry="entry"
      :languages="languages"
      @update-key="$emit('update-key', index, $event)"
      @update-translation="
        (lang, val) =>
          $emit('update-translation', index, lang, val)
      "
      @remove="$emit('remove', index)"
    />
  </table>
</template>

<style scoped>
.labels-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

@media (width < 768px) {
  .labels-table,
  .labels-table :deep(tbody),
  .labels-table :deep(tr),
  .labels-table :deep(td) {
    display: block;
    width: 100%;
    max-width: 100%;
  }

  .labels-table :deep(tr.label-header-row) {
    display: none;
  }

  .labels-table :deep(tr:not(.label-header-row)) {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    background: var(--color-surface, var(--color-background-mute));
    position: relative;
  }

  .labels-table :deep(td) {
    display: grid;
    grid-template-columns: minmax(5rem, auto) 1fr;
    align-items: center;
    gap: 0.5rem 0.75rem;
    padding: 0.25rem 0;
    box-sizing: border-box;
  }

  .labels-table :deep(td::before) {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .labels-table :deep(td.remove-cell) {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.5rem;
    margin-top: 0.25rem;
    border-top: 1px solid var(--color-border);
  }

  .labels-table :deep(td.remove-cell::before) {
    content: none;
  }

  .labels-table :deep(.key-input),
  .labels-table :deep(.translation-input) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}
</style>
