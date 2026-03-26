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
</style>
