<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import type { LabelEntry } from '@/stores/labels'
import { useLabelsStore } from '@/stores/labels'
import type { LanguageEntry } from '@/stores/settings'
import { useSettingsStore } from '@/stores/settings'
import SettingsPage from './SettingsPage.vue'

const store = useSettingsStore()
const labelsStore = useLabelsStore()
const saving = ref(false)
const savingLabels = ref(false)

onMounted(() => {
  store.ensureLoaded()
  labelsStore.ensureLoaded()
})

const handleSave = async (
  entries: readonly LanguageEntry[]
) => {
  saving.value = true
  try {
    await store.updateLanguages(entries)
  } finally {
    saving.value = false
  }
}

const handleSaveLabels = async (
  entries: readonly LabelEntry[]
) => {
  savingLabels.value = true
  try {
    await labelsStore.updateLabels(entries)
  } finally {
    savingLabels.value = false
  }
}
</script>

<template>
  <AppLayout>
    <SettingsPage
      :loading="store.loading"
      :languages="store.languages"
      :labels="labelsStore.labels"
      :labels-loading="labelsStore.loading"
      :saving="saving"
      :saving-labels="savingLabels"
      @save="handleSave"
      @save-labels="handleSaveLabels"
    />
  </AppLayout>
</template>
