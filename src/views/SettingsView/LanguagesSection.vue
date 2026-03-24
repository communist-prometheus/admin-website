<script setup lang="ts">
import type { LanguageEntry } from '@/stores/settings'
import LanguagesSectionBody from './LanguagesSectionBody.vue'

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
  <section class="languages-section">
    <h2>Languages</h2>
    <LanguagesSectionBody
      :loading="loading"
      :languages="languages"
      :saving="saving"
      @save="$emit('save', $event)"
    />
  </section>
</template>

<style scoped>
.languages-section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
</style>
