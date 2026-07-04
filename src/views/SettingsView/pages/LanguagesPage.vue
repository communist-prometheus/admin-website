<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { type LanguageEntry, useSettingsStore } from '@/stores/settings'
import LanguagesSection from '../LanguagesSection.vue'

const store = useSettingsStore()
const saving = ref(false)

onMounted(() => store.ensureLoaded())

const onSave = async (entries: readonly LanguageEntry[]): Promise<void> => {
  saving.value = true
  try {
    await store.updateLanguages(entries)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <LanguagesSection
    :loading="store.loading"
    :languages="store.languages"
    :saving="saving"
    @save="onSave"
  />
</template>
