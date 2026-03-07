<script setup lang="ts">
import type { Language } from '@/types/content'
import { LANGUAGES } from '@/types/content'

const props = defineProps<{
  readonly modelValue: Language
  readonly availableLanguages?: ReadonlySet<Language>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Language]
}>()

const labels: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  it: 'Italiano',
  es: 'Español',
}

const langButtonClass = (code: Language) => ({
  active: props.modelValue === code,
  exists: props.availableLanguages?.has(code) ?? false,
  dimmed: props.availableLanguages !== undefined && !props.availableLanguages.has(code),
})
</script>

<template>
  <div class="language-selector" data-testid="language-selector">
    <button
      v-for="code in LANGUAGES"
      :key="code"
      type="button"
      class="lang-button"
      :class="langButtonClass(code)"
      :data-lang="code"
      @click="emit('update:modelValue', code)"
    >
      {{ labels[code] }}
    </button>
  </div>
</template>

<style scoped>
.language-selector {
  display: flex;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  padding: clamp(0.5rem, 1.5vw, 1rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
}

.lang-button {
  padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem);
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  font-weight: 500;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-background-soft);
  }

  &.active {
    background: var(--color-background-mute);
    color: var(--color-heading);
  }

  &.exists::after {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent, #4caf50);
    margin: 2px auto 0;
  }

  &.dimmed {
    opacity: 50%;
  }
}
</style>
