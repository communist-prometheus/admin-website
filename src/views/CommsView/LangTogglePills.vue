<script setup lang="ts">
import type { Lang } from '@/stores/comms'
import { ALL_LANGS, toggleLang } from './draft-ops'

const props = defineProps<{
  readonly langs: readonly Lang[]
  readonly disabled?: boolean
}>()

const emit = defineEmits<{
  change: [langs: readonly Lang[]]
}>()

const onClick = (lang: Lang): void => {
  emit('change', toggleLang(props.langs, lang))
}
</script>

<template>
  <span class="lang-toggle" data-testid="lang-toggle">
    <button
      v-for="lang in ALL_LANGS"
      :key="lang"
      type="button"
      class="pill"
      :class="{ 'pill-on': langs.includes(lang) }"
      :disabled="disabled"
      :data-testid="`lang-toggle-${lang}`"
      :aria-pressed="langs.includes(lang)"
      @click="onClick(lang)"
    >
      {{ lang }}
    </button>
  </span>
</template>

<style scoped>
.lang-toggle {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.pill {
  font-size: 0.6875rem;
  letter-spacing: 0.05em;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  text-transform: uppercase;
}

.pill-on {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.pill:disabled {
  cursor: not-allowed;
  opacity: 50%;
}
</style>
