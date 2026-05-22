<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import type { LabelEntry } from '@/stores/labels'
import { useLabelsStore } from '@/stores/labels'
import type { LinkEntry } from '@/stores/links'
import { useLinksStore } from '@/stores/links'
import type { LanguageEntry } from '@/stores/settings'
import { useSettingsStore } from '@/stores/settings'
import SettingsPage from './SettingsPage.vue'

const store = useSettingsStore()
const labelsStore = useLabelsStore()
const linksStore = useLinksStore()
const saving = ref(false)
const savingLabels = ref(false)
const savingLinks = ref(false)

onMounted(() => {
  store.ensureLoaded()
  labelsStore.ensureLoaded()
  linksStore.ensureLoaded()
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

const handleSaveLinks = async (
  entries: readonly LinkEntry[]
) => {
  savingLinks.value = true
  try {
    await linksStore.updateLinks(entries)
  } finally {
    savingLinks.value = false
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
      :links="linksStore.entries"
      :link-groups="linksStore.groups"
      :links-loading="linksStore.loading"
      :saving="saving"
      :saving-labels="savingLabels"
      :saving-links="savingLinks"
      @save="handleSave"
      @save-labels="handleSaveLabels"
      @save-links="handleSaveLinks"
    />
  </AppLayout>
</template>
