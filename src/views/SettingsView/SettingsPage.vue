<script setup lang="ts">
import type { LabelEntry } from '@/stores/labels'
import type { LanguageEntry } from '@/stores/settings'
import LabelsSection from './LabelsSection.vue'
import LanguagesSection from './LanguagesSection.vue'
import SettingsHeading from './SettingsHeading.vue'

defineProps<{
  readonly loading: boolean
  readonly languages: readonly LanguageEntry[]
  readonly labels: readonly LabelEntry[]
  readonly labelsLoading: boolean
  readonly saving: boolean
  readonly savingLabels: boolean
}>()

defineEmits<{
  save: [entries: readonly LanguageEntry[]]
  'save-labels': [entries: readonly LabelEntry[]]
}>()
</script>

<template>
  <section class="settings-page">
    <SettingsHeading />
    <LanguagesSection
      :loading="loading"
      :languages="languages"
      :saving="saving"
      @save="$emit('save', $event)"
    />
    <LabelsSection
      :loading="labelsLoading"
      :labels="labels"
      :languages="languages"
      :saving="savingLabels"
      @save="$emit('save-labels', $event)"
    />
  </section>
</template>

<style scoped>
.settings-page {
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 800px;
}
</style>
