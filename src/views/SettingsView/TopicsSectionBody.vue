<script setup lang="ts">
import TopicsEditor from '@/components/TopicsEditor/TopicsEditor.vue'
import type { LanguageEntry } from '@/stores/settings'
import type { TopicEntry } from '@/stores/topics'

defineProps<{
  readonly loading: boolean
  readonly topics: readonly TopicEntry[]
  readonly languages: readonly LanguageEntry[]
  readonly saving: boolean
}>()

defineEmits<{
  save: [entries: readonly TopicEntry[]]
}>()
</script>

<template>
  <p class="section-description">
    Editorial topics mark articles as editorial pieces, translations or
    likbez readers. Each topic has a colour plus a per-language name and
    subtitle (приписка) shown on the article header and cards.
  </p>
  <p v-if="loading" class="loading">Loading...</p>
  <TopicsEditor
    v-else
    :topics="topics"
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
