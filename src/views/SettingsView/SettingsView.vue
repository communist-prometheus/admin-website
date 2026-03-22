<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AuthButton from '@/components/AuthButton.vue'
import LanguagesEditor from '@/components/LanguagesEditor/LanguagesEditor.vue'
import type { LanguageEntry } from '@/stores/settings'
import { useSettingsStore } from '@/stores/settings'

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
    <template #header-actions>
      <AuthButton />
    </template>

    <div class="settings-page">
      <h1>Settings</h1>

      <section class="settings-section">
        <h2>Languages</h2>
        <p class="section-description">
          Configure supported languages for the website.
          Changes apply to all content sections.
        </p>

        <div v-if="store.loading" class="loading">Loading...</div>
        <LanguagesEditor
          v-else
          :languages="store.languages"
          :saving="saving"
          @save="handleSave"
        />
      </section>
    </div>
  </AppLayout>
</template>

<style scoped>
.settings-page {
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 800px;
}

h1 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: 2rem;
}

.settings-section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.section-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
}

.loading {
  color: var(--color-text-secondary);
}
</style>
