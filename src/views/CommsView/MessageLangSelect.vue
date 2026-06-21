<script setup lang="ts">
import type { Lang } from '@/stores/comms'
import { ALL_LANGS } from './draft-ops'
import { langLabel } from './lang-labels'

const props = defineProps<{
  readonly modelValue: Lang
  readonly disabled?: boolean
  readonly label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [lang: Lang]
}>()

const onChange = (event: Event): void => {
  const value = (event.target as HTMLSelectElement).value as Lang
  emit('update:modelValue', value)
}
</script>

<template>
  <select
    class="msg-lang"
    data-testid="message-lang-select"
    :value="props.modelValue"
    :disabled="props.disabled"
    :aria-label="props.label ?? 'Message language'"
    @change="onChange"
  >
    <option v-for="lang in ALL_LANGS" :key="lang" :value="lang">
      {{ langLabel(lang) }}
    </option>
  </select>
</template>

<style scoped>
.msg-lang {
  appearance: none;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 0.4rem 1.6rem 0.4rem 0.6rem;
  background:
    var(--color-surface-elevated)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23888' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")
    no-repeat right 0.6rem center;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: 400 0.85rem/1.3 var(--font-sans);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.msg-lang:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-color: var(--color-focus-ring);
}

.msg-lang:disabled {
  cursor: not-allowed;
  opacity: 50%;
}

.msg-lang:hover:not(:disabled) {
  border-color: var(--color-text-secondary);
}
</style>
