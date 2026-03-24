<script setup lang="ts">
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue'
import type { ContentType, Language } from '@/types/content'
import ContentEditHeaderNav from './ContentEditHeaderNav.vue'

defineProps<{
  readonly slug: string
  readonly contentType: ContentType
  readonly currentLang: Language
  readonly availableLanguages: ReadonlySet<Language>
  readonly renameable?: boolean
}>()

const emit = defineEmits<{
  'switch-lang': [lang: Language]
  rename: [newSlug: string]
}>()
</script>

<template>
  <header class="edit-header">
    <ContentEditHeaderNav
      :slug="slug"
      :content-type="contentType"
      :renameable="renameable"
      @rename="emit('rename', $event)"
    />
    <LanguageSelector
      :model-value="currentLang"
      :available-languages="availableLanguages"
      @update:model-value="emit('switch-lang', $event)"
    />
  </header>
</template>

<style scoped>
.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid var(--color-border);
  gap: 1rem;
}
</style>
