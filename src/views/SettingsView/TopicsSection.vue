<script setup lang="ts">
import type { LanguageEntry } from '@/stores/settings'
import type { TopicEntry } from '@/stores/topics'
import TopicsSectionBody from './TopicsSectionBody.vue'

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
  <section class="topics-section">
    <h2>Topics</h2>
    <TopicsSectionBody
      :loading="loading"
      :topics="topics"
      :languages="languages"
      :saving="saving"
      @save="$emit('save', $event)"
    />
  </section>
</template>

<style scoped>
.topics-section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
</style>
