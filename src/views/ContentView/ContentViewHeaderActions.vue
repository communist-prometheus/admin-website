<script setup lang="ts">
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue'
import type { Language } from '@/types/content'

defineProps<{
  readonly loading: boolean
}>()

const selectedLang = defineModel<Language>({ required: true })

defineEmits<{
  refresh: []
}>()
</script>

<template>
  <nav class="view-header-actions">
    <button
      type="button"
      class="refresh-btn"
      data-testid="refresh-button"
      :disabled="loading"
      @click="$emit('refresh')"
    >
      Refresh
    </button>
    <LanguageSelector v-model="selectedLang" />
  </nav>
</template>

<style scoped>
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
