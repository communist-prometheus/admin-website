<script setup lang="ts">
import { COMMON_TIMEZONES } from './tz-list'

const props = defineProps<{
  readonly modelValue: string
  readonly disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onChange = (e: Event): void => {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <label class="field">
    <span class="field-label">Timezone</span>
    <select
      :value="props.modelValue"
      class="field-select tz"
      data-testid="schedule-timezone"
      :disabled="props.disabled"
      @change="onChange"
    >
      <option v-for="tz in COMMON_TIMEZONES" :key="tz" :value="tz">
        {{ tz }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.field {
  display: grid;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.field-select {
  appearance: none;
  width: 100%;
  padding: 0.55rem 0.85rem;
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: 400 0.95rem/1.4 var(--font-sans);
  transition: border-color var(--transition-fast);
}

.field-select:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-color: var(--color-focus-ring);
}

.field-select:hover:not(:disabled) {
  border-color: var(--color-text-secondary);
}

.tz {
  font-family: var(--font-mono);
}
</style>
