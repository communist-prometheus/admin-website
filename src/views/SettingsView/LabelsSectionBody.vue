<script setup lang="ts">
import LabelsEditor from '@/components/LabelsEditor/LabelsEditor.vue'
import type { LabelEntry } from '@/stores/labels'
import type { LanguageEntry } from '@/stores/settings'

defineProps<{
  readonly loading: boolean
  readonly labels: readonly LabelEntry[]
  readonly languages: readonly LanguageEntry[]
  readonly saving: boolean
}>()

defineEmits<{
  save: [entries: readonly LabelEntry[]]
}>()
</script>

<template>
  <p class="section-description">
    Configure labels for content categories.
    Each label can be translated per language.
  </p>
  <p v-if="loading" class="loading">Loading...</p>
  <LabelsEditor
    v-else
    :labels="labels"
    :languages="languages"
    :saving="saving"
    @save="$emit('save', $event)"
  />
</template>

<style scoped>
.section-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
}

.loading {
  color: var(--color-text-secondary);
}
</style>
