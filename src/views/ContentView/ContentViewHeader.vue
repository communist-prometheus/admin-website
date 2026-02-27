<script setup lang="ts">
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue'
import type { Language } from '@/types/content'

defineProps<{
  readonly contentType: string
}>()

const selectedLang = defineModel<Language>({ required: true })
</script>

<template>
  <div class="view-header">
    <h1>{{ contentType.charAt(0).toUpperCase() + contentType.slice(1) }}</h1>
    <LanguageSelector v-model="selectedLang" />
  </div>
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
</style>
