<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  readonly modelValue: 'en' | 'ru' | 'it' | 'es'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: 'en' | 'ru' | 'it' | 'es']
}>()

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
] as const

const selectedLanguage = computed(() =>
  languages.find(lang => lang.code === props.modelValue)
)

const handleChange = (code: 'en' | 'ru' | 'it' | 'es') => {
  emit('update:modelValue', code)
}
</script>

<template>
  <div class="language-selector">
    <button
      v-for="lang in languages"
      :key="lang.code"
      type="button"
      class="lang-button"
      :class="{ active: modelValue === lang.code }"
      @click="handleChange(lang.code)"
    >
      {{ lang.label }}
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
}
</style>
