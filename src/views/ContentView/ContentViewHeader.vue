<script setup lang="ts">
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue'
import { useContentStore } from '@/stores/content'
import type { Language } from '@/types/content'

defineProps<{
  readonly contentType: string
}>()

const selectedLang = defineModel<Language>({ required: true })
const contentStore = useContentStore()
const handleRefresh = () => { contentStore.loadAll() }
</script>

<template>
  <header class="view-header">
    <h1>{{ contentType.charAt(0).toUpperCase() + contentType.slice(1) }}</h1>
    <nav class="view-header-actions">
      <button
        type="button"
        class="refresh-btn"
        data-testid="refresh-button"
        :disabled="contentStore.loading"
        @click="handleRefresh"
      >
        Refresh
      </button>
      <LanguageSelector v-model="selectedLang" />
    </nav>
  </header>
</template>

<style scoped>
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(1rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid var(--color-border);
}

h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  text-transform: capitalize;
}

.view-header-actions {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 1rem);
}

.refresh-btn {
  padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 50%;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: var(--color-background-soft);
  }
}
</style>
