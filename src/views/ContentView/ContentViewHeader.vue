<script setup lang="ts">
import { useContentStore } from '@/stores/content'
import type { Language } from '@/types/content'
import ContentViewHeaderActions from './ContentViewHeaderActions.vue'

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
    <ContentViewHeaderActions
      v-model="selectedLang"
      :loading="contentStore.loading"
      @refresh="handleRefresh"
    />
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
</style>
