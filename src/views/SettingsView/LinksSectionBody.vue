<script setup lang="ts">
import LinksEditor from '@/components/LinksEditor/LinksEditor.vue'
import type { LinkEntry } from '@/stores/links'
import type { LanguageEntry } from '@/stores/settings'

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
  <p class="section-description">
    Manage the curated links directory and webring membership.
    Each link can be described per language.
  </p>
  <p v-if="loading" class="loading">Loading...</p>
  <LinksEditor
    v-else
    :entries="entries"
    :groups="groups"
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
