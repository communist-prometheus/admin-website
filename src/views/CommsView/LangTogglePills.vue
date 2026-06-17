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

const onClick = (lang: Lang, event: MouseEvent): void => {
  emit('change', toggleLang(props.langs, lang))
  // `detail === 0` means keyboard (Enter/Space) — keep focus + ring for
  // a11y. A pointer tap/click leaves the button focused and re-renders
  // on save, which some browsers flag as :focus-visible; blur it so no
  // ring lingers after a tap.
  const el = event.currentTarget
  if (event.detail !== 0 && el instanceof HTMLElement) {
    el.blur()
  }
}
</script>

<template>
  <span
    class="lang-toggle"
    data-testid="lang-toggle"
    role="group"
    aria-label="Subscriber languages"
  >
    <button
      v-for="lang in ALL_LANGS"
      :key="lang"
      type="button"
      class="pill"
      :class="{ 'pill-on': langs.includes(lang) }"
      :disabled="disabled"
      :data-testid="`lang-toggle-${lang}`"
      :aria-pressed="langs.includes(lang)"
      @click="onClick(lang, $event)"
    >
      {{ lang }}
    </button>
  </span>
</template>

<style scoped>
.lang-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  max-width: 100%;
  min-width: 0;
}

.pill {
  min-width: 2.5rem;
  min-height: 2rem;
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font: 700 0.8125rem/1 var(--font-sans);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.pill:disabled {
  cursor: not-allowed;
  opacity: 50%;
}

/* Suppress the ring on pointer (tap/click); keep it for keyboard nav. */
.pill:focus {
  outline: none;
}

.pill:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.pill:hover:not(:disabled) {
  color: var(--color-text-primary);
  border-color: var(--color-text-secondary);
}

.pill-on {
  background: var(--color-accent);
  color: var(--color-background);
  border-color: var(--color-accent);
}
</style>
