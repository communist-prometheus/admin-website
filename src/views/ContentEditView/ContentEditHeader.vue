<script setup lang="ts">
import EditableSlug from '@/components/common/EditableSlug.vue'
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue'
import type { ContentType, Language } from '@/types/content'

defineProps<{
  readonly slug: string
  readonly contentType: ContentType
  readonly currentLang: Language
  readonly availableLanguages: ReadonlySet<Language>
}>()

const emit = defineEmits<{
  'switch-lang': [lang: Language]
  rename: [newSlug: string]
}>()
</script>

<template>
  <header class="edit-header">
    <nav class="edit-header-left">
      <RouterLink
        :to="`/content/${contentType}`"
        class="back-link"
        data-testid="back-button"
      >
        &larr; Back
      </RouterLink>
      <EditableSlug
        :slug="slug"
        @rename="emit('rename', $event)"
      />
    </nav>
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

.edit-header-left {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 1rem);
}

.back-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: clamp(0.875rem, 2vw, 1rem);

  &:hover {
    color: var(--color-text);
  }
}

h1 {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
}
</style>
