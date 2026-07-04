<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { type LinkEntry, useLinksStore } from '@/stores/links'
import { useSettingsStore } from '@/stores/settings'
import LinksSection from '../LinksSection.vue'

const linksStore = useLinksStore()
const settingsStore = useSettingsStore()
const saving = ref(false)

onMounted(() => {
  linksStore.ensureLoaded()
  /* Languages are cross-referenced when rendering the per-lang rows. */
  settingsStore.ensureLoaded()
})

const onSave = async (entries: readonly LinkEntry[]): Promise<void> => {
  saving.value = true
  try {
    await linksStore.updateLinks(entries)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <LinksSection
    :loading="linksStore.loading"
    :entries="linksStore.entries"
    :groups="linksStore.groups"
    :languages="settingsStore.languages"
    :saving="saving"
    @save="onSave"
  />
</template>
