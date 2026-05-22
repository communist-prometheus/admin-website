<script setup lang="ts">
import type { LabelEntry } from '@/stores/labels'
import type { LinkEntry } from '@/stores/links'
import type { LanguageEntry } from '@/stores/settings'
import ActionHistorySection from './ActionHistorySection.vue'
import LabelsSection from './LabelsSection.vue'
import LanguagesSection from './LanguagesSection.vue'
import LinksSection from './LinksSection.vue'
import MembersSection from './MembersSection.vue'
import SettingsHeading from './SettingsHeading.vue'

defineProps<{
  readonly loading: boolean
  readonly languages: readonly LanguageEntry[]
  readonly labels: readonly LabelEntry[]
  readonly labelsLoading: boolean
  readonly links: readonly LinkEntry[]
  readonly linkGroups: readonly string[]
  readonly linksLoading: boolean
  readonly saving: boolean
  readonly savingLabels: boolean
  readonly savingLinks: boolean
}>()

defineEmits<{
  save: [entries: readonly LanguageEntry[]]
  'save-labels': [entries: readonly LabelEntry[]]
  'save-links': [entries: readonly LinkEntry[]]
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
    <LinksSection
      :loading="linksLoading"
      :entries="links"
      :groups="linkGroups"
      :languages="languages"
      :saving="savingLinks"
      @save="$emit('save-links', $event)"
    />
    <MembersSection />
    <ActionHistorySection />
  </section>
</template>

<style scoped>
.settings-page {
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 800px;
}
</style>
