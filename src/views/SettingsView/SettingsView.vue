<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { type LinkEntry, useLinksStore } from '@/stores/links'
import { type LanguageEntry, useSettingsStore } from '@/stores/settings'
import SettingsPage from './SettingsPage.vue'

const store = useSettingsStore()
const linksStore = useLinksStore()
const saving = ref(false)
const savingLinks = ref(false)

onMounted(() => {
  store.ensureLoaded()
  linksStore.ensureLoaded()
})

const handleSave = async (entries: readonly LanguageEntry[]) => {
  saving.value = true
  try {
    await store.updateLanguages(entries)
  } finally {
    saving.value = false
  }
}

const handleSaveLinks = async (entries: readonly LinkEntry[]) => {
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
      :links="linksStore.entries"
      :link-groups="linksStore.groups"
      :links-loading="linksStore.loading"
      :saving="saving"
      :saving-links="savingLinks"
      @save="handleSave"
      @save-links="handleSaveLinks"
    />
  </AppLayout>
</template>
