<script setup lang="ts">
import type { LanguageEntry } from '@/stores/settings'
import LanguagesSection from './LanguagesSection.vue'
import SettingsHeading from './SettingsHeading.vue'

defineProps<{
  readonly loading: boolean
  readonly languages: readonly LanguageEntry[]
  readonly saving: boolean
}>()

defineEmits<{
  save: [entries: readonly LanguageEntry[]]
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
  </section>
</template>

<style scoped>
.settings-page {
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 800px;
}
</style>
