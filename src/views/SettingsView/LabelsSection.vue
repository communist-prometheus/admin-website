<script setup lang="ts">
import type { LabelEntry } from '@/stores/labels'
import type { LanguageEntry } from '@/stores/settings'
import LabelsSectionBody from './LabelsSectionBody.vue'

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
  <section class="labels-section">
    <h2>Labels</h2>
    <LabelsSectionBody
      :loading="loading"
      :labels="labels"
      :languages="languages"
      :saving="saving"
      @save="$emit('save', $event)"
    />
  </section>
</template>

<style scoped>
.labels-section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
</style>
