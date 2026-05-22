<script setup lang="ts">
import type { LinkEntry } from '@/stores/links'
import type { LanguageEntry } from '@/stores/settings'
import LinksSectionBody from './LinksSectionBody.vue'

defineProps<{
  readonly loading: boolean
  readonly entries: readonly LinkEntry[]
  readonly groups: readonly string[]
  readonly languages: readonly LanguageEntry[]
  readonly saving: boolean
}>()

defineEmits<{
  save: [entries: readonly LinkEntry[]]
}>()
</script>

<template>
  <section class="links-section">
    <h2>Links</h2>
    <LinksSectionBody
      :loading="loading"
      :entries="entries"
      :groups="groups"
      :languages="languages"
      :saving="saving"
      @save="$emit('save', $event)"
    />
  </section>
</template>

<style scoped>
.links-section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
</style>
