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
  padding: clamp(0.5rem, 1.5vw, 1rem) clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid var(--color-border);
}
</style>
