<script setup lang="ts">
import LanguagesEditor from '@/components/LanguagesEditor/LanguagesEditor.vue'
import type { LanguageEntry } from '@/stores/settings'

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
  <p class="section-description">
    Configure supported languages for the website.
    Changes apply to all content sections.
  </p>
  <p v-if="loading" class="loading">Loading...</p>
  <LanguagesEditor
    v-else
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
