<script setup lang="ts">
import type { LinkEntry } from '@/stores/links'
import type { LanguageEntry } from '@/stores/settings'
import ActionHistorySection from './ActionHistorySection.vue'
import HardResetSection from './HardResetSection.vue'
import LanguagesSection from './LanguagesSection.vue'
import LinksSection from './LinksSection.vue'
import MembersSection from './MembersSection.vue'
import SettingsHeading from './SettingsHeading.vue'

defineProps<{
  readonly loading: boolean
  readonly languages: readonly LanguageEntry[]
  readonly links: readonly LinkEntry[]
  readonly linkGroups: readonly string[]
  readonly linksLoading: boolean
  readonly saving: boolean
  readonly savingLinks: boolean
}>()

defineEmits<{
  save: [entries: readonly LanguageEntry[]]
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
    <HardResetSection />
  </section>
</template>

<style scoped>
.settings-page {
  padding: clamp(1rem, 3vw, 2rem);
  max-inline-size: 800px;
}
</style>
