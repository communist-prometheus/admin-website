<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { type LabelEntry, useLabelsStore } from '@/stores/labels'
import { useSettingsStore } from '@/stores/settings'
import LabelsSectionBody from '../SettingsView/LabelsSectionBody.vue'

const labelsStore = useLabelsStore()
const settingsStore = useSettingsStore()
const saving = ref(false)

onMounted(() => {
  labelsStore.ensureLoaded()
  /* Languages come from the settings store — labels are per-language. */
  settingsStore.ensureLoaded()
})

const handleSave = async (
  entries: readonly LabelEntry[]
): Promise<void> => {
  saving.value = true
  try {
    await labelsStore.updateLabels(entries)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppLayout>
    <h1 class="page-title">Labels</h1>
    <p class="page-hint">
      Tags shown on cards across the site. Editors can add, rename, and
      delete labels — the values are shared across languages via the
      per-language rows below.
    </p>
    <LabelsSectionBody
      :loading="labelsStore.loading"
      :labels="labelsStore.labels"
      :languages="settingsStore.languages"
      :saving="saving"
      @save="handleSave"
    />
  </AppLayout>
</template>

<style scoped>
.page-title {
  margin: clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem) 0.25rem;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
}

.page-hint {
  margin: 0 clamp(1rem, 3vw, 2rem) 1rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  max-inline-size: 60rem;
}
</style>
