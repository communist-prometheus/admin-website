<script setup lang="ts">
import type { ContentType, Language } from '@/types/content'

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  it: 'Italiano',
  es: 'Español',
}

defineProps<{
  readonly slug: string
  readonly contentType: ContentType
  readonly currentLang: Language
  readonly availableLanguages: ReadonlySet<Language>
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
      <h1 data-testid="edit-title">{{ slug }}</h1>
    </nav>
    <span class="lang-badge" data-testid="current-language">
      {{ LANG_LABELS[currentLang] }}
    </span>
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

.lang-badge {
  padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-background-soft);
}
</style>
