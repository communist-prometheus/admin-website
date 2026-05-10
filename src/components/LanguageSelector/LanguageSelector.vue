<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { Language } from '@/types/content'

const props = defineProps<{
  readonly modelValue: Language
  readonly availableLanguages?: ReadonlySet<Language>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Language]
}>()

const settings = useSettingsStore()
onMounted(() => settings.ensureLoaded())

const langButtonClass = (code: Language) => {
  const isActive = props.modelValue === code
  const exists = props.availableLanguages?.has(code) ?? false
  /* `dimmed` purely indicates "no file yet for this lang". Once
   * the user clicks a dimmed tab, `isActive` overrides — otherwise
   * .active.dimmed combine to ~50% opacity heading-coloured text,
   * which on mobile reads as "click did nothing". The user kept
   * tapping Italian and seeing no visible change (2026-05-10
   * report). Active always wins on visibility. */
  return {
    active: isActive,
    exists,
    dimmed: !isActive && props.availableLanguages !== undefined && !exists,
  }
}

const isMissingTranslation = (): boolean =>
  props.availableLanguages !== undefined &&
  !props.availableLanguages.has(props.modelValue)

const activeLabel = (): string =>
  settings.languages.find(l => l.code === props.modelValue)?.label ??
  props.modelValue
</script>

<template>
  <fieldset class="language-selector" data-testid="language-selector">
    <button
      v-for="entry in settings.languages"
      :key="entry.code"
      type="button"
      class="lang-button"
      :class="langButtonClass(entry.code)"
      :data-lang="entry.code"
      @click="emit('update:modelValue', entry.code)"
    >
      {{ entry.label }}
    </button>
    <p
      v-if="isMissingTranslation()"
      class="missing-hint"
      data-testid="missing-translation-hint"
    >
      No {{ activeLabel() }} version yet — fill in the metadata and Save
      to create one.
    </p>
  </fieldset>
</template>

<style scoped>
.language-selector {
  display: flex;
  flex-wrap: wrap;
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

.missing-hint {
  flex-basis: 100%;
  margin: 0.25rem 0 0;
  padding: 0.25rem 0.5rem;
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
