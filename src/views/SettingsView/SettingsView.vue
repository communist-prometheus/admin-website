<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import type { LanguageEntry } from '@/stores/settings'
import { useSettingsStore } from '@/stores/settings'
import SettingsPage from './SettingsPage.vue'

const store = useSettingsStore()
const saving = ref(false)

onMounted(() => store.ensureLoaded())

const handleSave = async (entries: readonly LanguageEntry[]) => {
  saving.value = true
  try {
    await store.updateLanguages(entries)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppLayout>
    <SettingsPage
      :loading="store.loading"
      :languages="store.languages"
      :saving="saving"
      @save="handleSave"
    />
  </AppLayout>
</template>
