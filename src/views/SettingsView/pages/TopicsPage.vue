<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { type TopicEntry, useTopicsStore } from '@/stores/topics'
import TopicsSection from '../TopicsSection.vue'

const topicsStore = useTopicsStore()
const settingsStore = useSettingsStore()
const saving = ref(false)

onMounted(() => {
  topicsStore.ensureLoaded()
  /* Languages come from the settings store — names/subtitles are per-language. */
  settingsStore.ensureLoaded()
})

const onSave = async (entries: readonly TopicEntry[]): Promise<void> => {
  saving.value = true
  try {
    await topicsStore.updateTopics(entries)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <TopicsSection
    :loading="topicsStore.loading"
    :topics="topicsStore.topics"
    :languages="settingsStore.languages"
    :saving="saving"
    @save="onSave"
  />
</template>
